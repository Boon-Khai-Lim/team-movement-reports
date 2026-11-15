# Team Movement Reports

A static, browser-only movement report generator hosted on GitHub Pages. The personnel roster is bundled as read-only data in `src/lib/personnel.ts`; no SQL database, Supabase project, sign-in, or runtime server is required.

## Local development

- `npm install`
- `npm run dev`
- `npm run build`

## Updating the fixed roster

Edit `src/lib/personnel.ts` and commit the change. The roster is public because GitHub Pages serves this site publicly.
