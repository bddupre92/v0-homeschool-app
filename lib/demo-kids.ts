/**
 * Kid roster hook + demo-mode seed.
 *
 * Real users see an empty roster until they add a child via onboarding
 * or /family/calm. Demo-mode (design-system showcase) opts in to a
 * fictitious roster via `useKidsWithDemoSeed()`.
 *
 * Previously `useKids` auto-seeded Emma/Noah/Lily into every visitor's
 * localStorage on mount. That made fresh installs look populated with
 * fabricated children — the original Phase 0 review's biggest finding.
 */

"use client"

import { useEffect, useState } from "react"
import { listKids, onStorageChange, seedKidsIfEmpty, type Kid } from "@/lib/atoz-store"

export type DemoKid = Kid

/** Demo roster. Only used by surfaces that opt in (e.g. /design-system). */
export const SEED_KIDS: Omit<Kid, "createdAt" | "updatedAt">[] = [
  { id: "emma", name: "Emma", color: "#d46e4d", age: 9, weeklyTarget: 17.5 },
  { id: "noah", name: "Noah", color: "#7d9e7d", age: 7, weeklyTarget: 17.5 },
  { id: "lily", name: "Lily", color: "#df8a27", age: 5, weeklyTarget: 17.5 },
]

/** Reactive roster from the live store. Empty for fresh installs. */
export function useKids(): Kid[] {
  const [kids, setKids] = useState<Kid[]>(() => (typeof window === "undefined" ? [] : listKids()))
  useEffect(() => {
    setKids(listKids())
    return onStorageChange(() => setKids(listKids()))
  }, [])
  return kids
}

/** Reactive roster that seeds Emma/Noah/Lily if the store is empty. Demo surfaces only. */
export function useKidsWithDemoSeed(): Kid[] {
  const [kids, setKids] = useState<Kid[]>(() => {
    if (typeof window === "undefined") return []
    seedKidsIfEmpty(SEED_KIDS)
    return listKids()
  })
  useEffect(() => {
    seedKidsIfEmpty(SEED_KIDS)
    setKids(listKids())
    return onStorageChange(() => setKids(listKids()))
  }, [])
  return kids
}

export const DEMO_HOURS_KEY = "atoz.demoWeeklyHours"

const DEMO_HOURS_FALLBACK: Record<string, number> = { emma: 14.5, noah: 12, lily: 9.5 }

export function readDemoHours(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(DEMO_HOURS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  // Only return seeded hours if seeded kids actually exist in the store.
  const ids = new Set(listKids().map((k) => k.id))
  const seeded: Record<string, number> = {}
  for (const [id, hours] of Object.entries(DEMO_HOURS_FALLBACK)) {
    if (ids.has(id)) seeded[id] = hours
  }
  return seeded
}

export function writeDemoHours(next: Record<string, number>): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(DEMO_HOURS_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent("atoz:change", { detail: { key: DEMO_HOURS_KEY } }))
  } catch {}
}
