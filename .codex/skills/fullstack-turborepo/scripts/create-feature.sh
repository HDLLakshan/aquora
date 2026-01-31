#!/bin/bash
# Generate a new frontend feature module

set -e

FEATURE_NAME=$1

if [ -z "$FEATURE_NAME" ]; then
  echo "Usage: ./create-feature.sh <feature-name>"
  echo "Example: ./create-feature.sh products"
  exit 1
fi

# Convert to PascalCase for component names
FEATURE_PASCAL=$(echo $FEATURE_NAME | sed -r 's/(^|-)([a-z])/\U\2/g')

# Ensure we're in the project root
if [ ! -d "apps/web/src" ]; then
  echo "Error: Must run from project root (apps/web/src not found)"
  exit 1
fi

FEATURE_PATH="apps/web/src/features/$FEATURE_NAME"

echo "🎨 Creating feature: $FEATURE_NAME"
echo "Path: $FEATURE_PATH"

# Create feature directory structure
mkdir -p $FEATURE_PATH/{components,hooks,services}

# Create types file
cat > $FEATURE_PATH/types.ts << EOF
export interface ${FEATURE_PASCAL} {
  id: string
  createdAt: string
  updatedAt: string
}

export interface Create${FEATURE_PASCAL}DTO {
  // Add fields here
}

export interface Update${FEATURE_PASCAL}DTO {
  // Add fields here
}

export interface ${FEATURE_PASCAL}Filters {
  search?: string
  // Add filter fields here
}
EOF

echo "✅ Created types.ts"

# Create service
cat > $FEATURE_PATH/services/${FEATURE_NAME}.service.ts << EOF
import { apiClient } from '@/lib/api-client'
import type { ${FEATURE_PASCAL}, Create${FEATURE_PASCAL}DTO, Update${FEATURE_PASCAL}DTO } from '../types'

export const ${FEATURE_NAME}Service = {
  async getAll(): Promise<${FEATURE_PASCAL}[]> {
    const response = await apiClient.get<{ data: ${FEATURE_PASCAL}[] }>('/${FEATURE_NAME}')
    return response.data
  },

  async getById(id: string): Promise<${FEATURE_PASCAL}> {
    const response = await apiClient.get<{ data: ${FEATURE_PASCAL} }>(\`/${FEATURE_NAME}/\${id}\`)
    return response.data
  },

  async create(data: Create${FEATURE_PASCAL}DTO): Promise<${FEATURE_PASCAL}> {
    const response = await apiClient.post<{ data: ${FEATURE_PASCAL} }>('/${FEATURE_NAME}', data)
    return response.data
  },

  async update(id: string, data: Update${FEATURE_PASCAL}DTO): Promise<${FEATURE_PASCAL}> {
    const response = await apiClient.patch<{ data: ${FEATURE_PASCAL} }>(
      \`/${FEATURE_NAME}/\${id}\`,
      data
    )
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(\`/${FEATURE_NAME}/\${id}\`)
  }
}
EOF

echo "✅ Created ${FEATURE_NAME}.service.ts"

# Create hooks
cat > $FEATURE_PATH/hooks/use${FEATURE_PASCAL}.ts << EOF
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ${FEATURE_NAME}Service } from '../services/${FEATURE_NAME}.service'
import type { Create${FEATURE_PASCAL}DTO, Update${FEATURE_PASCAL}DTO } from '../types'

const QUERY_KEY = ['${FEATURE_NAME}']

export function use${FEATURE_PASCAL}List() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => ${FEATURE_NAME}Service.getAll()
  })
}

export function use${FEATURE_PASCAL}(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => ${FEATURE_NAME}Service.getById(id),
    enabled: !!id
  })
}

export function useCreate${FEATURE_PASCAL}() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Create${FEATURE_PASCAL}DTO) => 
      ${FEATURE_NAME}Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}

export function useUpdate${FEATURE_PASCAL}() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Update${FEATURE_PASCAL}DTO }) =>
      ${FEATURE_NAME}Service.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, variables.id] })
    }
  })
}

export function useDelete${FEATURE_PASCAL}() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => ${FEATURE_NAME}Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}
EOF

echo "✅ Created use${FEATURE_PASCAL}.ts"

# Create list component
cat > $FEATURE_PATH/components/${FEATURE_PASCAL}List.tsx << EOF
'use client'

import { use${FEATURE_PASCAL}List } from '../hooks/use${FEATURE_PASCAL}'
import { ${FEATURE_PASCAL}Card } from './${FEATURE_PASCAL}Card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function ${FEATURE_PASCAL}List() {
  const { data: items, isLoading, error } = use${FEATURE_PASCAL}List()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Failed to load ${FEATURE_NAME}</p>
        <Button variant="outline" className="mt-4">
          Try again
        </Button>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No ${FEATURE_NAME} found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <${FEATURE_PASCAL}Card key={item.id} item={item} />
      ))}
    </div>
  )
}
EOF

echo "✅ Created ${FEATURE_PASCAL}List.tsx"

# Create card component
cat > $FEATURE_PATH/components/${FEATURE_PASCAL}Card.tsx << EOF
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreVertical } from 'lucide-react'
import type { ${FEATURE_PASCAL} } from '../types'

interface ${FEATURE_PASCAL}CardProps {
  item: ${FEATURE_PASCAL}
}

export function ${FEATURE_PASCAL}Card({ item }: ${FEATURE_PASCAL}CardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {item.id}
        </CardTitle>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Add your card content here */}
        <p className="text-xs text-muted-foreground">
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}
EOF

echo "✅ Created ${FEATURE_PASCAL}Card.tsx"

# Create form component
cat > $FEATURE_PATH/components/${FEATURE_PASCAL}Form.tsx << EOF
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCreate${FEATURE_PASCAL} } from '../hooks/use${FEATURE_PASCAL}'
import { useToast } from '@/components/ui/use-toast'

const formSchema = z.object({
  // Add form fields here
})

type FormData = z.infer<typeof formSchema>

interface ${FEATURE_PASCAL}FormProps {
  onSuccess?: () => void
}

export function ${FEATURE_PASCAL}Form({ onSuccess }: ${FEATURE_PASCAL}FormProps) {
  const { toast } = useToast()
  const { mutate: create, isPending } = useCreate${FEATURE_PASCAL}()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Set default values
    }
  })

  const onSubmit = (data: FormData) => {
    create(data, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: '${FEATURE_PASCAL} created successfully'
        })
        form.reset()
        onSuccess?.()
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Add form fields here */}
        
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create ${FEATURE_PASCAL}'}
        </Button>
      </form>
    </Form>
  )
}
EOF

echo "✅ Created ${FEATURE_PASCAL}Form.tsx"

# Create index file
cat > $FEATURE_PATH/index.ts << EOF
// Components
export { ${FEATURE_PASCAL}List } from './components/${FEATURE_PASCAL}List'
export { ${FEATURE_PASCAL}Card } from './components/${FEATURE_PASCAL}Card'
export { ${FEATURE_PASCAL}Form } from './components/${FEATURE_PASCAL}Form'

// Hooks
export { 
  use${FEATURE_PASCAL}List,
  use${FEATURE_PASCAL},
  useCreate${FEATURE_PASCAL},
  useUpdate${FEATURE_PASCAL},
  useDelete${FEATURE_PASCAL}
} from './hooks/use${FEATURE_PASCAL}'

// Types
export type { 
  ${FEATURE_PASCAL},
  Create${FEATURE_PASCAL}DTO,
  Update${FEATURE_PASCAL}DTO,
  ${FEATURE_PASCAL}Filters
} from './types'
EOF

echo "✅ Created index.ts"

echo ""
echo "✅ Feature '$FEATURE_NAME' created successfully!"
echo ""
echo "📝 Files created:"
echo "  - types.ts"
echo "  - services/${FEATURE_NAME}.service.ts"
echo "  - hooks/use${FEATURE_PASCAL}.ts"
echo "  - components/${FEATURE_PASCAL}List.tsx"
echo "  - components/${FEATURE_PASCAL}Card.tsx"
echo "  - components/${FEATURE_PASCAL}Form.tsx"
echo "  - index.ts"
echo ""
echo "📋 Next steps:"
echo "1. Update types in $FEATURE_PATH/types.ts"
echo "2. Update form schema in ${FEATURE_PASCAL}Form.tsx"
echo "3. Customize ${FEATURE_PASCAL}Card.tsx with your data"
echo "4. Create a page at app/${FEATURE_NAME}/page.tsx:"
echo "   import { ${FEATURE_PASCAL}List } from '@/features/${FEATURE_NAME}'"
echo ""
echo "🎉 Happy coding!"
