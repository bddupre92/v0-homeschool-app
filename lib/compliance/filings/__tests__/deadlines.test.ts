import { describe, expect, it } from "vitest"
import {
  KNOWN_DEADLINES,
  daysUntil,
  filterByGrade,
  upcomingDeadlines,
} from "@/lib/compliance/filings/deadlines"

describe("KNOWN_DEADLINES", () => {
  it("covers all four shipped states", () => {
    const states = new Set(KNOWN_DEADLINES.map((d) => d.state))
    expect(states.has("ny")).toBe(true)
    expect(states.has("pa")).toBe(true)
    expect(states.has("ma")).toBe(true)
    expect(states.has("or")).toBe(true)
  })

  it("NY has IHIP + four quarterlies", () => {
    const ny = KNOWN_DEADLINES.filter((d) => d.state === "ny")
    expect(ny.filter((d) => d.filingType === "ihip")).toHaveLength(1)
    expect(ny.filter((d) => d.filingType === "quarterly")).toHaveLength(4)
  })

  it("OR test-results only applies to required testing grades", () => {
    const tr = KNOWN_DEADLINES.find((d) => d.state === "or" && d.filingType === "test-results")
    expect(tr).toBeDefined()
    expect(tr!.appliesToGrades).toEqual(["3", "5", "8", "10"])
  })
})

describe("upcomingDeadlines", () => {
  it("returns the soonest future occurrence — not last year's", () => {
    // Anchor: Sept 1, 2026 — NY IHIP (Aug 15) already passed for the
    // 2026-27 year. The function should return 2027-08-15 NOT 2026-08-15.
    const now = new Date(2026, 8, 1) // Sept 1 2026
    const items = upcomingDeadlines("ny", now)
    const ihip = items.find((i) => i.filingType === "ihip")
    expect(ihip).toBeDefined()
    expect(ihip!.date).toBe("2027-08-15")
  })

  it("returns the current-year occurrence when still in the future", () => {
    // Anchor: Aug 1, 2026 — NY IHIP (Aug 15) still upcoming. Returns 2026-08-15.
    const now = new Date(2026, 7, 1)
    const items = upcomingDeadlines("ny", now)
    expect(items.find((i) => i.filingType === "ihip")!.date).toBe("2026-08-15")
  })

  it("sorts occurrences ascending by date", () => {
    const items = upcomingDeadlines("ny", new Date(2026, 8, 1))
    const dates = items.map((i) => i.date)
    expect(dates).toEqual([...dates].sort())
  })

  it("scopes to a single state", () => {
    const items = upcomingDeadlines("pa", new Date(2026, 0, 1))
    expect(items.every((i) => i.state === "pa")).toBe(true)
    expect(items).toHaveLength(1) // PA has one deadline (Act 169 portfolio)
  })

  it("MA returns a recommended August nudge", () => {
    const items = upcomingDeadlines("ma", new Date(2026, 0, 1))
    expect(items).toHaveLength(1)
    expect(items[0].label).toMatch(/school committee/i)
  })

  it("OR returns notification and test-results — caller filters by grade", () => {
    const items = upcomingDeadlines("or", new Date(2026, 0, 1))
    expect(items).toHaveLength(2)
    const tr = items.find((i) => i.filingType === "test-results")!
    expect(tr.appliesToGrades).toEqual(["3", "5", "8", "10"])
  })
})

describe("daysUntil", () => {
  it("0 for today", () => {
    const today = new Date()
    const iso = today.toISOString().slice(0, 10)
    expect(daysUntil(iso, today)).toBe(0)
  })

  it("positive for future dates", () => {
    const today = new Date(2026, 5, 1)
    const target = "2026-06-15"
    expect(daysUntil(target, today)).toBe(14)
  })

  it("negative for past dates", () => {
    const today = new Date(2026, 5, 15)
    const target = "2026-06-01"
    expect(daysUntil(target, today)).toBe(-14)
  })
})

describe("filterByGrade", () => {
  it("returns all occurrences when grade is undefined", () => {
    const occs = upcomingDeadlines("or", new Date(2026, 0, 1))
    expect(filterByGrade(occs, undefined)).toHaveLength(occs.length)
  })

  it("hides test-results for non-testing grades", () => {
    const occs = upcomingDeadlines("or", new Date(2026, 0, 1))
    const k2 = filterByGrade(occs, "2")
    expect(k2.find((o) => o.filingType === "test-results")).toBeUndefined()
    expect(k2.find((o) => o.filingType === "notification")).toBeDefined()
  })

  it("keeps test-results for testing grades", () => {
    const occs = upcomingDeadlines("or", new Date(2026, 0, 1))
    expect(filterByGrade(occs, "5").find((o) => o.filingType === "test-results")).toBeDefined()
    expect(filterByGrade(occs, "10").find((o) => o.filingType === "test-results")).toBeDefined()
  })
})
