# Frontend Patterns (Next.js App Router)

Patterns for Next.js 15+ with App Router, shadcn/ui, and feature-based architecture.

## Feature Module Structure

Each feature is self-contained:

```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── ProtectedRoute.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useSession.ts
├── services/
│   └── auth.service.ts
├── types.ts
└── index.ts  # Public API
```

## Component Patterns

### Client Component with Form

```typescript
// features/auth/components/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { useLoginMutation } from '@/features/auth/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { mutate: login, isPending } = useLoginMutation()
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Logged in successfully'
        })
        router.push('/dashboard')
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
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="you@example.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </Form>
  )
}
```

### Server Component with Data Fetching

```typescript
// app/dashboard/customers/page.tsx
import { Suspense } from 'react'
import { CustomerList } from '@/features/customers/components/CustomerList'
import { CustomerListSkeleton } from '@/features/customers/components/CustomerListSkeleton'
import { getCustomers } from '@/features/customers/services/customers.service'

export default async function CustomersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Customers</h1>
      
      <Suspense fallback={<CustomerListSkeleton />}>
        <CustomerListAsync />
      </Suspense>
    </div>
  )
}

async function CustomerListAsync() {
  const customers = await getCustomers()
  return <CustomerList customers={customers} />
}
```

### Shared Component (Presentational)

```typescript
// components/shared/DataTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
}

export function DataTable<T>({ data, columns, keyExtractor }: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              No data available
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render 
                    ? column.render(item)
                    : (item as any)[column.key]
                  }
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
```

## Hook Patterns

### API Mutation Hook with React Query

```typescript
// features/auth/hooks/useAuth.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/features/auth/services/auth.service'
import type { LoginCredentials, SignupData, User } from '@/features/auth/types'

export function useLoginMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      authService.login(credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user)
    }
  })
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (data: SignupData) => authService.signup(data)
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear()
    }
  })
}
```

### Query Hook with React Query

```typescript
// features/customers/hooks/useCustomers.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerService } from '@/features/customers/services/customers.service'
import type { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@/features/customers/types'

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll()
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerService.getById(id),
    enabled: !!id
  })
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCustomerDTO) => 
      customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    }
  })
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDTO }) =>
      customerService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] })
    }
  })
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    }
  })
}
```

### Custom Hook for Local State

```typescript
// features/products/hooks/useProductFilters.ts
'use client'

import { useState, useMemo } from 'react'
import type { Product } from '@/features/products/types'

export function useProductFilters(products: Product[]) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase())
      
      const matchesCategory = 
        category === 'all' || product.category === category
      
      const matchesPrice = 
        product.price >= priceRange[0] && 
        product.price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [products, search, category, priceRange])

  return {
    search,
    setSearch,
    category,
    setCategory,
    priceRange,
    setPriceRange,
    filteredProducts
  }
}
```

## Service Patterns

### API Service with Fetch

```typescript
// features/customers/services/customers.service.ts
import { apiClient } from '@/lib/api-client'
import type { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@/features/customers/types'

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await apiClient.get<{ data: Customer[] }>('/customers')
    return response.data
  },

  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get<{ data: Customer }>(`/customers/${id}`)
    return response.data
  },

  async create(data: CreateCustomerDTO): Promise<Customer> {
    const response = await apiClient.post<{ data: Customer }>('/customers', data)
    return response.data
  },

  async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    const response = await apiClient.patch<{ data: Customer }>(
      `/customers/${id}`,
      data
    )
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`)
  }
}
```

### Server-Side Service (for RSC)

```typescript
// features/customers/services/customers.server.ts
import 'server-only'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

export async function getCustomers() {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${API_URL}/customers`, {
    headers,
    next: { revalidate: 60 } // Cache for 60 seconds
  })

  if (!response.ok) {
    throw new Error('Failed to fetch customers')
  }

  const data = await response.json()
  return data.data
}

export async function getCustomer(id: string) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${API_URL}/customers/${id}`, {
    headers,
    cache: 'no-store' // Always fetch fresh data
  })

  if (!response.ok) {
    throw new Error('Failed to fetch customer')
  }

  const data = await response.json()
  return data.data
}
```

## API Client Pattern

```typescript
// lib/api-client.ts
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const token = localStorage.getItem('auth-token')
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred'
      }))
      throw new Error(error.message)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
)
```

## Layout Patterns

### Root Layout

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My App',
  description: 'Built with Next.js and shadcn/ui'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
```

### Dashboard Layout

```typescript
// app/dashboard/layout.tsx
import { Sidebar } from '@/components/shared/Sidebar'
import { Header } from '@/components/shared/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Providers Pattern

```typescript
// components/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false
          }
        }
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

## Loading States

```typescript
// app/dashboard/customers/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}
```

## Error Handling

```typescript
// app/dashboard/customers/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```
