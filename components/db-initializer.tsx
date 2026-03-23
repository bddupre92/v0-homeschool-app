"use client"

import { useEffect, useRef } from "react"

export function DbInitializer() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Auto-initialize database tables on first app load
    fetch("/api/init-db", { method: "POST" })
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          console.log("[DB] Tables initialized")
        } else {
          console.warn("[DB] Init warning:", result.error)
        }
      })
      .catch(() => {
        // Silently fail - tables may already exist
      })
  }, [])

  return null
}
