import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

// Mock Firebase Auth using vi.hoisted for consistency
const mockGetAuth = vi.hoisted(() => vi.fn())
const mockSignInWithEmailAndPassword = vi.hoisted(() => vi.fn())
const mockCreateUserWithEmailAndPassword = vi.hoisted(() => vi.fn())
const mockSignOut = vi.hoisted(() => vi.fn())
const mockSendPasswordResetEmail = vi.hoisted(() => vi.fn())
const mockUpdateProfile = vi.hoisted(() => vi.fn())
const mockGoogleAuthProvider = vi.hoisted(() => vi.fn())
const mockSignInWithPopup = vi.hoisted(() => vi.fn())
const mockOnAuthStateChanged = vi.hoisted(() => vi.fn())
const mockIsFirebaseAvailable = vi.hoisted(() => vi.fn(() => true))

vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  updateProfile: mockUpdateProfile,
  GoogleAuthProvider: mockGoogleAuthProvider,
  signInWithPopup: mockSignInWithPopup,
  onAuthStateChanged: mockOnAuthStateChanged,
  setPersistence: vi.fn(),
  browserLocalPersistence: {},
  browserSessionPersistence: {},
}))

// Mock Firebase app
vi.mock('../firebase', () => ({
  auth: {},
  isFirebaseAvailable: mockIsFirebaseAvailable,
  db: {},
}))

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}))

// Import after mocking
import { AuthProvider, useAuth } from '../../contexts/auth-context'

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.email : 'No user'}</div>
      <div data-testid="loading">{auth.loading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => auth.signUp('test@example.com', 'password', 'Test User')}>
        Sign Up
      </button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide authentication context with dev mode user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // In dev mode, should have a mock user
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('dev@atozfamily.org')
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })
  })

  it('should handle sign in in dev mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByText('Sign In')
    signInButton.click()

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Dev mode: Simulating successful signin for',
        'test@example.com'
      )
    })

    consoleSpy.mockRestore()
  })

  it('should handle sign up in dev mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signUpButton = screen.getByText('Sign Up')
    signUpButton.click()

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Dev mode: Simulating successful signup for',
        'test@example.com'
      )
    })

    consoleSpy.mockRestore()
  })

  it('should handle sign out in dev mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signOutButton = screen.getByText('Sign Out')
    signOutButton.click()

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Dev mode: Simulating successful signout'
      )
    })

    consoleSpy.mockRestore()
  })
})