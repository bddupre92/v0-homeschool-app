"use client"

import { useEffect, useRef } from "react"

export function DbInitializer() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Auto-initialize database tables on first app load.
    // Missing Postgres config is expected in local dev; don't surface it.
    fetch("/api/init-db", { method: "POST" })
      .then(async (r) => {
        if (!r.ok) return null
        const text = await r.text()
        return text ? (JSON.parse(text) as { success?: boolean; error?: string }) : null
      })
      .then((result) => {
        if (!result) return
        if (result.success) {
          console.log("[DB] Tables initialized")
        } else if (result.error) {
          console.warn("[DB] Init warning:", result.error)
        }
      })
      .catch(() => {
        // Silently fail - tables may already exist or Postgres isn't configured.
      })
  }, [])

  return null
}
