// Karmora scanner — main entry point.
//
// Flow per run:
//   1. Load active projects from Supabase
//   2. For each project, fetch posts from its target subreddits
//   3. Upsert raw posts (dedupe by reddit_id)
//   4. Run pattern matcher on new posts for this project
//   5. For candidates (pattern_score > 0), send to LLM scorer
//   6. Write leads to DB
//   7. Log scan_run + Telegram summary
//
// Invocations:
//   node index.js --once    # single run, for cron
//   node index.js            # loop forever with delay (for dev)

import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { fetchManySubreddits, sleep } from './reddit.js';
import { loadProxies, getProxyCount } from './proxy.js';
import { matchIntentPatterns, matchesProject } from './patterns.js';
import { scoreLead } from './scorer.js';
import {
  db,
  getActiveProjects,
  upsertRawPosts,
  insertLead,
  logScanRun,
  updateProjectLastScanned,
} from './db.js';
import { sendTelegram, alertError, alertRunSummary } from './telegram.js';

const LOOP_DELAY_MS = 60 * 60 * 1000; // 1h
const LLM_SCORE_THRESHOLD = 1; // only LLM-score posts with pattern_score >= 1
const LLM_MAX_PER_RUN = 50;    // cost cap: max LLM calls per project per run

export async function scanProject(project) {
  const startedAt = Date.now();
  const run = {
    project_id: project.id,
    subreddits_scanned: project.target_subreddits,
    posts_fetched: 0,
    posts_new: 0,
    leads_created: 0,
    errors: null,
    started_at: new Date(startedAt).toISOString(),
  };

  try {
    if (project.target_subreddits.length === 0) {
      console.log(`[${project.name}] no subreddits configured, skipping`);
      return;
    }

    // 1. fetch
    console.log(`[${project.name}] fetching ${project.target_subreddits.length} subs...`);
    const posts = await fetchManySubreddits(project.target_subreddits, 25);
    run.posts_fetched = posts.length;

    // 2. upsert raw
    const newCount = await upsertRawPosts(
      posts.map((p) => ({
        reddit_id: p.reddit_id,
        subreddit: p.subreddit,
        title: p.title,
        body: p.body,
        author: p.author,
        url: p.url,
        score: p.score,
        num_comments: p.num_comments,
        posted_at: p.posted_at,
        raw_json: p.raw_json,
      }))
    );
    run.posts_new = newCount;

    // 3. filter + pattern-match candidates for THIS project
    const candidates = [];
    for (const post of posts) {
      if (!matchesProject(post, project)) continue;
      const text = `${post.title}\n\n${post.body || ''}`;
      const { score, matchedPatterns } = matchIntentPatterns(text);
      if (score > 0) {
        candidates.push({ post, patternScore: score, matchedPatterns });
      }
    }
    console.log(`[${project.name}] ${candidates.length} pattern candidates`);

    // 4. LLM score the top N
    const toScore = candidates
      .sort((a, b) => b.patternScore - a.patternScore)
      .slice(0, LLM_MAX_PER_RUN);

    let leadsCreated = 0;
    for (const c of toScore) {
      let llmResult = null;
      if (c.patternScore >= LLM_SCORE_THRESHOLD) {
        try {
          llmResult = await scoreLead(c.post, project);
        } catch (err) {
          console.error(`[${project.name}] LLM score failed:`, err.message);
        }
      }

      // 5. find the raw_post_id we just inserted
      const { data: rawRow } = await db
        .from('raw_posts')
        .select('id')
        .eq('reddit_id', c.post.reddit_id)
        .maybeSingle();
      if (!rawRow) continue;

      await insertLead({
        project_id: project.id,
        raw_post_id: rawRow.id,
        pattern_score: c.patternScore,
        llm_score: llmResult?.score ?? null,
        matched_patterns: c.matchedPatterns,
        llm_reasoning: llmResult?.reasoning ?? null,
        pain_point: llmResult?.painPoint ?? null,
      });
      leadsCreated++;
    }
    run.leads_created = leadsCreated;

    await updateProjectLastScanned(project.id);
  } catch (err) {
    run.errors = { message: err.message, stack: err.stack };
    await alertError(`project ${project.name}`, err);
  } finally {
    run.finished_at = new Date().toISOString();
    run.duration_ms = Date.now() - startedAt;
    await logScanRun(run);
    await alertRunSummary({
      project: project.name,
      posts: run.posts_fetched,
      newPosts: run.posts_new,
      leads: run.leads_created,
      durationMs: run.duration_ms,
    });
    console.log(
      `[${project.name}] done: ${run.posts_fetched} posts, ` +
        `${run.posts_new} new, ${run.leads_created} leads, ` +
        `${run.duration_ms}ms`
    );
  }
}

async function runOnce() {
  loadProxies();
  console.log(`[scanner] starting run, proxies: ${getProxyCount()}`);

  const projects = await getActiveProjects();
  console.log(`[scanner] ${projects.length} active projects`);

  for (const project of projects) {
    await scanProject(project);
    await sleep(5000); // breathe between projects
  }

  console.log('[scanner] run complete');
}

async function main() {
  const once = process.argv.includes('--once');

  try {
    await runOnce();
  } catch (err) {
    console.error('[scanner] fatal:', err);
    await alertError('fatal', err);
    process.exit(1);
  }

  if (!once) {
    console.log(`[scanner] next run in ${LOOP_DELAY_MS / 60000}min`);
    setTimeout(main, LOOP_DELAY_MS);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
