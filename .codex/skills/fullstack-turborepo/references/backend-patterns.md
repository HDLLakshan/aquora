# Backend Architecture Patterns

Detailed patterns for Express backend with layered architecture.

## Module Structure

Each module follows this structure:

```
modules/[module-name]/
├── [module].routes.ts      # Route definitions
├── [module].controller.ts  # HTTP handlers
├── [module].service.ts     # Business logic
├── [module].repository.ts  # Data access
├── [module].types.ts       # Module-specific types
└── [module].validator.ts   # Request validation
```

## Controller Pattern

Controllers handle HTTP requests and responses. They should NOT contain business logic.

```typescript
// modules/users/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from './users.service';
import { CreateUserDTO, UpdateUserDTO } from './users.types';
import { ApiError } from '@/utils/errors';

export class UserController {
  constructor(private userService: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDTO = req.body;
      const user = await this.userService.create(userData);
      
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: UpdateUserDTO = req.body;
      const user = await this.userService.update(id, updateData);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.userService.delete(id);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await this.userService.list({
        page: Number(page),
        limit: Number(limit)
      });
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
```

**Key Points:**
- Always wrap async handlers with try-catch
- Pass errors to `next()` for centralized error handling
- Use arrow functions for proper `this` binding
- Return consistent response structure
- Extract and validate parameters/body before service calls
- Don't catch errors you can't handle - let them bubble up

## Service Pattern

Services contain business logic. They orchestrate repository calls and implement domain rules.

```typescript
// modules/users/users.service.ts
import { UserRepository } from './users.repository';
import { CreateUserDTO, UpdateUserDTO, User } from './users.types';
import { ApiError } from '@/utils/errors';
import { hashPassword, comparePassword } from '@/utils/crypto';
import { PaginationParams, PaginatedResult } from '@/types/pagination';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(data: CreateUserDTO): Promise<User> {
    // Business rule: Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(409, 'Email already in use');
    }

    // Business logic: Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword
    });

    // Business rule: Send welcome email (fire and forget)
    this.sendWelcomeEmail(user).catch(err => 
      console.error('Failed to send welcome email:', err)
    );

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Business rule: If updating email, check uniqueness
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ApiError(409, 'Email already in use');
      }
    }

    // Business logic: Hash password if updating
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Soft delete
    await this.userRepository.softDelete(id);
  }

  async list(params: PaginationParams): Promise<PaginatedResult<User>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userRepository.findMany({ skip, take: limit }),
      this.userRepository.count()
    ]);

    return {
      data: users,
      page,
      limit,
      total
    };
  }

  async authenticate(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid credentials');
    }

    return user;
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    // Email sending logic
  }
}
```

**Key Points:**
- Validate business rules (uniqueness, permissions, etc.)
- Transform data (hashing, formatting)
- Orchestrate multiple repository calls
- Handle transactions when needed
- Throw ApiError for business rule violations
- Keep services focused on one domain entity

## Repository Pattern

Repositories handle data access. They translate domain operations to database queries.

```typescript
// modules/users/users.repository.ts
import { PrismaClient, User } from '@prisma/client';
import { CreateUserDTO, UpdateUserDTO } from './users.types';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDTO): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'USER'
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async findMany(options: {
    skip?: number;
    take?: number;
    where?: any;
  }): Promise<User[]> {
    return this.prisma.user.findMany({
      skip: options.skip,
      take: options.take,
      where: {
        ...options.where,
        deletedAt: null // Exclude soft-deleted
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async count(where?: any): Promise<number> {
    return this.prisma.user.count({
      where: {
        ...where,
        deletedAt: null
      }
    });
  }

  // Complex query example
  async findActiveUsersWithOrders(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        orders: {
          some: {
            status: 'COMPLETED'
          }
        }
      },
      include: {
        orders: {
          where: {
            status: 'COMPLETED'
          },
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
  }

  // Transaction example
  async createWithProfile(
    userData: CreateUserDTO,
    profileData: any
  ): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: userData
      });

      await tx.profile.create({
        data: {
          ...profileData,
          userId: user.id
        }
      });

      return user;
    });
  }
}
```

**Key Points:**
- All Prisma queries in repositories
- No business logic in repositories
- Handle complex queries and joins
- Use transactions for multi-step operations
- Consistent error handling
- Include/exclude related data as needed

## Routes Pattern

Routes define HTTP endpoints and wire up middleware.

```typescript
// modules/users/users.routes.ts
import { Router } from 'express';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { prisma } from '@/config/database';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from './users.validator';

const router = Router();

// Dependency injection
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Public routes
router.post(
  '/users',
  validate(createUserSchema),
  userController.create
);

// Protected routes
router.get(
  '/users/:id',
  authenticate,
  userController.getById
);

router.get(
  '/users',
  authenticate,
  userController.list
);

router.patch(
  '/users/:id',
  authenticate,
  validate(updateUserSchema),
  userController.update
);

router.delete(
  '/users/:id',
  authenticate,
  userController.delete
);

export default router;
```

## Validation Pattern

Use Zod schemas for request validation.

```typescript
// modules/users/users.validator.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.enum(['USER', 'ADMIN']).optional()
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    name: z.string().min(2).optional()
  })
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});
```

## Error Handling

Custom error classes and middleware:

```typescript
// utils/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/errors';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Unique constraint violation'
      });
    }
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
```

## Module Registration

Register modules in main app:

```typescript
// src/index.ts
import express from 'express';
import userRoutes from '@/modules/users/users.routes';
import customerRoutes from '@/modules/customers/customers.routes';
import { errorHandler } from '@/middleware/error.middleware';

const app = express();

app.use(express.json());

// Register routes
app.use('/api', userRoutes);
app.use('/api', customerRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
```
