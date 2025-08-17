// Test setup file for Vitest
import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock environment variables for consistent testing
process.env.NODE_ENV = 'test'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly testing it
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})