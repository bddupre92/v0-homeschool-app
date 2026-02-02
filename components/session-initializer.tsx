"use client"

import { useEffect } from "react"
import { initSessionTracking, setupAuthPersistence } from "@/lib/session"

export function SessionInitializer() {
  useEffect(() => {
    try {
      initSessionTracking()
      const unsubscribe = setupAuthPersistence()
      
      // Cleanup function
      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    } catch (error) {
      console.error("Session initialization error:", error)
      // Don't throw - let the app continue without session tracking
    }
  }, [])

  return null
}
