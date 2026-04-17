# AGENTS.md — 1000FPS E-commerce

## Quick Commands

```bash
npm run dev          # Next.js dev server (port 3000)
npm run lint         # ESLint
npm run test         # Vitest (main app)
npm run test:parser  # Parser tests (separate vitest config)
npm run db:seed      # Prisma seed
npm run start:all    # Docker Compose all services
```

## Docker Services

| Service   | Port  | Description              |
|-----------|-------|--------------------------|
| app       | 3000  | Next.js application     |
| parser    | 3005  | Wildberries parser      |
| parser-ui | 3006  | Parser web interface    |
| postgres  | 5432  | PostgreSQL              |

## CI Order (run in sequence)

`lint` → `typecheck` → `test` → `prisma generate` → `build`

## Testing

- Main tests: `vitest.config.ts` (jsdom, setup: `src/tests/setup.ts`)
- Parser tests: `vitest.parser.config.ts` (setup: `parser/wb-interceptor/test-setup.js`)
- Run separately: `npm run test` and `npm run test:parser`

## Path Aliases

`@/` maps to `src/`

## Required Files

- Copy `.env.example` to `.env.local` before development
- Run `npx prisma generate` after installing deps or changing schema

## Key Directories

- `src/app/` — Next.js pages (App Router)
- `src/components/` — React components
- `src/lib/` — Utilities
- `prisma/` — DB schema & migrations
- `parser/` — Parser server + UI
- `.github/workflows/` — CI/CD (deploys to Hetzner on main push)