# Environment Configuration

Type-safe environment variable management with Zod validation.

## Environment Files Structure

```
apps/web/.env.local          # Web app environment variables
apps/api/.env                # API environment variables
packages/shared/.env         # Shared package (if needed)
```

## API Environment Setup

### Environment Variables

```bash
# apps/api/.env

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Type-Safe Environment Validation

```typescript
// apps/api/src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Server
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().url(),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number()).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASSWORD: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ')
      throw new Error(`Missing or invalid environment variables: ${missingVars}`)
    }
    throw error
  }
}

export const env = validateEnv()
```

### Usage in Code

```typescript
// apps/api/src/index.ts
import express from 'express'
import { env } from '@/config/env'

const app = express()

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
  console.log(`Environment: ${env.NODE_ENV}`)
})

// apps/api/src/config/database.ts
import { PrismaClient } from '@prisma/client'
import { env } from './env'

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL
    }
  },
  log: env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
})

// apps/api/src/middleware/cors.middleware.ts
import cors from 'cors'
import { env } from '@/config/env'

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  credentials: true
})
```

## Web Environment Setup

### Environment Variables

```bash
# apps/web/.env.local

# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=My App

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Private (not exposed to client)
API_SECRET=your-internal-secret
REVALIDATION_TOKEN=your-revalidation-token
```

### Type-Safe Environment Validation

```typescript
// apps/web/src/config/env.ts
import { z } from 'zod'

// Client-side env (prefixed with NEXT_PUBLIC_)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  NEXT_PUBLIC_ENABLE_CHAT: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
})

// Server-side env (can access all env vars)
const serverEnvSchema = clientEnvSchema.extend({
  API_SECRET: z.string().min(32),
  REVALIDATION_TOKEN: z.string().optional(),
})

export type ClientEnv = z.infer<typeof clientEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>

function validateClientEnv(): ClientEnv {
  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
      NEXT_PUBLIC_ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT,
      NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ')
      throw new Error(`Missing or invalid client environment variables: ${missingVars}`)
    }
    throw error
  }
}

function validateServerEnv(): ServerEnv {
  try {
    return serverEnvSchema.parse({
      ...validateClientEnv(),
      API_SECRET: process.env.API_SECRET,
      REVALIDATION_TOKEN: process.env.REVALIDATION_TOKEN,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ')
      throw new Error(`Missing or invalid server environment variables: ${missingVars}`)
    }
    throw error
  }
}

// Client-side env (safe to use in browser)
export const env = validateClientEnv()

// Server-side env (only use in Server Components or API routes)
export const serverEnv = validateServerEnv()
```

### Usage in Next.js

```typescript
// Client Component
'use client'

import { env } from '@/config/env'

export function ApiStatus() {
  return (
    <div>
      API URL: {env.NEXT_PUBLIC_API_URL}
      Analytics: {env.NEXT_PUBLIC_ENABLE_ANALYTICS ? 'Enabled' : 'Disabled'}
    </div>
  )
}

// Server Component
import { serverEnv } from '@/config/env'

export default async function ServerPage() {
  // Can access both client and server env
  console.log('API Secret:', serverEnv.API_SECRET)
  
  return (
    <div>
      App: {serverEnv.NEXT_PUBLIC_APP_NAME}
    </div>
  )
}

// API Route
import { NextRequest, NextResponse } from 'next/server'
import { serverEnv } from '@/config/env'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader !== `Bearer ${serverEnv.API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Process request
}
```

## Shared Package Environment

For environment variables needed across packages:

```typescript
// packages/shared/src/config/env.ts
import { z } from 'zod'

const sharedEnvSchema = z.object({
  // Shared constants or feature flags
  FEATURE_NEW_UI: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
})

export const sharedEnv = sharedEnvSchema.parse({
  FEATURE_NEW_UI: process.env.FEATURE_NEW_UI,
})
```

## Environment Templates

### .env.example Files

Always include example files:

```bash
# apps/api/.env.example
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
PORT=3001
NODE_ENV=development
JWT_SECRET=generate-a-secure-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

```bash
# apps/web/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=My App
NEXT_PUBLIC_ENABLE_ANALYTICS=false
API_SECRET=generate-a-secure-secret-key-here
```

## Development Setup Script

```bash
#!/bin/bash
# scripts/setup-env.sh

echo "Setting up environment files..."

# Copy example env files if they don't exist
if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  echo "✓ Created apps/api/.env"
fi

if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.example apps/web/.env.local
  echo "✓ Created apps/web/.env.local"
fi

echo "
⚠️  IMPORTANT: Update the following values in your .env files:
- DATABASE_URL in apps/api/.env
- JWT_SECRET in apps/api/.env
- API_SECRET in apps/web/.env.local
"
```

## Production Considerations

### 1. Never Commit .env Files

```gitignore
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

### 2. Use Environment-Specific Files

```bash
.env.development
.env.production
.env.test
```

Next.js automatically loads the correct file based on NODE_ENV.

### 3. CI/CD Environment Variables

Set in your CI/CD platform (Vercel, Railway, etc.):
- Don't store secrets in code
- Use platform-specific secret management
- Validate env vars in CI pipeline

### 4. Runtime Validation

```typescript
// apps/api/src/index.ts
import { env } from '@/config/env'

// This will throw if env vars are invalid
console.log('Environment validated successfully')
console.log(`Server starting in ${env.NODE_ENV} mode`)
```

## TypeScript Declaration

```typescript
// apps/api/src/types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      PORT: string
      NODE_ENV: 'development' | 'production' | 'test'
      JWT_SECRET: string
      JWT_EXPIRES_IN: string
      CORS_ORIGIN: string
      REDIS_URL?: string
    }
  }
}

export {}
```

```typescript
// apps/web/src/types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string
      NEXT_PUBLIC_APP_URL: string
      NEXT_PUBLIC_APP_NAME: string
      NEXT_PUBLIC_ENABLE_ANALYTICS: string
      API_SECRET: string
      REVALIDATION_TOKEN?: string
    }
  }
}

export {}
```
