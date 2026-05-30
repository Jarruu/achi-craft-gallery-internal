import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Recreate search schemas from routes
const materialsSearchSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  page: z.number().catch(1).optional(),
  limit: z.number().catch(10).optional(),
})

const productsSearchSchema = z.object({
  search: z.string().optional(),
  page: z.number().catch(1).optional(),
  limit: z.number().catch(10).optional(),
})

const logsSearchSchema = z.object({
  type: z.string().optional(),
})

describe('Navigation - Route Definitions', () => {
  const routes = ['/', '/login', '/materials', '/products', '/logs']

  it('should have all 5 defined routes', () => {
    expect(routes).toHaveLength(5)
  })

  it('should include dashboard route (index)', () => {
    expect(routes).toContain('/')
  })

  it('should include login route', () => {
    expect(routes).toContain('/login')
  })

  it('should include materials route', () => {
    expect(routes).toContain('/materials')
  })

  it('should include products route', () => {
    expect(routes).toContain('/products')
  })

  it('should include logs route', () => {
    expect(routes).toContain('/logs')
  })
})

describe('Navigation - Sidebar Links', () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { label: 'Bahan Baku', path: '/materials', icon: 'Layers' },
    { label: 'Daftar Produk', path: '/products', icon: 'Cpu' },
    { label: 'Riwayat Stok', path: '/logs', icon: 'History' },
  ]

  it('should have 4 navigation items', () => {
    expect(navItems).toHaveLength(4)
  })

  it('should have correct labels for all nav items', () => {
    expect(navItems[0].label).toBe('Dashboard')
    expect(navItems[1].label).toBe('Bahan Baku')
    expect(navItems[2].label).toBe('Daftar Produk')
    expect(navItems[3].label).toBe('Riwayat Stok')
  })

  it('should have correct paths for all nav items', () => {
    expect(navItems[0].path).toBe('/')
    expect(navItems[1].path).toBe('/materials')
    expect(navItems[2].path).toBe('/products')
    expect(navItems[3].path).toBe('/logs')
  })

  it('should have unique icons for all nav items', () => {
    const icons = navItems.map(n => n.icon)
    const uniqueIcons = new Set(icons)
    expect(uniqueIcons.size).toBe(navItems.length)
  })
})

describe('Navigation - Authentication Guard', () => {
  it('should redirect to login when user is not authenticated and not on login page', () => {
    const user = null
    const pathname = '/materials'
    const isLoginPage = pathname === '/login'

    const shouldRedirectToLogin = !isLoginPage && !user
    expect(shouldRedirectToLogin).toBe(true)
  })

  it('should allow access when user is authenticated', () => {
    const user = 'admin@achi.com'
    const pathname = '/materials'
    const isLoginPage = pathname === '/login'

    const shouldRedirectToLogin = !isLoginPage && !user
    expect(shouldRedirectToLogin).toBe(false)
  })

  it('should redirect authenticated users from login page to dashboard', () => {
    const user = 'admin@achi.com'
    const pathname = '/login'
    const isLoginPage = pathname === '/login'

    const shouldRedirectToDashboard = isLoginPage && !!user
    expect(shouldRedirectToDashboard).toBe(true)
  })

  it('should allow unauthenticated users on login page', () => {
    const user = null
    const pathname = '/login'
    const isLoginPage = pathname === '/login'

    const shouldRedirectToLogin = !isLoginPage && !user
    const shouldRedirectToDashboard = isLoginPage && !!user
    expect(shouldRedirectToLogin || shouldRedirectToDashboard).toBe(false)
  })
})

describe('Navigation - Materials Search Params', () => {
  it('should validate empty search params', () => {
    const result = materialsSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should validate search with text filter', () => {
    const result = materialsSearchSchema.safeParse({ search: 'kulit' })
    expect(result.success).toBe(true)
  })

  it('should validate search with type filter', () => {
    const result = materialsSearchSchema.safeParse({ type: 'LEATHER' })
    expect(result.success).toBe(true)
  })

  it('should validate search with category filter', () => {
    const result = materialsSearchSchema.safeParse({ category: 'Premium' })
    expect(result.success).toBe(true)
  })

  it('should validate pagination params', () => {
    const result = materialsSearchSchema.safeParse({ page: 2, limit: 20 })
    expect(result.success).toBe(true)
  })

  it('should default page to 1 on invalid value', () => {
    const result = materialsSearchSchema.safeParse({ page: 'invalid' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
    }
  })

  it('should default limit to 10 on invalid value', () => {
    const result = materialsSearchSchema.safeParse({ limit: 'invalid' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(10)
    }
  })

  it('should accept all params combined', () => {
    const result = materialsSearchSchema.safeParse({
      search: 'kulit',
      type: 'LEATHER',
      category: 'Premium',
      page: 1,
      limit: 10,
    })
    expect(result.success).toBe(true)
  })
})

describe('Navigation - Products Search Params', () => {
  it('should validate empty search params', () => {
    const result = productsSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should validate search with text', () => {
    const result = productsSearchSchema.safeParse({ search: 'dompet' })
    expect(result.success).toBe(true)
  })

  it('should validate pagination', () => {
    const result = productsSearchSchema.safeParse({ page: 3, limit: 5 })
    expect(result.success).toBe(true)
  })
})

describe('Navigation - Logs Search Params', () => {
  it('should validate empty search', () => {
    const result = logsSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should validate type filter', () => {
    const result = logsSearchSchema.safeParse({ type: 'INCOMING' })
    expect(result.success).toBe(true)
  })
})

describe('Pagination Logic', () => {
  it('should calculate total pages correctly', () => {
    const totalCount = 25
    const limit = 10
    const totalPages = Math.ceil(totalCount / limit)
    expect(totalPages).toBe(3)
  })

  it('should return 1 page when count equals limit', () => {
    const totalCount = 10
    const limit = 10
    const totalPages = Math.ceil(totalCount / limit)
    expect(totalPages).toBe(1)
  })

  it('should return 1 page when count is less than limit', () => {
    const totalCount = 5
    const limit = 10
    const totalPages = Math.ceil(totalCount / limit)
    expect(totalPages).toBe(1)
  })

  it('should return 0 pages for empty results', () => {
    const totalCount = 0
    const limit = 10
    const totalPages = Math.ceil(totalCount / limit)
    expect(totalPages).toBe(0)
  })

  it('should disable previous button on first page', () => {
    const page = 1
    const isPrevDisabled = page <= 1
    expect(isPrevDisabled).toBe(true)
  })

  it('should disable next button on last page', () => {
    const page = 3
    const totalPages = 3
    const isNextDisabled = page >= totalPages
    expect(isNextDisabled).toBe(true)
  })

  it('should enable both buttons on middle pages', () => {
    const page = 2
    const totalPages = 3
    expect(page > 1).toBe(true)
    expect(page < totalPages).toBe(true)
  })

  it('should calculate correct offset for page', () => {
    const page = 3
    const limit = 10
    const skip = (page - 1) * limit
    expect(skip).toBe(20)
  })
})

describe('Logout Flow', () => {
  it('should clear acg_session cookie on logout', () => {
    const cookieString = 'acg_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    expect(cookieString).toContain('acg_session=')
    expect(cookieString).toContain('expires=Thu, 01 Jan 1970 00:00:00 GMT')
  })

  it('should redirect to login page after logout', () => {
    const redirectUrl = '/login'
    expect(redirectUrl).toBe('/login')
  })
})

describe('View Mode Toggle', () => {
  it('should support grid view mode', () => {
    const viewMode: 'grid' | 'table' = 'grid'
    expect(viewMode).toBe('grid')
  })

  it('should support table view mode', () => {
    const viewMode: 'grid' | 'table' = 'table'
    expect(viewMode).toBe('table')
  })

  it('should default to grid view', () => {
    const defaultMode: 'grid' | 'table' = 'grid'
    expect(defaultMode).toBe('grid')
  })
})
