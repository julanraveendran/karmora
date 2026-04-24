-- Allow authenticated users to read raw_posts that are referenced by a lead
-- in one of their own projects. Without this policy, the !inner join from
-- leads -> raw_posts returns zero rows under RLS, which filters leads out
-- of the dashboard entirely.
--
-- Scanner still uses service role (bypasses RLS) for writes and cross-user
-- reads. This policy only exposes raw_posts to the user for posts they
-- already "own" via a lead.

create policy "read raw_posts via own leads" on public.raw_posts
  for select using (
    exists (
      select 1
      from public.leads l
      join public.projects p on p.id = l.project_id
      where l.raw_post_id = raw_posts.id
        and p.user_id = (auth.jwt() ->> 'sub')
    )
  );
