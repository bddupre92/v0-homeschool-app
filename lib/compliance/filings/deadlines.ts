/**
 * Known compliance deadlines per state. Hand-curated alongside the filing
 * templates — when statutes change, both this file and the matching
 * template's footer-citation block need updating.
 *
 * Each deadline is anchored to a recurring month/day; the helper resolves
 * the next occurrence relative to a given school year. NY quarterly dates
 * are the "typical" Nov 15 / Jan 30 / Mar 30 / Jun 30 schedule — each
 * district's IHIP-approval letter sets the official dates, so families
 * should treat ours as a calendar nudge, not authoritative.
 */

import type { FilingSnapshot, FilingTypeMeta } from "./types"

export interface KnownDeadline {
  state: FilingSnapshot["state"]
  filingType: string
  /** Title to show in UI. */
  label: string
  /** Month (1-12) the deadline lands on. */
  month: number
  /** Day of the month. */
  day: number
  /** Optional grade band filter — only applies if the kid's grade is in this list. */
  appliesToGrades?: string[]
  /** Optional repeat note, e.g. "every 2 weeks". */
  repeats?: string
}

export const KNOWN_DEADLINES: KnownDeadline[] = [
  // ── New York ───────────────────────────────────────────────────────
  { state: "ny", filingType: "ihip", label: "IHIP due", month: 8, day: 15 },
  { state: "ny", filingType: "quarterly", label: "Q1 quarterly due", month: 11, day: 15 },
  { state: "ny", filingType: "quarterly", label: "Q2 quarterly due", month: 1, day: 30 },
  { state: "ny", filingType: "quarterly", label: "Q3 quarterly due", month: 3, day: 30 },
  { state: "ny", filingType: "quarterly", label: "Q4 quarterly + annual assessment", month: 6, day: 30 },

  // ── Pennsylvania ───────────────────────────────────────────────────
  { state: "pa", filingType: "portfolio", label: "Act 169 portfolio + evaluator letter due", month: 6, day: 30 },

  // ── Massachusetts ──────────────────────────────────────────────────
  // No statewide deadline — set by each school committee. We surface a
  // late-summer nudge for the upcoming school year.
  { state: "ma", filingType: "plan", label: "Submit plan to school committee (recommended)", month: 8, day: 1 },

  // ── Oregon ─────────────────────────────────────────────────────────
  // Notification within 10 days of starting; we surface an annual Aug 15
  // for families starting at the school-year boundary.
  { state: "or", filingType: "notification", label: "Notification to ESD (annual)", month: 8, day: 15 },
  {
    state: "or",
    filingType: "test-results",
    label: "Standardized test results due to ESD",
    month: 8,
    day: 15,
    appliesToGrades: ["3", "5", "8", "10"],
  },
]

export interface DeadlineOccurrence {
  state: FilingSnapshot["state"]
  filingType: string
  label: string
  /** ISO date string of the next occurrence. */
  date: string
  appliesToGrades?: string[]
}

/**
 * Resolve the next occurrence of each KNOWN_DEADLINES item from `now`.
 * "Next" means the soonest future occurrence — anchored to the school-year
 * boundary so a Sept 1 user gets the upcoming Nov 15 quarterly, not last
 * year's Nov 15.
 */
export function upcomingDeadlines(
  state: FilingSnapshot["state"],
  now: Date = new Date(),
): DeadlineOccurrence[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const items = KNOWN_DEADLINES.filter((d) => d.state === state)
  return items
    .map((d) => {
      let year = today.getFullYear()
      let candidate = new Date(year, d.month - 1, d.day)
      if (candidate.getTime() < today.getTime()) {
        candidate = new Date(year + 1, d.month - 1, d.day)
      }
      return {
        state: d.state,
        filingType: d.filingType,
        label: d.label,
        date: candidate.toISOString().slice(0, 10),
        appliesToGrades: d.appliesToGrades,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Days from `from` to `target` (both ISO date strings). Positive when
 * target is in the future.
 */
export function daysUntil(target: string, from: Date = new Date()): number {
  const t = new Date(target).getTime()
  const f = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  return Math.round((t - f) / (24 * 60 * 60 * 1000))
}

/** Convenience: filter occurrences applicable to a given grade. */
export function filterByGrade(
  occurrences: DeadlineOccurrence[],
  grade?: string,
): DeadlineOccurrence[] {
  if (!grade) return occurrences
  return occurrences.filter(
    (o) => !o.appliesToGrades || o.appliesToGrades.includes(grade.toString()),
  )
}
