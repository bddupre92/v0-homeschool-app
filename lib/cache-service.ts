interface CacheItem<T> {
  data: T
  timestamp: number
  expiration?: number
}

interface CachePolicy {
  defaultExpiration: number
  maxSize: number
  namespace?: string
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>()
  private policy: CachePolicy

  constructor(policy: CachePolicy = { defaultExpiration: 300000, maxSize: 100 }) {
    this.policy = policy
  }

  private getCacheKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key
  }

  private isCacheValid<T>(cachedData: CacheItem<T> | null, expiration: number): boolean {
    if (!cachedData) return false
    const now = Date.now()
    const itemExpiration = cachedData.expiration || expiration
    return now - cachedData.timestamp < itemExpiration
  }

  private evictOldest(): void {
    if (this.cache.size >= this.policy.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
  }

  set<T>(key: string, data: T, expiration?: number): void {
    this.evictOldest()
    const cacheKey = this.getCacheKey(key, this.policy.namespace)
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiration: expiration || this.policy.defaultExpiration,
    }
    this.cache.set(cacheKey, item)
  }

  get<T>(key: string, expiration?: number): T | null {
    const cacheKey = this.getCacheKey(key, this.policy.namespace)
    const cachedData = this.cache.get(cacheKey) as CacheItem<T> | undefined
    const effectiveExpiration = expiration || this.policy.defaultExpiration

    if (this.isCacheValid(cachedData || null, effectiveExpiration)) {
      return cachedData!.data
    }

    if (cachedData) {
      this.cache.delete(cacheKey)
    }
    return null
  }

  invalidate(key: string): void {
    const cacheKey = this.getCacheKey(key, this.policy.namespace)
    this.cache.delete(cacheKey)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Create default cache instance
export const defaultCache = new CacheService()

// Utility functions for common caching patterns
export async function fetchWithCache<T>(key: string, fetchFn: () => Promise<T>, expiration?: number): Promise<T> {
  const cached = defaultCache.get<T>(key, expiration)
  if (cached !== null) {
    return cached
  }

  try {
    const data = await fetchFn()
    defaultCache.set(key, data, expiration)
    return data
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error)
    throw error
  }
}

export function invalidateCache(key: string): void {
  defaultCache.invalidate(key)
}

export async function prefetchAndCache<T>(key: string, fetchFn: () => Promise<T>, expiration?: number): Promise<void> {
  try {
    const data = await fetchFn()
    defaultCache.set(key, data, expiration)
  } catch (error) {
    console.error(`Error prefetching data for key ${key}:`, error)
  }
}
