import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock Firebase modules before importing
const mockAuth = vi.hoisted(() => ({ current: null as any }))
const mockOnAuthStateChanged = vi.hoisted(() => vi.fn())
const mockGetIdToken = vi.hoisted(() => vi.fn())

// Clear global mocks for specific Firebase testing
vi.unmock('@/lib/firebase')

vi.mock('../firebase', () => ({
  get auth() { return mockAuth.current }
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
  getIdToken: mockGetIdToken,
}))

// Import after mocking
import { getCurrentToken, updateActivity, isSessionExpired, initSessionTracking, setupAuthPersistence } from '../session'

describe('Session Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Reset auth to null for each test
    mockAuth.current = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getCurrentToken', () => {
    it('should return null when auth is not available', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const token = await getCurrentToken()

      expect(token).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Auth not available, cannot get current token')

      consoleSpy.mockRestore()
    })

    it('should handle auth state changes when auth is available', async () => {
      // Set up mock auth
      mockAuth.current = { currentUser: null } as any
      const mockUnsubscribe = vi.fn()

      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        // Use parameters to avoid unused variable warnings
        expect(authInstance).toBe(mockAuth.current)
        // Call callback immediately to simulate Firebase behavior
        Promise.resolve().then(() => callback(null))
        return mockUnsubscribe
      })

      const token = await getCurrentToken()

      expect(token).toBeNull()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should get token for authenticated user', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' }
      const mockToken = 'mock-token'

      // Set up mock auth
      mockAuth.current = { currentUser: mockUser } as any
      const mockUnsubscribe = vi.fn()

      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        // Use parameters to avoid unused variable warnings
        expect(authInstance).toBe(mockAuth.current)
        // Simulate authenticated user - callback should be called asynchronously
        Promise.resolve().then(() => callback(mockUser as any))
        return mockUnsubscribe
      })

      mockGetIdToken.mockResolvedValue(mockToken)

      const token = await getCurrentToken()

      expect(token).toBe(mockToken)
      expect(mockGetIdToken).toHaveBeenCalledWith(mockUser, true)
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should handle token retrieval errors', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' }

      // Set up mock auth
      mockAuth.current = { currentUser: mockUser } as any
      const mockUnsubscribe = vi.fn()

      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        // Use parameters to avoid unused variable warnings
        expect(authInstance).toBe(mockAuth.current)
        // Call callback immediately to simulate Firebase behavior
        Promise.resolve().then(() => callback(mockUser as any))
        return mockUnsubscribe
      })

      mockGetIdToken.mockRejectedValue(new Error('Token error'))

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      const token = await getCurrentToken()

      expect(token).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting token:', expect.any(Error))
      expect(mockUnsubscribe).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should properly unsubscribe from auth state listener to prevent memory leaks', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' }
      const mockToken = 'mock-token'

      // Set up mock auth
      mockAuth.current = { currentUser: mockUser } as any
      const mockUnsubscribe = vi.fn()

      // Track how many times the callback is called
      let callbackCount = 0
      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        callbackCount++
        // Use parameters to avoid unused variable warnings
        expect(authInstance).toBe(mockAuth.current)
        // Simulate asynchronous callback
        Promise.resolve().then(() => callback(mockUser as any))
        return mockUnsubscribe
      })

      mockGetIdToken.mockResolvedValue(mockToken)

      const token = await getCurrentToken()

      expect(token).toBe(mockToken)
      expect(callbackCount).toBe(1) // Should only be called once
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1) // Should unsubscribe immediately
    })
  })

  describe('Session Activity Tracking', () => {
    it('should update activity timestamp', () => {
      const initialTime = Date.now()
      vi.setSystemTime(initialTime)

      updateActivity()

      vi.advanceTimersByTime(1000)

      updateActivity()

      // Activity should be updated to the later time
      expect(isSessionExpired()).toBe(false)
    })

    it('should detect expired sessions', () => {
      updateActivity()

      // Advance time by more than session timeout (1 hour + 1 minute)
      vi.advanceTimersByTime(61 * 60 * 1000)

      expect(isSessionExpired()).toBe(true)
    })

    it('should initialize session tracking in browser environment', () => {
      // Mock window and global functions
      const mockAddEventListener = vi.fn()
      const mockSetInterval = vi.fn()

      // Mock window object
      Object.defineProperty(global, 'window', {
        value: {
          addEventListener: mockAddEventListener,
        },
        writable: true,
      })

      // Mock setInterval
      const originalSetInterval = global.setInterval
      global.setInterval = mockSetInterval

      initSessionTracking()

      expect(mockAddEventListener).toHaveBeenCalledWith('click', updateActivity)
      expect(mockAddEventListener).toHaveBeenCalledWith('keypress', updateActivity)
      expect(mockAddEventListener).toHaveBeenCalledWith('scroll', updateActivity)
      expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', updateActivity)
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 60000)

      // Restore original setInterval
      global.setInterval = originalSetInterval
    })
  })

  describe('setupAuthPersistence', () => {
    beforeEach(() => {
      // Mock sessionStorage
      Object.defineProperty(global, 'sessionStorage', {
        value: {
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true,
      })
    })

    it('should return null when not in browser environment', async () => {
      // Remove window to simulate server environment
      const originalWindow = global.window
      delete (global as any).window

      const { setupAuthPersistence } = await import('../session')
      const unsubscribe = setupAuthPersistence()

      expect(unsubscribe).toBeNull()

      // Restore window
      global.window = originalWindow
    })

    it('should return null when auth is not available', async () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const { setupAuthPersistence } = await import('../session')
      const unsubscribe = setupAuthPersistence()

      expect(unsubscribe).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Auth not available, cannot set up auth persistence')

      consoleSpy.mockRestore()
    })

    it('should set up auth persistence and return unsubscribe function', async () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      mockAuth.current = { currentUser: null } as any
      const mockUnsubscribe = vi.fn()

      mockOnAuthStateChanged.mockImplementation((authInstance, callback) => {
        // Use the parameters to avoid unused variable warnings
        expect(authInstance).toBe(mockAuth.current)
        expect(typeof callback).toBe('function')
        return mockUnsubscribe
      })

      const { setupAuthPersistence } = await import('../session')
      const unsubscribe = setupAuthPersistence()

      expect(unsubscribe).toBe(mockUnsubscribe)
      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth.current, expect.any(Function))
    })
  })
})