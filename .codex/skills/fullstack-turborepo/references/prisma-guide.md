# Prisma Guide

Best practices for Prisma ORM, schema design, and migrations.

## Schema Design

### Basic Schema Structure

```prisma
// prisma/schema.prisma
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
  password  String
  name      String
  role      Role     @default(USER)
  
  profile   Profile?
  orders    Order[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([email])
  @@map("users")
}

model Profile {
  id        String   @id @default(uuid())
  bio       String?
  avatar    String?
  
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("profiles")
}

model Order {
  id        String      @id @default(uuid())
  total     Decimal     @db.Decimal(10, 2)
  status    OrderStatus @default(PENDING)
  
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  
  items     OrderItem[]
  
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([userId])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id        String  @id @default(uuid())
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  productId String
  product   Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model Product {
  id          String      @id @default(uuid())
  name        String
  description String?
  price       Decimal     @db.Decimal(10, 2)
  stock       Int         @default(0)
  
  orderItems  OrderItem[]
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  @@index([name])
  @@map("products")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
}
```

### Schema Best Practices

**1. Use UUIDs for IDs**
```prisma
id String @id @default(uuid())
```

**2. Timestamps on All Models**
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

**3. Soft Deletes**
```prisma
deletedAt DateTime?
```

**4. Proper Indexes**
```prisma
@@index([email])
@@index([userId, status])
```

**5. Cascade Deletes for Dependencies**
```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

**6. Decimal for Money**
```prisma
price Decimal @db.Decimal(10, 2)
```

**7. Table Name Mapping**
```prisma
@@map("users")  // Maps to 'users' table instead of 'User'
```

## Migration Workflow

### Creating Migrations

```bash
# 1. Make schema changes in prisma/schema.prisma

# 2. Create migration (development)
pnpm --filter api prisma migrate dev --name add_user_profile

# 3. Apply migration (production)
pnpm --filter api prisma migrate deploy

# 4. Generate Prisma Client
pnpm --filter api prisma generate
```

### Migration Best Practices

**1. Descriptive Names**
```bash
# Good
prisma migrate dev --name add_user_email_verification
prisma migrate dev --name create_products_table

# Bad
prisma migrate dev --name update
prisma migrate dev --name fix
```

**2. Review Generated SQL**
```bash
# Check the migration SQL before applying
cat prisma/migrations/[timestamp]_[name]/migration.sql
```

**3. Data Migrations**

For complex data transformations, create a migration and edit the SQL:

```bash
# Create migration
prisma migrate dev --create-only --name migrate_user_data

# Edit the generated SQL file
# Add data transformation logic
```

Example data migration:
```sql
-- Migration SQL
ALTER TABLE "users" ADD COLUMN "full_name" TEXT;

-- Data migration
UPDATE "users" 
SET "full_name" = CONCAT("first_name", ' ', "last_name");

-- Cleanup
ALTER TABLE "users" DROP COLUMN "first_name";
ALTER TABLE "users" DROP COLUMN "last_name";
```

**4. Rollback Strategy**

```bash
# Reset database (development only!)
pnpm --filter api prisma migrate reset

# For production, create a new migration to revert changes
```

### Migration in CI/CD

```bash
# In your CI/CD pipeline
pnpm --filter api prisma migrate deploy
pnpm --filter api prisma generate
```

## Prisma Client Usage

### Basic Queries

```typescript
// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: 'hashed',
    name: 'John Doe'
  }
})

// Find unique
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// Find many with filtering
const users = await prisma.user.findMany({
  where: {
    role: 'ADMIN',
    deletedAt: null
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 10,
  skip: 0
})

// Update
const user = await prisma.user.update({
  where: { id: userId },
  data: { name: 'Jane Doe' }
})

// Delete
await prisma.user.delete({
  where: { id: userId }
})

// Soft delete
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() }
})
```

### Relations

```typescript
// Include relations
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    orders: {
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    }
  }
})

// Select specific fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    profile: {
      select: {
        bio: true,
        avatar: true
      }
    }
  }
})

// Create with relations
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: 'hashed',
    name: 'John Doe',
    profile: {
      create: {
        bio: 'Software developer',
        avatar: 'https://example.com/avatar.jpg'
      }
    }
  },
  include: {
    profile: true
  }
})
```

### Transactions

```typescript
// Sequential operations
const result = await prisma.$transaction(async (tx) => {
  // Deduct inventory
  const product = await tx.product.update({
    where: { id: productId },
    data: {
      stock: {
        decrement: quantity
      }
    }
  })

  if (product.stock < 0) {
    throw new Error('Insufficient stock')
  }

  // Create order
  const order = await tx.order.create({
    data: {
      userId,
      total,
      items: {
        create: {
          productId,
          quantity,
          price: product.price
        }
      }
    }
  })

  return order
})

// Batch operations with rollback
const [updatedUser, createdLog] = await prisma.$transaction([
  prisma.user.update({
    where: { id: userId },
    data: { name: newName }
  }),
  prisma.auditLog.create({
    data: {
      action: 'USER_UPDATE',
      userId,
      details: { newName }
    }
  })
])
```

### Advanced Queries

```typescript
// Aggregation
const stats = await prisma.order.aggregate({
  where: {
    status: 'COMPLETED'
  },
  _sum: {
    total: true
  },
  _avg: {
    total: true
  },
  _count: true
})

// Group by
const ordersByStatus = await prisma.order.groupBy({
  by: ['status'],
  _count: {
    id: true
  },
  _sum: {
    total: true
  }
})

// Raw queries (when needed)
const result = await prisma.$queryRaw`
  SELECT u.*, COUNT(o.id) as order_count
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.deleted_at IS NULL
  GROUP BY u.id
  HAVING COUNT(o.id) > 5
`

// Typed raw query
import { Prisma } from '@prisma/client'

const users = await prisma.$queryRaw<User[]>`
  SELECT * FROM users WHERE email LIKE ${`%${search}%`}
`
```

## Seeding

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: 'hashed_password',
        name: 'Admin User',
        role: 'ADMIN',
        profile: {
          create: {
            bio: 'System administrator'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'user@example.com',
        password: 'hashed_password',
        name: 'Regular User',
        role: 'USER'
      }
    })
  ])

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Product 1',
        description: 'Description 1',
        price: 99.99,
        stock: 100
      }
    }),
    prisma.product.create({
      data: {
        name: 'Product 2',
        description: 'Description 2',
        price: 149.99,
        stock: 50
      }
    })
  ])

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to package.json:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Run seed:
```bash
pnpm --filter api prisma db seed
```

## Performance Optimization

### 1. Connection Pooling

```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 2. Select Only Needed Fields

```typescript
// Bad - fetches all fields
const users = await prisma.user.findMany()

// Good - only fetches needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
  }
})
```

### 3. Pagination

```typescript
async function getPaginatedUsers(page: number, limit: number) {
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count()
  ])

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
```

### 4. Batch Operations

```typescript
// Create many
await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', password: 'hash', name: 'User 1' },
    { email: 'user2@example.com', password: 'hash', name: 'User 2' }
  ],
  skipDuplicates: true
})

// Update many
await prisma.user.updateMany({
  where: {
    role: 'USER'
  },
  data: {
    role: 'VERIFIED_USER'
  }
})
```

## Testing with Prisma

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client'
import { beforeEach } from 'vitest'

const prisma = new PrismaClient()

beforeEach(async () => {
  // Clear database before each test
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany()
  ])
})

// tests/user.test.ts
import { describe, it, expect } from 'vitest'
import { prisma } from '@/config/database'
import { UserService } from '@/modules/users/users.service'

describe('UserService', () => {
  it('should create a user', async () => {
    const userService = new UserService()
    
    const user = await userService.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    })

    expect(user.email).toBe('test@example.com')
    
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
    
    expect(dbUser).toBeTruthy()
  })
})
```
