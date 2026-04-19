// LLM-based lead scoring.
// Runs AFTER pattern matching has filtered posts down to candidates.
// Uses gpt-4o-mini for cost efficiency — we're running 100s/hour.

import OpenAI from 'openai';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT = readFileSync(
  join(__dirname, '..', 'prompts', 'lead-scoring.txt'),
  'utf-8'
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL_SCORING || 'gpt-4o-mini';

/**
 * Score a single post against a project's product description.
 * @returns {{ score: number, reasoning: string, painPoint: string | null }}
 */
export async function scoreLead(post, project) {
  const userMsg = JSON.stringify({
    product: {
      name: project.name,
      description: project.description,
      icp: project.icp,
    },
    post: {
      subreddit: post.subreddit,
      title: post.title,
      body: (post.body || '').slice(0, 2000), // cap to control tokens
    },
  });

  const res = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMsg },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 400,
  });

  const raw = res.choices[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(raw);
    return {
      score: clampScore(parsed.score),
      reasoning: parsed.reasoning || '',
      painPoint: parsed.pain_point || null,
    };
  } catch (err) {
    console.error('[scorer] failed to parse LLM response:', raw);
    return { score: 0, reasoning: 'parse error', painPoint: null };
  }
}

function clampScore(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(10, Math.round(num)));
}
