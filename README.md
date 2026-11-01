# 86th FAOCC Movement Reports

A responsive team movement reporting website recreated from the supplied reference. Create reports with morning, afternoon, and evening templates; choose selected personnel, exclusions, a whole unit, or a platoon; then copy the report, copy its personnel list, or export a text file.

The shared personnel roster supports search, adding, editing, and removing personnel. The initial database migration includes the reference site's 51 personnel. Initial platoon assignments follow squads S1–S3 for Platoon 1 and S4–S6 for Platoon 2 and can be edited.

## Technologies

TanStack Start, React, TypeScript, Vite, Tailwind CSS, Radix UI dialogs, Lucide icons, and Sonner notifications. Personnel data is stored in Netlify Database using Drizzle ORM. Server functions validate writes with Zod.

## Local development

Use Node 22.13+ or Node 24 and pnpm.

```sh
pnpm install
netlify dev --port 8889
```

Run against the linked Netlify project for database emulation. Database schema lives in `db/schema.ts`; generate schema migrations with `pnpm exec drizzle-kit generate --name describe_change`. Netlify applies migrations on deployment.

Reports are generated in the browser and are retained for the current page session; export or copy them to keep them. The roster persists in the shared database. The application follows the reference's open workspace model without sign-in.
