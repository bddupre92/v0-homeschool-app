import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('base', 'additional')).toBe('base additional')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'valid')).toBe('base valid')
    })

    it('should merge tailwind classes with conflicts', () => {
      // This tests the tailwind-merge functionality
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })
  })
})