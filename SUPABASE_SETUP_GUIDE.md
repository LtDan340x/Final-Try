# Supabase setup for H-Town Hitters Race App v2.2

1. Create a Supabase project.
2. In Supabase SQL Editor, run:

```sql
create table if not exists public.race_state (
  id bigint primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.race_state (id, payload)
values (1, '{}'::jsonb)
on conflict (id) do nothing;
```

3. Enable RLS on `race_state`.
4. Create anon policies for select, insert, and update on `race_state`.
5. Edit `supabase-config.js` with your real values.
6. Upload all files to GitHub and deploy to Netlify.

Pages:
- admin.html
- racer.html
- board.html
