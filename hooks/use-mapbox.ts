"use client"

import { useState, useEffect } from "react"
import { getMapboxToken } from "@/app/actions/map-actions"

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true)
        const result = await getMapboxToken()
        if (result.error) {
          setError(new Error(result.error))
          setToken(null)
        } else {
          setToken(result.token)
          setError(null)
        }
      } catch (err) {
        console.error("Error fetching Mapbox token:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch Mapbox token"))
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  return { token, loading, error, isLoading: loading }
}
