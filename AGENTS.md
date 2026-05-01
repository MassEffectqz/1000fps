# AGENTS.md — 1000fps

## Dev Commands

```bash
npm run dev              # Next.js dev server (port 3000)
npm run build            # Production build
npm run lint             # ESLint
npm run test             # Main tests (vitest.config.ts)
npm run test:ui           # Tests with UI (vitest --ui)
npm run test:parser      # Parser tests (vitest.parser.config.ts)
npm run test:coverage  # Coverage for main tests
npx prisma migrate dev # Create/apply migrations
npx prisma generate   # Generate Prisma client
npx prisma studio      # DB GUI
npm run db:seed        # Seed database

# Docker shortcuts
npm run docker:up      # docker compose up -d
npm run docker:down     # docker compose down
npm run docker:logs     # docker compose logs -f
npm run docker:restart # docker compose restart
npm run start:all     # docker compose up -d (all services)
```

## Docker

```bash
docker compose up -d     # Start all (app, parser, postgres, redis)
docker compose up postgres # Only postgres for local dev
docker compose logs -f   # View logs
docker compose down
```

## CI Order (in .github/workflows/ci.yml)

```
ESLint -> TypeScript (tsc --noEmit) -> Prisma generate -> Tests -> Build
```

Tests require Postgres running (configured in CI with `fps1000_test` db).

## Test Structure

- **Main tests**: `src/tests/**` — uses `vitest.config.ts`, jsdom environment
- **Parser tests**: `parser/wb-interceptor/**/*.test.js` — uses `vitest.parser.config.ts`

Test setup at `src/tests/setup.ts` includes mocks for `next/navigation`, `next/image`, `sonner`.

Tests require Postgres running. Copy env vars from `.env.example` to `.env.local` and set `DATABASE_URL`.

## Architecture

- **Main app**: Next.js 15 (App Router), React 19, Tailwind CSS 3
- **Parser service**: Express server at `parser/wb-server/` (port 3005)
- **Parser interceptor**: Chrome extension at `parser/wb-interceptor/`
- **Database**: PostgreSQL + Prisma 6
- **Cache**: Redis (optional, see `src/lib/cache/redis.ts`)
- **Entry points**: `src/app/` (pages), `src/components/` (UI), `src/lib/` (actions, utils)

## Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`)

## Required Env Vars

```
DATABASE_URL, JWT_SECRET, COOKIE_SECRET, NEXT_PUBLIC_APP_URL, PARSER_URL
```

Copy from `.env.example` to `.env.local`.

## Key Files

- `docker-compose.yml` — dev environment
- `docker-compose.prod.yml` — production
- `vitest.config.ts`, `vitest.parser.config.ts` — test configs
- `prisma/schema.prisma` — database schema
- `next.config.ts` — Next.js configuration
- `middleware.ts` — auth/warehouse routing middleware