# Home Tuitions Web (pnpm + Turborepo workspace)

```
web/
├── apps/website   Next.js 15 public site + Student/Parent/Tutor authenticated views
├── apps/admin     Next.js 15 admin dashboard (MUI + Tailwind + TanStack Table + Chart.js)
└── packages/shared Types, zod schemas, typed API client shared by both apps
```

## Local development

```bash
pnpm install
pnpm dev            # runs both apps via turbo (website :3000, admin :3001)
```

Requires `NEXT_PUBLIC_API_BASE_URL` pointing at the backend (defaults to `http://localhost:8080`).

## Why one workspace, two apps

Website and admin are separate Next.js apps (different audiences, different auth models,
admin doesn't need SEO/SSR-for-marketing) but they consume the same backend contracts.
`packages/shared` is the single source of truth for those contracts (TS types + zod schemas)
so a backend DTO change is caught by TypeScript in both apps instead of silently drifting.

See `docs/phase1/05-information-architecture.md` for the route map this structure follows,
and `docs/phase3/README.md` for the full Phase 3 rationale.
