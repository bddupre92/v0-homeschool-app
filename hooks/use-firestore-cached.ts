"use client"

import { useState, useCallback } from "react"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useCacheService, type CacheOptions } from "@/lib/cache-service"
import { useErrorTracking } from "@/lib/error-tracking"

export function useFirestoreCached() {
  const { fetchWithCache, invalidateCache } = useCacheService()
  const { captureException } = useErrorTracking()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getDocument = useCallback(
    async <T extends DocumentData>(
      collectionName: string,
      docId: string,
      cacheOptions?: CacheOptions,
    ): Promise<T | null> => {
      const cacheKey = `${collectionName}/${docId}`

      setLoading(true)
      setError(null)

      try {
        const data = await fetchWithCache<T | null>(
          cacheKey,
          async () => {
            const docRef = doc(db, collectionName, docId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
              return { id: docSnap.id, ...docSnap.data() } as T
            }

            return null
          },
          cacheOptions,
        )

        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        captureException(error, { collectionName, docId })
        return null
      } finally {
        setLoading(false)
      }
    },
    [fetchWithCache, captureException],
  )

  const getCollection = useCallback(
    async <T extends DocumentData>(
      collectionName: string,
      constraints: QueryConstraint[] = [],
      cacheOptions?: CacheOptions,
    ): Promise<T[]> => {
      // Create a cache key based on collection name and constraints
      const constraintsKey = constraints
        .map((c) => c.toString())
        .sort()
        .join("|")
      const cacheKey = `${collectionName}${constraintsKey ? `?${constraintsKey}` : ""}`

      setLoading(true)
      setError(null)

      try {
        const data = await fetchWithCache<T[]>(
          cacheKey,
          async () => {
            const collectionRef = collection(db, collectionName)
            const q = constraints.length > 0 ? query(collectionRef, ...constraints) : query(collectionRef)
            const querySnapshot = await getDocs(q)

            return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T)
          },
          cacheOptions,
        )

        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        captureException(error, { collectionName, constraints: constraintsKey })
        return []
      } finally {
        setLoading(false)
      }
    },
    [fetchWithCache, captureException],
  )

  const invalidateDocument = useCallback(
    (collectionName: string, docId: string) => {
      invalidateCache(`${collectionName}/${docId}`, "firestore")
    },
    [invalidateCache],
  )

  const invalidateCollection = useCallback(
    (collectionName: string) => {
      invalidateCache(collectionName, "firestore")
    },
    [invalidateCache],
  )

  return {
    getDocument,
    getCollection,
    invalidateDocument,
    invalidateCollection,
    loading,
    error,
    // Helper functions for common query constraints
    where,
    orderBy,
    limit,
  }
}
