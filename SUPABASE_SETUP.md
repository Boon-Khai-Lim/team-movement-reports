# Supabase setup

This app is a static GitHub Pages site. The browser talks directly to Supabase using the project's public anon/publishable key. **Never put a Supabase `service_role` or secret key in this app or in GitHub Actions variables.**

## 1. Create the Supabase project

1. Create a project at https://supabase.com/dashboard.
2. In the SQL Editor, run `supabase/migrations/20261115000000_create_personnel.sql`.
3. In Project Settings → API, copy the Project URL and the public anon/publishable key.
4. Add the URL and public key as GitHub repository **Actions variables or secrets** named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The workflow currently reads them from Actions secrets.

## 2. Restrict access

1. In Authentication settings, disable public sign-ups.
2. Create/invite only approved team accounts in Authentication → Users.
3. Configure the Auth site's URL and redirect allow-list to include `https://boon-khai-lim.github.io/team-movement-reports/`.
4. Test with one approved account and one signed-out browser. Signed-out users must not be able to read or change the roster.

The current policies allow every authenticated project user to read, add, update and delete roster rows. Only invite trusted users. If some users should be read-only or only certain administrators should edit, add role-based policies before inviting them.

## 3. Add the GitHub Actions variables

Repository → Settings → Secrets and variables → Actions → New repository secret:

- `VITE_SUPABASE_URL` = Supabase Project URL
- `VITE_SUPABASE_ANON_KEY` = Supabase public anon/publishable key

The public anon/publishable key is intended for browser use; security comes from Auth and database grants/RLS, not from hiding this key. Never use the `service_role` key.

## 4. Enable Pages

Repository → Settings → Pages → Build and deployment → Source: **GitHub Actions**. Push to `main` to deploy.

## 5. Populate the roster

The migration intentionally creates an empty table. Add personnel only after confirming that this data is approved for storage in your Supabase project and that the project is authorised for the information classification involved. Do not commit real personnel names or identifiers to this public repository.
