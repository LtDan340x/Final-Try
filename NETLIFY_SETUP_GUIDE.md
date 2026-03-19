# H-Town Hitters Race App v2.2 - Netlify Online Setup

This app has 2 modes:
- Local Browser Mode: only the current browser sees updates
- Online Mode: admin, racer phones, and the board share the same live state

## Required for Online Mode
Add these environment variables in Netlify:

- `NETLIFY_BLOBS_SITE_ID`
- `NETLIFY_BLOBS_TOKEN`

## Where to find them
### NETLIFY_BLOBS_SITE_ID
In Netlify, open your site and copy the Site ID / Project ID.

### NETLIFY_BLOBS_TOKEN
Create a Netlify Personal Access Token in your Netlify account settings.

## Add them to Netlify
1. Open your Netlify site dashboard
2. Go to **Site configuration**
3. Open **Environment variables**
4. Add both variables
5. Save
6. Trigger a new deploy

## Test the function
Open:
`https://YOUR-SITE.netlify.app/.netlify/functions/race-state`

Expected result:
- JSON response = good
- 404 = functions are not deployed
- Error mentioning missing blobs = variables are not set yet

## Live pages
- Admin: `/admin.html`
- Racer View: `/racer.html`
- MultiView Board: `/board.html`

## Notes
- Keep your token private
- Do not put the real token in files you share publicly
