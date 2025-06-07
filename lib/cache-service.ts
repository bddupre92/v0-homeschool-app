"use client"

import { useLocalStorageCache } from "./cache"

// Cache expiration times (in milliseconds)
const CACHE_TIMES = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
}

export type CachePolicy = "no-cache" | "cache-first" | "network-first" | "cache-only" | "network-only"

export interface CacheOptions {
  policy?: CachePolicy
  expiration?: number
  namespace?: string
}

export function useCacheService() {
  const { getItem, setItem } = useLocalStorageCache()

  const getCacheKey = (key: string, namespace?: string) => {
    return namespace ? `${namespace}:${key}` : key
  }
\
  const isCacheValid = <T>(cachedData: { data: T; timestamp: number } | null, expiration: number): boolean => {
    if (!cachedData) return false
    return Date.now() - cachedData.timestamp < expiration;
  }

  const fetchWithCache = async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const { policy = "cache-first", expiration = CACHE_TIMES.MEDIUM, namespace = "firestore" } = options
    const cacheKey = getCacheKey(key, namespace)

    // Get cached data
    const cachedData = getItem<{ data: T; timestamp: number } | null>(cacheKey, null)
    const isValid = isCacheValid(cachedData, expiration)

    // Handle different cache policies
    switch (policy) {
      case "no-cache":
        return fetchFn()

      case "cache-only":
        if (cachedData) return cachedData.data
        throw new Error(`No cached data found for key: ${key}`)

      case "network-only":
        const networkOnlyData = await fetchFn()
        setItem(cacheKey, { data: networkOnlyData, timestamp: Date.now() })
        return networkOnlyData

      case "network-first":
        try {
          const networkFirstData = await fetchFn()
          setItem(cacheKey, { data: networkFirstData, timestamp: Date.now() })
          return networkFirstData
        } catch (error) {
          if (cachedData) {
            console.warn(`Network request failed, using cached data for ${key}`, error)
            return cachedData.data
          }
          throw error
        }

      case "cache-first":
      default:
        if (isValid) {
          return cachedData!.data
        }

        try {
          const freshData = await fetchFn()
          setItem(cacheKey, { data: freshData, timestamp: Date.now() })
          return freshData
        } catch (error) {
          if (cachedData) {
            console.warn(`Network request failed, using stale cached data for ${key}`, error)
            return cachedData.data
          }
          throw error
        }
    }
  }

  const invalidateCache = (key: string, namespace?: string) => {
    const cacheKey = getCacheKey(key, namespace)
    setItem(cacheKey, null)
  }

  const prefetchAndCache = async <T>(key: string, fetchFn: () => Promise<T>, options: CacheOptions = {}) => {
    const { namespace = "firestore", expiration = CACHE_TIMES.MEDIUM } = options
    const cacheKey = getCacheKey(key, namespace)

    try {
      const data = await fetchFn()
      setItem(cacheKey, { data, timestamp: Date.now() })
      return true
    } catch (error) {
      console.error(`Failed to prefetch data for ${key}`, error)
      return false
    }
  }

  return {
    fetchWithCache,
    invalidateCache,
    prefetchAndCache,
    CACHE_TIMES,
  }
}
