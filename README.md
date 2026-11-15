# Team Movement Reports

A static React/Vite application for creating movement reports and managing a shared personnel roster. Hosted on GitHub Pages; roster persistence and authentication are provided by Supabase.

## Local development

Requires Node.js 22+.

```sh
npm install
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Deployment

1. Follow [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) to create the database, configure authentication, and add GitHub Actions secrets.
2. In GitHub repository Settings → Pages, choose **GitHub Actions** as the source.
3. Push to `main`; `.github/workflows/deploy.yml` builds and deploys the site.

The GitHub Pages URL is `https://boon-khai-lim.github.io/team-movement-reports/`.

## Security notes

- The app requires a Supabase sign-in. Disable public sign-ups and invite only approved users.
- The current database policies permit all authenticated users in this Supabase project to manage all personnel rows. Use role-based policies if that is too broad.
- Never place a Supabase service-role key in frontend code.
- The Supabase migration creates an empty table and deliberately does not include a seeded roster.
- GitHub Pages is public hosting. Do not publish personal or operationally sensitive data in the repository or website.
