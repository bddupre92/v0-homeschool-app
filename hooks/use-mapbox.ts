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
        const fetchedToken = await getMapboxToken()
        setToken(fetchedToken)
        setError(null)
      } catch (err) {
        console.error("Error fetching Mapbox token:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch Mapbox token"))
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  return { token, loading, error }
}
