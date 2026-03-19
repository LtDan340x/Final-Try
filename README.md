# H-Town Hitters Race App v2.1

Fixed build with visible sync controls.

## What changed in v2.1
- Added visible Sync Mode buttons on the admin page: Auto, Online, Local
- Online mode can now be forced from the UI
- Defaults to Online when opened from a Netlify site
- Faster refresh on racer and board screens (1 second)
- Clear sync status badge and fallback message

## Pages
- `/admin.html`
- `/racer.html`
- `/board.html`

## How to use live mode
1. Deploy the full project to Netlify.
2. Open `/admin.html`.
3. In the left panel under Sync Mode, click **Online**.
4. Open `/racer.html` on phones and `/board.html` on the TV.

## Netlify notes
- Functions path is `netlify/functions`
- Publish path is `.`
- Main shared state function is `/.netlify/functions/race-state`

## Notes
- If Netlify functions are not detected, the app falls back to local browser mode.
- This build is still polling-based live sync. For true instant push, move the state layer to Supabase Realtime or Firebase.
