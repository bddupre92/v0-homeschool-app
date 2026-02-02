"use client"

import { useEffect } from "react"
import { initSessionTracking, setupAuthPersistence } from "@/lib/session"

export function SessionInitializer() {
  useEffect(() => {
    try {
      console.log("[v0] Initializing session tracking...")
      initSessionTracking()
      
      console.log("[v0] Setting up auth persistence...")
      const unsubscribe = setupAuthPersistence()
      
      console.log("[v0] Session initialized successfully")
      
      // Cleanup function
      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    } catch (error) {
      console.error("[v0] Session initialization error:", error)
      // Don't throw - let the app continue without session tracking
    }
  }, [])

  return null
}
