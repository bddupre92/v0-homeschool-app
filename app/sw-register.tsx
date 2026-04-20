"use client"

import { useEffect } from "react"

/**
 * Registers /service-worker.js in production only. In dev we skip
 * registration (and unregister any stale SW from a previous prod
 * visit on the same origin) to avoid cached chunks fighting
 * hot-reload.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {})
      return
    }

    const register = () => {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {
        // Non-fatal — offline fallback simply won't kick in.
      })
    }
    if (document.readyState === "complete") register()
    else window.addEventListener("load", register, { once: true })
  }, [])

  return null
}
