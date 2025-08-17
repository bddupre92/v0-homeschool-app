import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from 'next-themes'

// Mock user for testing
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  photoURL: 'https://example.com/avatar.jpg',
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withAuth?: boolean
  withTheme?: boolean
  user?: typeof mockUser | null
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    withAuth = false,
    withTheme = false,
    user = null,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    let content = children

    if (withTheme) {
      content = (
        <ThemeProvider attribute="class" defaultTheme="light">
          {content}
        </ThemeProvider>
      )
    }

    if (withAuth) {
      // Mock the auth context value
      const mockAuthValue = {
        user: user || mockUser,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        signInWithGoogle: vi.fn(),
        resetPassword: vi.fn(),
        updateUserProfile: vi.fn(),
      }

      content = (
        <AuthProvider value={mockAuthValue}>
          {content}
        </AuthProvider>
      )
    }

    return <>{content}</>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Helper to create mock Firebase documents
export function createMockDoc(data: Record<string, any>) {
  return {
    id: 'mock-doc-id',
    data: () => data,
    exists: () => true,
    ref: {
      id: 'mock-doc-id',
      path: 'mock/path',
    },
  }
}

// Helper to create mock Firebase collections
export function createMockCollection(docs: any[] = []) {
  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback: (doc: any) => void) => docs.forEach(callback),
  }
}

// Helper to wait for async operations in tests
export function waitForAsync(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper to create form data for testing
export function createFormData(data: Record<string, string>) {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'