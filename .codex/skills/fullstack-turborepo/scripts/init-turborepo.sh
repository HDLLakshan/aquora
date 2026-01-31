#!/bin/bash
# Initialize a full-stack turborepo project

set -e

PROJECT_NAME=${1:-my-app}

echo "🚀 Initializing turborepo project: $PROJECT_NAME"

# Create project directory
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Initialize package.json for workspace
cat > package.json << 'EOF'
{
  "name": "monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  },
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
EOF

# Create turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/
build
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Environment
.env
.env*.local
.env.production

# Misc
.DS_Store
*.pem

# Vercel
.vercel

# Turbo
.turbo

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF

# Create directories
mkdir -p apps/web apps/api packages/shared

echo "✅ Project structure created"
echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
pnpm install

echo "✅ Root dependencies installed"
echo ""
echo "🎨 Setting up Next.js app..."

# Setup Web App
cd apps/web
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git

# Update package.json
cat > package.json << 'EOF'
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
EOF

# Create tsconfig
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cd ../..

echo "✅ Next.js app configured"
echo ""
echo "⚙️  Setting up Express API..."

# Setup API
cd apps/api

# Create package.json
cat > package.json << 'EOF'
{
  "name": "api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "@prisma/client": "^5.7.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "prisma": "^5.7.0",
    "eslint": "^8.0.0"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
EOF

# Create tsconfig
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create basic source structure
mkdir -p src/{modules,middleware,config,utils,types}

# Create index.ts
cat > src/index.ts << 'EOF'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
})
EOF

# Create Prisma schema
mkdir -p prisma
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}
EOF

# Create env example
cat > .env.example << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
PORT=3001
NODE_ENV=development
EOF

cd ../..

echo "✅ Express API configured"
echo ""
echo "📦 Setting up shared package..."

# Setup Shared Package
cd packages/shared

cat > package.json << 'EOF'
{
  "name": "@repo/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

mkdir -p src/{types,schemas,utils}

cat > src/index.ts << 'EOF'
export * from './types'
export * from './schemas'
export * from './utils'
EOF

mkdir -p src/types src/schemas src/utils

cat > src/types/index.ts << 'EOF'
export interface User {
  id: string
  email: string
  name: string
}
EOF

cat > src/schemas/index.ts << 'EOF'
import { z } from 'zod'

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
})
EOF

cat > src/utils/index.ts << 'EOF'
export function formatDate(date: Date): string {
  return date.toISOString()
}
EOF

cd ../..

echo "✅ Shared package configured"
echo ""
echo "📝 Creating root TypeScript config..."

# Create root tsconfig
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "incremental": true
  }
}
EOF

echo "✅ TypeScript configured"
echo ""
echo "📦 Installing workspace dependencies..."

pnpm install

echo ""
echo "✅ Project setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. Set up environment variables:"
echo "   - cp apps/api/.env.example apps/api/.env"
echo "   - Update DATABASE_URL in apps/api/.env"
echo "3. Initialize Prisma:"
echo "   - pnpm --filter api prisma migrate dev --name init"
echo "4. Install shadcn/ui (optional):"
echo "   - cd apps/web && pnpm dlx shadcn-ui@latest init"
echo "5. Start development:"
echo "   - pnpm dev"
echo ""
echo "🎉 Happy coding!"
