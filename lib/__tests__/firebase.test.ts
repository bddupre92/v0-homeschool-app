import { afterEach } from 'node:test'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Firebase modules using vi.hoisted for consistency
const mockInitializeApp = vi.hoisted(() => vi.fn())
const mockGetApps = vi.hoisted(() => vi.fn())
const mockGetApp = vi.hoisted(() => vi.fn())
const mockGetAuth = vi.hoisted(() => vi.fn())
const mockGetFirestore = vi.hoisted(() => vi.fn())
const mockGetStorage = vi.hoisted(() => vi.fn())

vi.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
}))

vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
}))

vi.mock('firebase/storage', () => ({
  getStorage: mockGetStorage,
}))

describe('Firebase Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear module cache to test different scenarios
    vi.resetModules()
    // Reset environment variables
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  it('should initialize Firebase when all environment variables are present', async () => {
    // Set up real environment variables (not demo values)
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyTest123RealKey'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'real-project-id'
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '987654321'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:987654321:web:realappid'

    const mockApp = { name: 'test-app' }

    mockGetApps.mockReturnValue([])
    mockInitializeApp.mockReturnValue(mockApp as any)

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

    const { isFirebaseAvailable } = await import('../firebase')

    expect(mockInitializeApp).toHaveBeenCalledWith({
      apiKey: 'AIzaSyTest123RealKey',
      authDomain: 'real-project-id.firebaseapp.com',
      projectId: 'real-project-id',
      storageBucket: 'real-project-id.appspot.com',
      messagingSenderId: '987654321',
      appId: '1:987654321:web:realappid',
    })
    expect(consoleSpy).toHaveBeenCalledWith('Firebase initialized successfully')
    expect(isFirebaseAvailable()).toBe(true)

    consoleSpy.mockRestore()
  })

  it('should handle missing environment variables gracefully', async () => {
    // Clear environment variables
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    delete process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    const { isFirebaseAvailable } = await import('../firebase')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing Firebase environment variables')
    )
    expect(isFirebaseAvailable()).toBe(false)

    consoleSpy.mockRestore()
  })

  it('should detect demo values and warn appropriately', async () => {
    // Set up demo environment variables
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'demo-key'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-project'
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'demo-app-id'

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    const { isFirebaseAvailable } = await import('../firebase')

    expect(consoleSpy).toHaveBeenCalledWith(
      'Demo Firebase values detected. Please replace with real Firebase configuration.'
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      'Running in development mode without Firebase'
    )
    expect(isFirebaseAvailable()).toBe(false)

    consoleSpy.mockRestore()
  })

  it('should detect "your-" placeholder values', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'your-api-key-here'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id'

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    const { isFirebaseAvailable } = await import('../firebase')

    expect(consoleSpy).toHaveBeenCalledWith(
      'Demo Firebase values detected. Please replace with real Firebase configuration.'
    )
    expect(isFirebaseAvailable()).toBe(false)

    consoleSpy.mockRestore()
  })

  it('should handle Firebase initialization errors', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyTest123RealKey'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'real-project-id'
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '987654321'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:987654321:web:realappid'

    mockGetApps.mockReturnValue([])
    mockInitializeApp.mockImplementation(() => {
      throw new Error('Firebase initialization failed')
    })

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    const { isFirebaseAvailable } = await import('../firebase')

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Firebase initialization failed:',
      expect.any(Error)
    )
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Running in development mode without Firebase'
    )
    expect(isFirebaseAvailable()).toBe(false)

    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  it('should reuse existing Firebase app when already initialized', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyTest123RealKey'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'real-project-id'
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '987654321'
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:987654321:web:realappid'

    const mockApp = { name: 'existing-app' }
    mockGetApps.mockReturnValue([mockApp])
    mockGetApp.mockReturnValue(mockApp as any)

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

    const { isFirebaseAvailable } = await import('../firebase')

    expect(mockGetApp).toHaveBeenCalled()
    expect(mockInitializeApp).not.toHaveBeenCalled()
    expect(isFirebaseAvailable()).toBe(true)

    consoleSpy.mockRestore()
  })
})