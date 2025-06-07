"use client"

import { useEffect } from "react"
import { initSessionTracking, setupAuthPersistence } from "@/lib/session"

export function SessionInitializer() {
  useEffect(() => {
    initSessionTracking()
    setupAuthPersistence()
  }, [])

  return null
}
