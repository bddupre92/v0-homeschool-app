/**
 * Kid roster bridge. The shipping kid data source is now
 * `lib/atoz-store.ts` (localStorage-backed per the local-first
 * doctrine). This module provides:
 *
 * - `SEED_KIDS`: initial roster used the first time the store is empty
 *   on a device (Emma / Noah / Lily, matching the prototype copy).
 * - `useKids()`: reactive React hook that subscribes to store changes.
 * - `readDemoHours()` / `writeDemoHours()`: weekly-hours helpers that
 *   will migrate into real portfolio aggregation in Phase 2.
 *
 * `DEMO_KIDS` remains as a legacy named export for any mid-refactor
 * consumers but is now backed by the live store, not a static array.
 */

"use client"

import { useEffect, useState } from "react"
import { listKids, onStorageChange, seedKidsIfEmpty, type Kid } from "@/lib/atoz-store"

export type DemoKid = Kid

export const SEED_KIDS: Omit<Kid, "createdAt" | "updatedAt">[] = [
  { id: "emma", name: "Emma", color: "#d46e4d", age: 9, weeklyTarget: 17.5 },
  { id: "noah", name: "Noah", color: "#7d9e7d", age: 7, weeklyTarget: 17.5 },
  { id: "lily", name: "Lily", color: "#df8a27", age: 5, weeklyTarget: 17.5 },
]

export function ensureSeedKids(): Kid[] {
  seedKidsIfEmpty(SEED_KIDS)
  return listKids()
}

export function useKids(): Kid[] {
  const [kids, setKids] = useState<Kid[]>(() => {
    if (typeof window === "undefined") return []
    return ensureSeedKids()
  })
  useEffect(() => {
    setKids(ensureSeedKids())
    return onStorageChange(() => setKids(listKids()))
  }, [])
  return kids
}

/** @deprecated Use `useKids()` in components or `listKids()` in handlers. */
export const DEMO_KIDS: Kid[] = (() => {
  if (typeof window === "undefined") {
    const now = new Date().toISOString()
    return SEED_KIDS.map((k) => ({ ...k, createdAt: now, updatedAt: now }))
  }
  return ensureSeedKids()
})()

export const DEMO_HOURS_KEY = "atoz.demoWeeklyHours"

const DEMO_HOURS_DEFAULT: Record<string, number> = {
  emma: 14.5,
  noah: 12,
  lily: 9.5,
}

export function readDemoHours(): Record<string, number> {
  if (typeof window === "undefined") return DEMO_HOURS_DEFAULT
  try {
    const raw = window.localStorage.getItem(DEMO_HOURS_KEY)
    return raw ? JSON.parse(raw) : DEMO_HOURS_DEFAULT
  } catch {
    return DEMO_HOURS_DEFAULT
  }
}

export function writeDemoHours(next: Record<string, number>): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(DEMO_HOURS_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent("atoz:change", { detail: { key: DEMO_HOURS_KEY } }))
  } catch {}
}
