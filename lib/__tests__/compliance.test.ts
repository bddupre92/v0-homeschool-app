import { describe, expect, it } from "vitest"
import { daysUntil, getStateCompliance, nextFiling } from "@/lib/compliance"

describe("lib/compliance", () => {
  it("returns null for unknown states", () => {
    expect(getStateCompliance("ZZ")).toBeNull()
    expect(getStateCompliance(undefined)).toBeNull()
    expect(getStateCompliance("")).toBeNull()
  })

  it("is case-insensitive on the state abbreviation", () => {
    const upper = getStateCompliance("FL")
    const lower = getStateCompliance("fl")
    expect(upper).not.toBeNull()
    expect(lower).toEqual(upper)
  })

  it("resolves nextFiling for a state with a recurring filing", () => {
    // FL has an annual evaluation on 05-15
    const reference = new Date("2025-04-01T00:00:00Z")
    const next = nextFiling("FL", reference)
    expect(next).not.toBeNull()
    expect(next!.filing.label).toMatch(/evaluation/i)
    expect(next!.due.getUTCFullYear()).toBe(2025)
    expect(next!.due.getUTCMonth()).toBe(4) // May (0-indexed)
    expect(next!.due.getUTCDate()).toBe(15)
  })

  it("rolls over to next year when a recurring filing has passed", () => {
    const reference = new Date("2025-06-01T00:00:00Z") // after FL's 05-15
    const next = nextFiling("FL", reference)
    expect(next!.due.getUTCFullYear()).toBe(2026)
  })

  it("picks the soonest filing when a state has multiple", () => {
    // NY has three filings: IHIP (07-01), Quarterly #1 (11-15), Annual (06-30)
    const reference = new Date("2025-05-01T00:00:00Z")
    const next = nextFiling("NY", reference)
    expect(next).not.toBeNull()
    // From May 1, the soonest is 06-30 annual
    expect(next!.due.getUTCMonth()).toBe(5) // June
  })

  it("returns null when a state has no filings (TX)", () => {
    expect(nextFiling("TX")).toBeNull()
  })

  it("returns null when the state is unknown", () => {
    expect(nextFiling("ZZ")).toBeNull()
  })

  it("daysUntil rounds up to the nearest whole day", () => {
    const now = new Date("2025-01-01T00:00:00Z")
    const tomorrow = new Date("2025-01-02T00:00:00Z")
    expect(daysUntil(tomorrow, now)).toBe(1)

    const sixHoursLater = new Date("2025-01-01T06:00:00Z")
    expect(daysUntil(sixHoursLater, now)).toBe(1) // ceil of 0.25
  })

  it("daysUntil returns 0 or negative for past dates", () => {
    const now = new Date("2025-01-02T00:00:00Z")
    const yesterday = new Date("2025-01-01T00:00:00Z")
    expect(daysUntil(yesterday, now)).toBeLessThanOrEqual(0)
  })
})
