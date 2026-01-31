# aquora

Turborepo monorepo using pnpm workspaces.

## Apps

- `apps/web`: Next.js (App Router)
- `apps/api`: Express + TypeScript (bundled with tsup)

## Packages

- `packages/shared`: Zod schemas + inferred types + date utilities (date-fns)

## Commands

- `pnpm dev`: Run all dev servers in parallel
- `pnpm build`: Build all packages/apps
- `pnpm typecheck`: Typecheck all packages/apps

## API Auth Setup

- Create `apps/api/.env` from `apps/api/.env.example` (replace placeholder values).
- Run Prisma setup:
  - `pnpm --filter @aquora/api prisma:generate`
  - `pnpm --filter @aquora/api prisma:migrate`
- Start the API:
  - `pnpm --filter @aquora/api dev`
