import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// lib/test-setup.ts globally mocks @/lib/firebase. These tests cover the
// session-expiry logic and the auth-unavailable guard paths only; token
// retrieval against a live auth instance is covered by e2e, not unit tests
// (module-level import binding makes the auth instance unswappable here).
vi.mock('../firebase', () => ({ auth: null }))

import { getCurrentToken, updateActivity, isSessionExpired, initSessionTracking, setupAuthPersistence } from '../session'

describe('Session Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
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
      const mockAddEventListener = vi.fn()
      const mockSetInterval = vi.fn()

      Object.defineProperty(global, 'window', {
        value: {
          addEventListener: mockAddEventListener,
        },
        writable: true,
      })

      const originalSetInterval = global.setInterval
      global.setInterval = mockSetInterval

      initSessionTracking()

      expect(mockAddEventListener).toHaveBeenCalledWith('click', updateActivity)
      expect(mockAddEventListener).toHaveBeenCalledWith('keypress', updateActivity)
      expect(mockAddEventListener).toHaveBeenCalledWith('scroll', updateActivity)
      expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', updateActivity)
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 60000)

      global.setInterval = originalSetInterval
    })
  })

  describe('setupAuthPersistence', () => {
    it('should return null when not in browser environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const unsubscribe = setupAuthPersistence()

      expect(unsubscribe).toBeNull()

      global.window = originalWindow
    })

    it('should return null when auth is not available', async () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const unsubscribe = setupAuthPersistence()

      expect(unsubscribe).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Auth not available, cannot set up auth persistence')

      consoleSpy.mockRestore()
    })
  })
})
