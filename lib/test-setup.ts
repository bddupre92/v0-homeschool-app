import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Make React available globally for JSX in test environment
if (typeof global !== 'undefined') {
  global.React = React
}

// Mock Next.js components and hooks
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    React.createElement('a', { href, ...props }, children)
  )
}))

vi.mock('next/image', () => ({
  default: ({ alt, src, ...props }: any) => 
    React.createElement('img', { alt, src, ...props })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: vi.fn(),
}))

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
  },
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
  storage: {
    ref: vi.fn(),
  },
}))

vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
    createUser: vi.fn(),
  },
  adminDb: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
}))

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => 
    React.createElement(React.Fragment, {}, children),
}))

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => 
    React.createElement(React.Fragment, {}, children),
}))

// Mock Mapbox
vi.mock('mapbox-gl', () => ({
  Map: vi.fn(),
  Marker: vi.fn(),
  Popup: vi.fn(),
}))

// Mock Lucide React icons with proper typing
vi.mock('lucide-react', () => {
  const MockIcon = (props: React.SVGProps<SVGSVGElement>) => 
    React.createElement('svg', { ...props, 'data-testid': 'mock-icon' })
  
  return new Proxy({}, {
    get: (_target, prop) => {
      // Return the mock icon for any icon name
      if (typeof prop === 'string') {
        return MockIcon
      }
      return undefined
    }
  })
})

// Mock theme provider
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    themes: ['light', 'dark'],
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => 
    React.createElement(React.Fragment, {}, children),
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
  useMutation: () => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  }),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => 
    React.createElement(React.Fragment, {}, children),
}))

// Suppress console warnings in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

// Common warning patterns to suppress during testing
const SUPPRESSED_WARNINGS = [
  'Warning: ReactDOM.render is no longer supported',
  'Warning: React.createFactory() is deprecated',
  'Warning: componentWillReceiveProps has been renamed',
  'Warning: componentWillMount has been renamed',
  'Warning: componentWillUpdate has been renamed',
]

beforeAll(() => {
  console.error = (...args: any[]) => {
    const message = args[0]
    if (typeof message === 'string' && SUPPRESSED_WARNINGS.some(warning => message.includes(warning))) {
      return
    }
    originalConsoleError.call(console, ...args)
  }
  
  console.warn = (...args: any[]) => {
    const message = args[0]
    if (typeof message === 'string' && SUPPRESSED_WARNINGS.some(warning => message.includes(warning))) {
      return
    }
    originalConsoleWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})