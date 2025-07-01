interface CacheItem<T> {
  data: T
  timestamp: number
  expiration: number
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
    const ns = namespace || this.policy.namespace
    return ns ? `${ns}:${key}` : key
  }

  private isCacheValid<T>(cachedData: CacheItem<T> | undefined): boolean {
    if (!cachedData) return false
    return Date.now() - cachedData.timestamp < cachedData.expiration
  }

  private evictOldEntries(): void {
    if (this.cache.size >= this.policy.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

      // Remove oldest 25% of entries
      const toRemove = Math.floor(entries.length * 0.25)
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0])
      }
    }
  }

  set<T>(key: string, data: T, expiration?: number, namespace?: string): void {
    this.evictOldEntries()

    const cacheKey = this.getCacheKey(key, namespace)
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiration: expiration || this.policy.defaultExpiration,
    }

    this.cache.set(cacheKey, item)
  }

  get<T>(key: string, namespace?: string): T | null {
    const cacheKey = this.getCacheKey(key, namespace)
    const cachedData = this.cache.get(cacheKey)

    if (this.isCacheValid(cachedData)) {
      return cachedData!.data
    }

    if (cachedData) {
      this.cache.delete(cacheKey)
    }

    return null
  }

  invalidate(key: string, namespace?: string): void {
    const cacheKey = this.getCacheKey(key, namespace)
    this.cache.delete(cacheKey)
  }

  invalidateNamespace(namespace: string): void {
    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.policy.maxSize,
      defaultExpiration: this.policy.defaultExpiration,
    }
  }

  async fetchWithCache<T>(key: string, fetchFn: () => Promise<T>, expiration?: number, namespace?: string): Promise<T> {
    const cached = this.get<T>(key, namespace)
    if (cached !== null) {
      return cached
    }

    try {
      const data = await fetchFn()
      this.set(key, data, expiration, namespace)
      return data
    } catch (error) {
      console.error(`Cache fetch error for key ${key}:`, error)
      throw error
    }
  }

  prefetchAndCache<T>(key: string, fetchFn: () => Promise<T>, expiration?: number, namespace?: string): void {
    // Don't prefetch if already cached
    if (this.get(key, namespace) !== null) {
      return
    }

    fetchFn()
      .then((data) => this.set(key, data, expiration, namespace))
      .catch((error) => console.warn(`Prefetch failed for key ${key}:`, error))
  }
}

// Create default cache instance
export const cacheService = new CacheService({
  defaultExpiration: 300000, // 5 minutes
  maxSize: 200,
  namespace: "atozfamily",
})

// Export the class for custom instances
export { CacheService }
export type { CachePolicy, CacheItem }
