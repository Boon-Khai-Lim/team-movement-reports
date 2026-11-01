# Project guide

This is the 86th FAOCC movement report workspace, built with TanStack Start, React, TypeScript, Vite, and Tailwind CSS, deployed through Netlify's TanStack Start plugin.

## Architecture

- `src/routes/index.tsx`: report form, generated preview, roster search, and personnel edit/delete dialogs. Form and report preview state are transient; personnel is persistent.
- `src/routes/__root.tsx`: document shell, product sharing metadata, and toast provider.
- `src/styles.css`: theme tokens and responsive workspace styling. The palette uses warm white and muted olive; DM Sans is the body face and Manrope is the heading face.
- `src/lib/personnel.functions.ts`: validated TanStack server functions for roster reads and writes. Database imports stay inside server handlers to keep them off the client.
- `db/schema.ts`: personnel table. Unit numbers are unique; platoon is 1 or 2.
- `db/index.ts`: Netlify Database Drizzle adapter.
- `netlify/database/migrations/`: generated schema migration and initial reference roster seed.
- `src/components/ui/`: reusable Radix/shadcn controls. Personnel dialogs use the existing accessible Dialog component.
- `drizzle.config.ts`: migration output configuration.

## Conventions and decisions

Keep TypeScript strict. Validate server mutations with Zod; show failure messages instead of treating failed writes as successful. Keep all persistent structured data in Netlify Database. Use Drizzle's beta packages for the Netlify adapter and generate a migration whenever the schema changes.

Match the reference's greeting, location list, unit designations, report formats, and five report modes. Names sort by unit number. Seeded platoons are inferred from squads S1–S3 versus S4–S6 and are editable. A generated report is a snapshot; changing the form shows a regeneration notice. Copy and export act on that snapshot. No report archive or user authentication is implemented.

Handle loading, error, and empty roster states. Keep server-rendered initial state deterministic; local time and date are set after mounting. Preserve mobile stacking, visible focus, labeled controls, and reduced motion behavior.

Use Netlify's automatic build validation in this environment; do not run build, dev, or test commands during automated agent runs. For manual local work, use `netlify dev --port 8889`. Never edit the generated route tree.
