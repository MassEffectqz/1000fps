# 1000FPS — Интернет-магазин компьютерной техники

## Project Overview

**1000FPS** is a full-stack e-commerce platform for computer hardware and peripherals. The project features a modern storefront, admin panel, PC configurator, and integration with a Wildberries parser for product imports.

### Tech Stack

**Frontend:**
- **Storefront**: Next.js 14 (App Router) + React 18 + TypeScript
- **Admin Panel**: Next.js 14 (App Router) + React 18 + TypeScript
- **State Management**: Zustand (client state), React Query (server state)
- **Styling**: CSS Variables + inline styles with CSS-in-JS approach
- **Forms**: React Hook Form + Zod validation

**Backend:**
- **API**: NestJS + TypeScript
- **Database**: PostgreSQL 16 with Prisma ORM
- **Cache**: Redis
- **Search**: Meilisearch
- **File Storage**: S3-compatible (MinIO/Yandex Cloud)

**Infrastructure:**
- **Monorepo**: Turborepo + pnpm workspaces
- **Docker**: PostgreSQL, Redis, Meilisearch, MinIO, pgAdmin, MailHog
- **Testing**: Jest (unit), Playwright (e2e)

### Architecture

```
1000fps/
├── apps/
│   ├── storefront/         # Next.js storefront (port 3000)
│   └── admin/              # Next.js admin panel (port 3002)
├── packages/
│   └── api/                # NestJS backend API (port 3001)
├── parser/                 # Wildberries parser service (port 3003)
├── docs/                   # Documentation (~7500 lines)
└── docker-compose.yml      # Docker infrastructure
```

## Building and Running

### Prerequisites

| Component  | Version | Notes                              |
| ---------- | ------- | ---------------------------------- |
| Node.js    | 20.x+   | Required                           |
| pnpm       | 8.x+    | Package manager                    |
| Docker     | 24.x+   | For Redis, Meilisearch, PostgreSQL |

### Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment files
cp .env.example .env
cp packages/api/.env.example packages/api/.env
cp apps/storefront/.env.local.example apps/storefront/.env.local
cp apps/admin/.env.local.example apps/admin/.env.local

# 3. Start Docker infrastructure
pnpm docker:up

# 4. Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate

# 5. Start development servers
pnpm dev
```

### Development Commands

```bash
# Start all services (Turborepo)
pnpm dev

# Start individual services
pnpm dev:api      # Backend API (port 3001)
pnpm dev:store    # Storefront (port 3000)
pnpm dev:admin    # Admin panel (port 3002)
pnpm dev:parser   # Parser service (port 3003)

# Build
pnpm build            # Build all services
pnpm build:api        # Build only API
pnpm build:store      # Build only Storefront

# Database
pnpm db:generate      # Prisma generate
pnpm db:migrate       # Prisma migrate dev
pnpm db:migrate:deploy  # Production migrations
pnpm db:studio        # Prisma Studio GUI (localhost:5555)
pnpm db:seed          # Seed database

# Docker
pnpm docker:up        # Start infrastructure
pnpm docker:down      # Stop infrastructure
pnpm docker:logs      # View logs
pnpm docker:restart   # Restart infrastructure

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests
pnpm test:e2e         # E2E tests
pnpm test:coverage    # Tests with coverage

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix ESLint
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm type-check       # TypeScript type checking
```

### Service URLs

| Service            | URL                           | Description                    |
| ------------------ | ----------------------------- | ------------------------------ |
| **Storefront**     | http://localhost:3000         | Customer-facing storefront     |
| **Admin**          | http://localhost:3002         | Admin dashboard                |
| **API**            | http://localhost:3001/api/v1  | REST API                       |
| **Swagger**        | http://localhost:3001/swagger | API documentation              |
| **Parser**         | http://localhost:3003         | Wildberries parser             |
| **Prisma Studio**  | http://localhost:5555         | Database GUI                   |
| **pgAdmin**        | http://localhost:5050         | PostgreSQL administration      |
| **MailHog**        | http://localhost:8025         | Email capture for development  |
| **MinIO Console**  | http://localhost:9001         | S3 storage console             |

## Development Conventions

### Code Style

Follow the guidelines in [`docs/CODE_STYLE.md`](./docs/CODE_STYLE.md):

**TypeScript:**
- Use `interface` for object types
- Use `type` for union types and mapped types
- Avoid `any`, use `unknown` when necessary
- Explicit return types for functions

**React:**
- Functional components with TypeScript
- Custom hooks for reusable logic
- Proper hook dependencies in `useEffect`
- Memoization with `useCallback` and `useMemo`

**Naming:**
- `camelCase` for variables and functions
- `PascalCase` for components and types
- `UPPER_CASE` for constants
- Boolean variables: `is/has/can/should` prefix

**File Organization:**
```typescript
// 1. React/Next.js imports
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. Custom hooks
import { useCart } from '@/hooks/useCart';

// 3. Types
import type { Product } from '@/types';

// 4. Utilities
import { formatPrice } from '@/utils';

// 5. Components
import { Button } from '@/components/ui';

// 6. Type definitions
interface ProductCardProps {
  product: Product;
}

// 7. Component
export function ProductCard({ product }: ProductCardProps) {
  // hooks
  // handlers
  // render
}
```

### Testing Practices

See [`docs/TESTING.md`](./docs/TESTING.md):

- **Unit tests**: Jest for business logic
- **Integration tests**: Test API endpoints
- **E2E tests**: Playwright for critical user flows
- **Test file naming**: `*.test.ts` or `*.spec.ts`

### Commit Conventions

Using `@commitlint/config-conventional`:

```bash
feat: add new feature
fix: fix a bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

### Best Practices

From [`docs/BEST_PRACTICES_AUDIT.md`](./docs/BEST_PRACTICES_AUDIT.md):

**Security:**
- JWT tokens in HttpOnly cookies (not localStorage)
- Refresh token rotation
- Rate limiting on API
- Input validation with DTOs

**Performance:**
- React Query for server state caching
- Proper `staleTime` configuration
- Lazy loading for routes
- Image optimization with `next/image`

**State Management:**
- Zustand for client state (cart, wishlist)
- React Query for server state (products, orders)
- Persist middleware for localStorage

## Key Files

| File | Description |
| ---- | ----------- |
| [`package.json`](./package.json) | Root package.json with Turborepo scripts |
| [`turbo.json`](./turbo.json) | Turborepo configuration |
| [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) | pnpm workspace definition |
| [`docker-compose.yml`](./docker-compose.yml) | Docker infrastructure |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Full architecture documentation (~1770 lines) |
| [`docs/API.md`](./docs/API.md) | REST API specification (~800 lines) |
| [`docs/DATABASE.md`](./docs/DATABASE.md) | Database schema with ERD (~600 lines) |

## Documentation

The [`docs/`](./docs/) folder contains comprehensive documentation (~7500 lines):

| Document | Description |
| -------- | ----------- |
| [`README.md`](./docs/README.md) | Documentation index |
| [`API.md`](./docs/API.md) | REST API specification |
| [`DATABASE.md`](./docs/DATABASE.md) | Database schema (ERD) |
| [`SETUP.md`](./docs/SETUP.md) | Development environment setup |
| [`DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Production deployment guide |
| [`CONTRIBUTING.md`](./docs/CONTRIBUTING.md) | Contribution guidelines |
| [`CODE_STYLE.md`](./docs/CODE_STYLE.md) | Code style guide |
| [`TESTING.md`](./docs/TESTING.md) | Testing guide |
| [`RUNBOOK.md`](./docs/RUNBOOK.md) | Operations runbook |
| [`INCIDENTS.md`](./docs/INCIDENTS.md) | Incident management |
| [`SECURITY.md`](./docs/SECURITY.md) | Security policies |

## Recent Changes (March 2026)

### Fixed Issues

1. **Admin Categories Page**:
   - Fixed hardcoded API URL → using `NEXT_PUBLIC_API_URL` env variable
   - Added authentication headers for CRUD operations
   - Changed from `name` to `id` for category relations
   - Added `res.ok` checks before parsing JSON
   - Added child category check before deletion
   - Replaced `any` types with proper `ApiCategory` interface

2. **Storefront Header**:
   - Fixed logout dropdown with click-outside handling
   - Added error handling for logout

3. **Storefront Footer**:
   - Removed non-functional newsletter component
   - Removed unused `apps` import
   - Added dynamic year to copyright
   - Added `target="_blank"` for social links

### Created Files

- `apps/admin/.env.local` — Admin panel environment variables
- `apps/admin/src/lib/tokenUtils.ts` — Token management utilities
- `docs/CODE_REVIEW_REPORT.md` — Code review report

## Contacts

- **Email**: dev-support@1000fps.ru
- **Documentation**: [`docs/`](./docs/) folder

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**License**: UNLICENSED
