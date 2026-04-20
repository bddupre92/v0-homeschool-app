/**
 * Single source of truth for the demo kid roster used across calm rooms
 * until real kid CRUD (currently on legacy `/family`) lands in
 * `/family/calm` and feeds the same data shape.
 *
 * Previously duplicated in:
 *  - components/navigation.tsx (DEMO_KIDS)
 *  - app/family/kid/[kidId]/page.tsx (DEMO_KIDS)
 *  - app/today/page.tsx (DEMO_KIDS)
 *  - app/family/calm/page.tsx (DEMO_KIDS)
 */

export interface DemoKid {
  id: string
  name: string
  color: string
  age?: number
  weeklyTarget?: number
}

export const DEMO_KIDS: DemoKid[] = [
  { id: "emma", name: "Emma", color: "#d46e4d", age: 9, weeklyTarget: 17.5 },
  { id: "noah", name: "Noah", color: "#7d9e7d", age: 7, weeklyTarget: 17.5 },
  { id: "lily", name: "Lily", color: "#df8a27", age: 5, weeklyTarget: 17.5 },
]

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
