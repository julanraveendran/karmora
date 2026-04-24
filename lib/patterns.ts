// High-intent phrase detector + project-match filter.
// Mirrored from scanner/patterns.js so the web app can run the same
// matching logic for backfill at project creation time.
// Keep these two files in sync if you edit the rules.

type Pattern = { re: RegExp; weight: number; tag: string };

const PATTERNS: Pattern[] = [
  { re: /currently doing this manually/i, weight: 3, tag: 'manual-workflow' },
  { re: /doing it (by hand|manually)/i, weight: 3, tag: 'manual-workflow' },
  { re: /wastes? hours on/i, weight: 3, tag: 'time-waste' },
  { re: /spending (hours|days|weeks) on/i, weight: 2, tag: 'time-waste' },
  { re: /has anyone (automated|built|made|found)/i, weight: 3, tag: 'seeking-tool' },
  { re: /is there a (tool|app|service|saas|software) (for|that)/i, weight: 3, tag: 'seeking-tool' },
  { re: /looking for (alternatives? to|a tool|a service)/i, weight: 3, tag: 'seeking-tool' },
  { re: /(any|what|which) (tool|app|service) (do you|should i|would you)/i, weight: 2, tag: 'seeking-tool' },
  { re: /recommend(ations?)? for/i, weight: 1, tag: 'recommendation-ask' },
  { re: /tired of/i, weight: 2, tag: 'frustration' },
  { re: /(hate|frustrated with|fed up with)/i, weight: 2, tag: 'frustration' },
  { re: /switching (from|off)/i, weight: 2, tag: 'switching' },
  { re: /alternative to /i, weight: 2, tag: 'switching' },
  { re: /willing to pay/i, weight: 3, tag: 'buy-signal' },
  { re: /would pay (for|money)/i, weight: 3, tag: 'buy-signal' },
  { re: /happy to pay/i, weight: 3, tag: 'buy-signal' },
  { re: /our (team|company|startup) (needs|wastes|struggles)/i, weight: 2, tag: 'team-pain' },
  { re: /how (do you|does one|can i) (automate|streamline|speed up)/i, weight: 2, tag: 'automation-ask' },
];

export function matchIntentPatterns(text: string): {
  score: number;
  matchedPatterns: string[];
} {
  if (!text) return { score: 0, matchedPatterns: [] };
  const matched = new Set<string>();
  let score = 0;
  for (const { re, weight, tag } of PATTERNS) {
    if (re.test(text)) {
      matched.add(tag);
      score += weight;
    }
  }
  return { score: Math.min(score, 10), matchedPatterns: Array.from(matched) };
}

export type ProjectForMatch = {
  target_subreddits: string[];
  keywords: string[];
  exclude_keywords?: string[];
};

export type PostForMatch = {
  title: string;
  body: string | null;
  subreddit: string;
};

export function matchesProject(
  post: PostForMatch,
  project: ProjectForMatch
): boolean {
  const text = `${post.title} ${post.body || ''}`.toLowerCase();
  const subMatch = project.target_subreddits
    .map((s) => s.toLowerCase())
    .includes(post.subreddit.toLowerCase());
  const kwMatch = project.keywords.some((kw) => text.includes(kw.toLowerCase()));
  const excluded = (project.exclude_keywords ?? []).some((kw) =>
    text.includes(kw.toLowerCase())
  );
  if (excluded) return false;
  return subMatch || kwMatch;
}
