// Reddit fetcher — uses public .json endpoints (no auth required).
// Documented pattern: append `.json` to any Reddit URL.
//
// Rate limit: unauthenticated = ~10 req/min per IP. We spread requests
// across rotating proxies + add delays.

import { fetch } from 'undici';
import { getProxyAgent } from './proxy.js';

const USER_AGENT =
  process.env.REDDIT_USER_AGENT ||
  'karmora/0.1 (customer discovery tool; contact julan@karmora.app)';

const DELAY_MS = 2000; // between requests per single proxy

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  const agent = getProxyAgent();
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
    dispatcher: agent,
  });
  if (res.status === 429) {
    throw new Error(`rate limited: ${url}`);
  }
  if (!res.ok) {
    throw new Error(`fetch failed ${res.status}: ${url}`);
  }
  return res.json();
}

/**
 * Fetch newest posts from a subreddit.
 * @param {string} subreddit - e.g. "SaaS" (no /r/ prefix)
 * @param {number} limit - max 100 per Reddit's cap
 */
export async function fetchSubredditNew(subreddit, limit = 25) {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
  const data = await fetchJson(url);
  return parsePosts(data);
}

/**
 * Search across all of Reddit for a keyword.
 * Useful for catching leads in subreddits you don't target.
 */
export async function searchReddit(query, limit = 25) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
    query
  )}&sort=new&limit=${limit}`;
  const data = await fetchJson(url);
  return parsePosts(data);
}

function parsePosts(data) {
  if (!data?.data?.children) return [];
  return data.data.children
    .map((c) => c.data)
    .filter((p) => p && !p.stickied && !p.over_18)
    .map((p) => ({
      reddit_id: `t3_${p.id}`,
      subreddit: p.subreddit,
      title: p.title,
      body: p.selftext || null,
      author: p.author,
      url: `https://www.reddit.com${p.permalink}`,
      score: p.score,
      num_comments: p.num_comments,
      posted_at: new Date(p.created_utc * 1000).toISOString(),
      raw_json: p,
    }));
}

/**
 * Fetch multiple subreddits with delays between each.
 * Returns flat array of posts.
 */
export async function fetchManySubreddits(subreddits, limit = 25) {
  const all = [];
  for (const sub of subreddits) {
    try {
      const posts = await fetchSubredditNew(sub, limit);
      all.push(...posts);
      await sleep(DELAY_MS);
    } catch (err) {
      console.error(`[reddit] error fetching r/${sub}:`, err.message);
    }
  }
  return all;
}
