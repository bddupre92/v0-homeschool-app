"use client"

/**
 * Applies atoz-store BrandingPrefs to the document root. Keeps
 * --brand in sync with the user's accent color so any element that
 * reads var(--brand) picks up the override. Listens for atoz:change
 * so changes in Settings take effect immediately without reload.
 */

import { useEffect } from "react"
import { getBranding, onStorageChange } from "@/lib/atoz-store"

const DEFAULT_BRAND = "#556b47" // sage-dd

export default function BrandingApplier() {
  useEffect(() => {
    const apply = () => {
      const { accentColor, familyName } = getBranding()
      const root = document.documentElement
      root.style.setProperty("--brand", accentColor ?? DEFAULT_BRAND)
      if (familyName) root.dataset.familyName = familyName
      else delete root.dataset.familyName
    }
    apply()
    return onStorageChange(apply)
  }, [])

  return null
}
