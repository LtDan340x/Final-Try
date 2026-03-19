# H-Town Hitters Race App v2.2 — Supabase setup

This package keeps the original v2.2 interface and uses Supabase for online sync.

## 1) Create the table in Supabase
Run this in the SQL Editor:

create table if not exists public.race_state (
  id bigint primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.race_state (id, payload)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

## 2) Enable RLS and allow anon access
Enable Row Level Security for `race_state`, then create anon policies for:
- select
- insert
- update

## 3) Edit supabase-config.js
Replace the placeholder values with your real:
- Supabase URL
- publishable key

## 4) Deploy
Upload all files to GitHub and connect the repo to Netlify.
Use the root contents of this folder.
