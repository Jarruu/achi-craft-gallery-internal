import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock CSS imports
vi.mock('../styles.css?url', () => ({ default: '' }))

// Mock image imports
vi.mock('../assets/achi-logo-1.jpg', () => ({ default: '/achi-logo-1.jpg' }))
vi.mock('../assets/art-gallery-60-1.png', () => ({ default: '/art-gallery-60-1.png' }))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (_path: string) => (config: Record<string, unknown>) => ({ ...config }),
  createRootRouteWithContext: () => () => (config: Record<string, unknown>) => ({
    ...config,
    useLoaderData: vi.fn(),
  }),
  Link: ({ children, to, ...props }: Record<string, unknown>) => {
    const React = require('react')
    return React.createElement('a', { href: to, ...props }, children)
  },
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
  useRouter: () => ({ invalidate: vi.fn() }),
  useRouterState: () => ({
    location: { pathname: '/' },
    resolvedLocation: { pathname: '/' },
  }),
  redirect: vi.fn(),
  HeadContent: () => null,
  Scripts: () => null,
}))

// Mock TanStack React Start
vi.mock('@tanstack/react-start', () => ({
  createServerFn: ({ method }: { method: string }) => ({
    inputValidator: (schema: unknown) => ({
      handler: (fn: unknown) => fn,
    }),
    handler: (fn: unknown) => fn,
  }),
  createIsomorphicFn: () => ({
    client: (fn: unknown) => ({
      server: () => fn,
    }),
  }),
}))

// Mock TanStack React Start server
vi.mock('@tanstack/react-start/server', () => ({
  getCookie: vi.fn(),
}))

// Mock server-only module
vi.mock('@tanstack/react-start/server-only', () => ({}))

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    material: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    stockLog: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    production: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    productMaterial: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    typeOption: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    categoryOption: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    qualityOption: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    unitOption: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({})),
  })),
}))

// Mock Prisma adapter
vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn(),
}))

// Mock db.server
vi.mock('#/db.server', () => ({
  prisma: {
    material: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    stockLog: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    production: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    productMaterial: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    typeOption: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    categoryOption: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    qualityOption: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    unitOption: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({})),
  },
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const React = require('react')
  const createIcon = (name: string) => {
    const Icon = (props: Record<string, unknown>) =>
      React.createElement('span', { 'data-testid': `icon-${name}`, ...props })
    Icon.displayName = name
    return Icon
  }

  return {
    Menu: createIcon('Menu'),
    X: createIcon('X'),
    Layers: createIcon('Layers'),
    Cpu: createIcon('Cpu'),
    History: createIcon('History'),
    LayoutDashboard: createIcon('LayoutDashboard'),
    LogOut: createIcon('LogOut'),
    Mail: createIcon('Mail'),
    Lock: createIcon('Lock'),
    ArrowRight: createIcon('ArrowRight'),
    AlertCircle: createIcon('AlertCircle'),
    Eye: createIcon('Eye'),
    EyeOff: createIcon('EyeOff'),
    AlertTriangle: createIcon('AlertTriangle'),
    Plus: createIcon('Plus'),
    Trash2: createIcon('Trash2'),
    Check: createIcon('Check'),
    PlusCircle: createIcon('PlusCircle'),
    MinusCircle: createIcon('MinusCircle'),
    FileText: createIcon('FileText'),
    Pencil: createIcon('Pencil'),
    Search: createIcon('Search'),
    TrendingUp: createIcon('TrendingUp'),
    TrendingDown: createIcon('TrendingDown'),
    Settings: createIcon('Settings'),
    Calendar: createIcon('Calendar'),
    ArrowUpDown: createIcon('ArrowUpDown'),
    SlidersHorizontal: createIcon('SlidersHorizontal'),
    ChevronRight: createIcon('ChevronRight'),
  }
})

// Mock radix-ui Dialog
vi.mock('../components/ui/dialog', () => {
  const React = require('react')
  return {
    Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      open ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null,
    DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'dialog-content', className }, children),
    DialogHeader: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dialog-header' }, children),
    DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('h2', { 'data-testid': 'dialog-title', className }, children),
    DialogDescription: ({ children }: { children: React.ReactNode }) =>
      React.createElement('p', { 'data-testid': 'dialog-description' }, children),
    DialogFooter: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      React.createElement('div', { 'data-testid': 'dialog-footer', className }, children),
  }
})

// Mock ImageUploadInput
vi.mock('../components/ImageUploadInput', () => {
  const React = require('react')
  return {
    ImageUploadInput: (props: Record<string, unknown>) =>
      React.createElement('div', { 'data-testid': 'image-upload-input' }),
    uploadToImgBB: vi.fn().mockResolvedValue('https://i.ibb.co/mock-image.jpg'),
  }
})

// Global window mock 
Object.defineProperty(window, 'location', {
  value: {
    href: '/',
    pathname: '/',
  },
  writable: true,
})
