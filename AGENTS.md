# AGENTS.md — 1000fps

## Dev Commands

```bash
npm run dev              # Next.js dev server (port 3000)
npm run build            # Production build
npm run lint             # ESLint
npm run test             # Main tests (vitest.config.ts)
npm run test:parser      # Parser tests (vitest.parser.config.ts)
npm run test:coverage    # Coverage for main tests
npm run test:parser:coverage
npx prisma migrate dev   # Create/apply migrations
npx prisma generate      # Generate Prisma client
npx prisma studio        # DB GUI
npm run db:seed          # Seed database
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

## Architecture

- **Main app**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Parser service**: Separate Express server at `parser/`, runs on port 3005
- **Database**: PostgreSQL + Prisma 7
- **Cache**: Redis (optional, used in `src/lib/cache/redis.ts`)
- **Entry points**: `src/app/` (pages), `src/components/` (UI), `src/lib/` (actions, utils)

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