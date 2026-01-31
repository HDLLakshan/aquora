---
name: fullstack-turborepo
description: Comprehensive guide for building and maintaining full-stack TypeScript turborepo monorepos with Next.js (App Router) frontend and Node.js/Express backend. Use this skill when working with monorepo projects, creating new turborepo structures, setting up Next.js apps with shadcn/ui, building Express APIs with Prisma ORM, or when users mention turborepo, Next.js App Router, Express backend, monorepo architecture, Prisma migrations, or request AI agent instructions for their full-stack project. Also use for queries about project structure, architectural patterns, or TypeScript configuration in monorepos.
---

# Full-Stack Turborepo Architecture

Architectural guide for TypeScript turborepo monorepos with Next.js frontend and Express backend.

## Architecture Overview

This turborepo follows a clean, layered architecture:

```
root/
├── apps/
│   ├── web/          # Next.js App Router frontend
│   └── api/          # Express backend with Prisma
├── packages/
│   └── shared/       # Shared types, schemas, utilities
├── turbo.json        # Turborepo pipeline configuration
└── package.json      # Workspace root
```

## Project Structure

### Web App (`apps/web`)

Feature-based Next.js architecture with App Router:

```
apps/web/
├── app/                    # App Router pages
│   ├── (auth)/            # Route groups
│   ├── dashboard/
│   └── layout.tsx
├── components/
│   ├── ui/                # shadcn/ui components
│   └── shared/            # Shared components
├── features/              # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── customers/
├── lib/
│   ├── api-client.ts     # API communication
│   └── utils.ts
└── package.json
```

**Key Principles:**
- Feature folders contain all related code (components, hooks, services, types)
- Shared UI components live in `components/ui` (shadcn/ui)
- Cross-feature components in `components/shared`
- API clients in `lib/` for backend communication
- Use TypeScript path aliases: `@/components`, `@/features`, `@/lib`

### API Backend (`apps/api`)

Layered Express architecture with clear separation of concerns:

```
apps/api/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.types.ts
│   │   └── customers/
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── config/              # Configuration
│   │   ├── database.ts
│   │   ├── cache.ts
│   │   └── env.ts
│   ├── utils/               # Utilities
│   │   └── logger.ts
│   ├── types/               # Global types
│   │   └── express.d.ts
│   └── index.ts             # Entry point
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── package.json
```

**Layered Architecture:**

```
Request → Routes → Controller → Service → Repository → Database
                      ↓            ↓          ↓
                  Validation   Business    Data Access
                               Logic
```

**Layer Interfaces:**

```typescript
// IController - HTTP handling
interface IController {
  create(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
}

// IService - Business logic
interface IService<T> {
  create(data: CreateDTO): Promise<T>;
  findById(id: string): Promise<T | null>;
}

// IRepository - Data access
interface IRepository<T> {
  create(data: any): Promise<T>;
  findById(id: string): Promise<T | null>;
}
```

### Shared Package (`packages/shared`)

Cross-application code:

```
packages/shared/
├── src/
│   ├── types/           # Shared TypeScript types
│   │   ├── user.ts
│   │   └── api.ts
│   ├── schemas/         # Validation schemas (Zod)
│   │   └── user.schema.ts
│   ├── utils/           # Shared utilities
│   │   └── validators.ts
│   └── index.ts
└── package.json
```

## Implementation Workflow

### 1. Initial Setup

Use `scripts/init-turborepo.sh` for automated setup or manually:

1. Initialize turborepo with pnpm workspace
2. Configure TypeScript with path aliases
3. Set up Next.js with App Router and shadcn/ui
4. Initialize Express with Prisma
5. Configure turbo.json for build pipeline

### 2. Adding Features

**Frontend Feature:**

```bash
mkdir -p apps/web/features/[feature-name]/{components,hooks,services}
touch apps/web/features/[feature-name]/types.ts
```

**Backend Module:**

```bash
mkdir -p apps/api/src/modules/[module-name]
# Use scripts/create-module.sh for complete setup
```

### 3. Prisma Workflow

```bash
# 1. Define schema in prisma/schema.prisma

# 2. Create migration
pnpm --filter api prisma migrate dev --name [migration-name]

# 3. Generate Prisma Client
pnpm --filter api prisma generate

# 4. Seed database
pnpm --filter api prisma db seed
```

### 4. Using Context7 MCP

Query Context7 for latest documentation:
- Next.js 15+ App Router patterns
- shadcn/ui component APIs
- Express.js middleware best practices
- Prisma migration strategies
- TypeScript strict mode patterns

## Code Patterns

### Frontend Component

```typescript
// features/auth/components/LoginForm.tsx
'use client'

import { useLoginMutation } from '@/features/auth/hooks/useAuth'
import { Button } from '@/components/ui/button'
import type { LoginCredentials } from '@/features/auth/types'

export function LoginForm() {
  const { mutate: login, isPending } = useLoginMutation()
  // Implementation
}
```

### Backend Module

See `references/backend-patterns.md` for:
- Controller with error handling
- Service with business logic
- Repository with Prisma
- Type-safe DTOs

### Shared Package

```typescript
// packages/shared/src/schemas/user.schema.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
})

export type CreateUserDTO = z.infer<typeof createUserSchema>
```

## Best Practices

**TypeScript:**
- Enable `strict` mode
- Use path aliases consistently
- Share `tsconfig.json` via extensions
- Prefer `interface` over `type` for objects

**Error Handling:**
- Custom error classes extending `Error`
- Centralized error middleware
- Type-safe error responses
- Proper HTTP status codes

**Validation:**
- Zod schemas in shared package
- Validate at API boundaries
- Share schemas between frontend/backend

**Testing:**
- Unit tests for services/utilities
- Integration tests for API endpoints
- E2E tests for critical flows
- Mock Prisma with `prisma-mock`

**Database:**
- Use Prisma transactions for complex operations
- Soft deletes with `deletedAt` field
- UUIDs for primary keys
- Indexes for frequently queried fields

## Turborepo Config

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {}
  }
}
```

## Environment Variables

```
apps/web/.env.local
apps/api/.env
packages/shared/.env (if needed)
```

Use type-safe env with Zod (see `references/env-setup.md`).

## Additional Resources

- `scripts/init-turborepo.sh` - Project initialization
- `scripts/create-module.sh` - Backend module generator
- `scripts/create-feature.sh` - Frontend feature generator
- `references/backend-patterns.md` - Backend architecture
- `references/frontend-patterns.md` - Next.js patterns
- `references/prisma-guide.md` - Prisma best practices
- `references/env-setup.md` - Environment configuration
