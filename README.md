# H-Town Hitters Live

Netlify + Supabase live drag racing control app.

## What is included
- Admin page for racer entry, pairing generation, winner control, call-to-lanes message, and round advance
- Racer view for phones
- Board view for TVs / kiosks
- Supabase realtime sync
- Netlify-ready routing and build config

## Setup

### 1. Install
```bash
npm install
npm run dev
```

### 2. Create Supabase project
In Supabase SQL Editor, run `supabase-schema.sql`.

### 3. Add environment variables
Create `.env` from `.env.example`.

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 4. Deploy to Netlify
- Push this folder to GitHub
- Import repo into Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Add the same two environment variables in Netlify

## Routes
- `/admin`
- `/racer`
- `/board`

## Notes
This version allows public database access for quick race-day deployment. For a hardened production version, add authenticated admin access and stricter RLS policies.
