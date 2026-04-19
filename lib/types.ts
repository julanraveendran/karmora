// Mirrors the enums + tables in supabase/migrations/0001_initial.sql
// When you change the schema, update this too (or run `supabase gen types` later).

export type PlanTier = 'free' | 'pro';
export type LeadStatus = 'new' | 'reviewed' | 'engaged' | 'dismissed';
export type SafetyMode = 'safe' | 'soft' | 'promo';
export type ProjectStatus = 'active' | 'paused';

export interface Profile {
  id: string;
  email: string;
  plan: PlanTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  reddit_karma: number | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  product_url: string | null;
  description: string;
  icp: string | null;
  target_subreddits: string[];
  keywords: string[];
  exclude_keywords: string[];
  status: ProjectStatus;
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RawPost {
  id: string;
  reddit_id: string;
  subreddit: string;
  title: string;
  body: string | null;
  author: string | null;
  url: string;
  score: number | null;
  num_comments: number | null;
  posted_at: string;
  fetched_at: string;
  classified_at: string | null;
  raw_json: unknown;
}

export interface Lead {
  id: string;
  project_id: string;
  raw_post_id: string;
  pattern_score: number;
  llm_score: number | null;
  combined_score: number;
  matched_patterns: string[];
  llm_reasoning: string | null;
  pain_point: string | null;
  google_rank: number | null;
  google_checked_at: string | null;
  status: LeadStatus;
  user_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Opener {
  id: string;
  lead_id: string;
  mode: SafetyMode;
  content: string;
  model: string;
  created_at: string;
}

// For dashboard queries — lead joined with its raw_post
export interface LeadWithPost extends Lead {
  raw_post: RawPost;
}
