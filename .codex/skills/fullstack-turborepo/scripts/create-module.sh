#!/bin/bash
# Generate a new backend module with full layered architecture

set -e

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
  echo "Usage: ./create-module.sh <module-name>"
  echo "Example: ./create-module.sh users"
  exit 1
fi

# Convert to PascalCase for class names
MODULE_PASCAL=$(echo $MODULE_NAME | sed -r 's/(^|_)([a-z])/\U\2/g')

# Ensure we're in the API directory
if [ ! -d "apps/api/src" ]; then
  echo "Error: Must run from project root (apps/api/src not found)"
  exit 1
fi

MODULE_PATH="apps/api/src/modules/$MODULE_NAME"

echo "📦 Creating module: $MODULE_NAME"
echo "Path: $MODULE_PATH"

# Create module directory
mkdir -p $MODULE_PATH

# Create types file
cat > $MODULE_PATH/${MODULE_NAME}.types.ts << EOF
export interface ${MODULE_PASCAL} {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface Create${MODULE_PASCAL}DTO {
  // Add fields here
}

export interface Update${MODULE_PASCAL}DTO {
  // Add fields here
}

export interface ${MODULE_PASCAL}Filters {
  // Add filter fields here
}
EOF

echo "✅ Created ${MODULE_NAME}.types.ts"

# Create repository
cat > $MODULE_PATH/${MODULE_NAME}.repository.ts << EOF
import { PrismaClient, ${MODULE_PASCAL} } from '@prisma/client'
import { Create${MODULE_PASCAL}DTO, Update${MODULE_PASCAL}DTO } from './${MODULE_NAME}.types'

export class ${MODULE_PASCAL}Repository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Create${MODULE_PASCAL}DTO): Promise<${MODULE_PASCAL}> {
    return this.prisma.${MODULE_NAME}.create({
      data
    })
  }

  async findById(id: string): Promise<${MODULE_PASCAL} | null> {
    return this.prisma.${MODULE_NAME}.findUnique({
      where: { id }
    })
  }

  async findMany(options: {
    skip?: number
    take?: number
    where?: any
  }): Promise<${MODULE_PASCAL}[]> {
    return this.prisma.${MODULE_NAME}.findMany({
      skip: options.skip,
      take: options.take,
      where: options.where,
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async update(id: string, data: Update${MODULE_PASCAL}DTO): Promise<${MODULE_PASCAL}> {
    return this.prisma.${MODULE_NAME}.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.${MODULE_NAME}.delete({
      where: { id }
    })
  }

  async count(where?: any): Promise<number> {
    return this.prisma.${MODULE_NAME}.count({ where })
  }
}
EOF

echo "✅ Created ${MODULE_NAME}.repository.ts"

# Create service
cat > $MODULE_PATH/${MODULE_NAME}.service.ts << EOF
import { ${MODULE_PASCAL}Repository } from './${MODULE_NAME}.repository'
import { Create${MODULE_PASCAL}DTO, Update${MODULE_PASCAL}DTO, ${MODULE_PASCAL} } from './${MODULE_NAME}.types'
import { ApiError } from '@/utils/errors'

export class ${MODULE_PASCAL}Service {
  constructor(private repository: ${MODULE_PASCAL}Repository) {}

  async create(data: Create${MODULE_PASCAL}DTO): Promise<${MODULE_PASCAL}> {
    // Add business logic and validation here
    return this.repository.create(data)
  }

  async findById(id: string): Promise<${MODULE_PASCAL} | null> {
    return this.repository.findById(id)
  }

  async update(id: string, data: Update${MODULE_PASCAL}DTO): Promise<${MODULE_PASCAL}> {
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new ApiError(404, '${MODULE_PASCAL} not found')
    }

    // Add business logic here
    return this.repository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new ApiError(404, '${MODULE_PASCAL} not found')
    }

    await this.repository.delete(id)
  }

  async list(params: {
    page: number
    limit: number
  }) {
    const { page, limit } = params
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.repository.findMany({ skip, take: limit }),
      this.repository.count()
    ])

    return {
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
EOF

echo "✅ Created ${MODULE_NAME}.service.ts"

# Create controller
cat > $MODULE_PATH/${MODULE_NAME}.controller.ts << EOF
import { Request, Response, NextFunction } from 'express'
import { ${MODULE_PASCAL}Service } from './${MODULE_NAME}.service'
import { Create${MODULE_PASCAL}DTO, Update${MODULE_PASCAL}DTO } from './${MODULE_NAME}.types'
import { ApiError } from '@/utils/errors'

export class ${MODULE_PASCAL}Controller {
  constructor(private service: ${MODULE_PASCAL}Service) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: Create${MODULE_PASCAL}DTO = req.body
      const result = await this.service.create(data)
      
      res.status(201).json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const result = await this.service.findById(id)
      
      if (!result) {
        throw new ApiError(404, '${MODULE_PASCAL} not found')
      }
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const data: Update${MODULE_PASCAL}DTO = req.body
      const result = await this.service.update(id, data)
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      await this.service.delete(id)
      
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '10' } = req.query
      const result = await this.service.list({
        page: Number(page),
        limit: Number(limit)
      })
      
      res.json({
        success: true,
        ...result
      })
    } catch (error) {
      next(error)
    }
  }
}
EOF

echo "✅ Created ${MODULE_NAME}.controller.ts"

# Create validator
cat > $MODULE_PATH/${MODULE_NAME}.validator.ts << EOF
import { z } from 'zod'

export const create${MODULE_PASCAL}Schema = z.object({
  body: z.object({
    // Add validation schema for create
  })
})

export const update${MODULE_PASCAL}Schema = z.object({
  body: z.object({
    // Add validation schema for update
  })
})

export const list${MODULE_PASCAL}Schema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
})
EOF

echo "✅ Created ${MODULE_NAME}.validator.ts"

# Create routes
cat > $MODULE_PATH/${MODULE_NAME}.routes.ts << EOF
import { Router } from 'express'
import { ${MODULE_PASCAL}Controller } from './${MODULE_NAME}.controller'
import { ${MODULE_PASCAL}Service } from './${MODULE_NAME}.service'
import { ${MODULE_PASCAL}Repository } from './${MODULE_NAME}.repository'
import { prisma } from '@/config/database'
import { validate } from '@/middleware/validation.middleware'
import { create${MODULE_PASCAL}Schema, update${MODULE_PASCAL}Schema, list${MODULE_PASCAL}Schema } from './${MODULE_NAME}.validator'

const router = Router()

// Dependency injection
const repository = new ${MODULE_PASCAL}Repository(prisma)
const service = new ${MODULE_PASCAL}Service(repository)
const controller = new ${MODULE_PASCAL}Controller(service)

// Routes
router.post(
  '/${MODULE_NAME}',
  validate(create${MODULE_PASCAL}Schema),
  controller.create
)

router.get(
  '/${MODULE_NAME}/:id',
  controller.getById
)

router.get(
  '/${MODULE_NAME}',
  validate(list${MODULE_PASCAL}Schema),
  controller.list
)

router.patch(
  '/${MODULE_NAME}/:id',
  validate(update${MODULE_PASCAL}Schema),
  controller.update
)

router.delete(
  '/${MODULE_NAME}/:id',
  controller.delete
)

export default router
EOF

echo "✅ Created ${MODULE_NAME}.routes.ts"

echo ""
echo "✅ Module '$MODULE_NAME' created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Add the ${MODULE_PASCAL} model to prisma/schema.prisma"
echo "2. Run: pnpm --filter api prisma migrate dev --name add_${MODULE_NAME}"
echo "3. Import and register routes in src/index.ts:"
echo "   import ${MODULE_NAME}Routes from '@/modules/${MODULE_NAME}/${MODULE_NAME}.routes'"
echo "   app.use('/api', ${MODULE_NAME}Routes)"
echo "4. Update validation schemas in ${MODULE_NAME}.validator.ts"
echo "5. Add business logic to ${MODULE_NAME}.service.ts"
echo ""
echo "🎉 Happy coding!"
