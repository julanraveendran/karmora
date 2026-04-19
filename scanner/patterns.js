// Hardcoded high-intent phrase detector.
// These phrases signal someone is actively looking for a solution,
// not just complaining. Based on GPT-5.4 Thinking's analysis — real
// leads use THESE words, not "I need help".
//
// Each match bumps pattern_score. Cap at 10.

const PATTERNS = [
  // Active problem statements
  { re: /currently doing this manually/i, weight: 3, tag: 'manual-workflow' },
  { re: /doing it (by hand|manually)/i, weight: 3, tag: 'manual-workflow' },
  { re: /wastes? hours on/i, weight: 3, tag: 'time-waste' },
  { re: /spending (hours|days|weeks) on/i, weight: 2, tag: 'time-waste' },

  // Tool-seeking
  { re: /has anyone (automated|built|made|found)/i, weight: 3, tag: 'seeking-tool' },
  { re: /is there a (tool|app|service|saas|software) (for|that)/i, weight: 3, tag: 'seeking-tool' },
  { re: /looking for (alternatives? to|a tool|a service)/i, weight: 3, tag: 'seeking-tool' },
  { re: /(any|what|which) (tool|app|service) (do you|should i|would you)/i, weight: 2, tag: 'seeking-tool' },
  { re: /recommend(ations?)? for/i, weight: 1, tag: 'recommendation-ask' },

  // Frustration / switching
  { re: /tired of/i, weight: 2, tag: 'frustration' },
  { re: /(hate|frustrated with|fed up with)/i, weight: 2, tag: 'frustration' },
  { re: /switching (from|off)/i, weight: 2, tag: 'switching' },
  { re: /alternative to /i, weight: 2, tag: 'switching' },

  // Direct buy signals
  { re: /willing to pay/i, weight: 3, tag: 'buy-signal' },
  { re: /would pay (for|money)/i, weight: 3, tag: 'buy-signal' },
  { re: /happy to pay/i, weight: 3, tag: 'buy-signal' },

  // Team pain
  { re: /our (team|company|startup) (needs|wastes|struggles)/i, weight: 2, tag: 'team-pain' },

  // Question framings
  { re: /how (do you|does one|can i) (automate|streamline|speed up)/i, weight: 2, tag: 'automation-ask' },
];

/**
 * @param {string} text - title + body concatenated
 * @returns {{ score: number, matchedPatterns: string[] }}
 */
export function matchIntentPatterns(text) {
  if (!text) return { score: 0, matchedPatterns: [] };

  const matched = new Set();
  let score = 0;

  for (const { re, weight, tag } of PATTERNS) {
    if (re.test(text)) {
      matched.add(tag);
      score += weight;
    }
  }

  return {
    score: Math.min(score, 10),
    matchedPatterns: Array.from(matched),
  };
}

/**
 * Fast project-match filter. Before running expensive LLM scoring,
 * check if the post has ANY overlap with project keywords or target subs.
 */
export function matchesProject(post, project) {
  const text = `${post.title} ${post.body || ''}`.toLowerCase();

  // subreddit match
  const subMatch = project.target_subreddits
    .map((s) => s.toLowerCase())
    .includes(post.subreddit.toLowerCase());

  // keyword match
  const kwMatch = project.keywords.some((kw) =>
    text.includes(kw.toLowerCase())
  );

  // exclude check
  const excluded = project.exclude_keywords.some((kw) =>
    text.includes(kw.toLowerCase())
  );

  if (excluded) return false;
  return subMatch || kwMatch;
}
