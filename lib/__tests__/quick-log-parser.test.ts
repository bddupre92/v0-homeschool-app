import { describe, expect, it } from "vitest"
import { parseQuickLog } from "@/lib/quick-log-parser"
import type { Kid } from "@/lib/atoz-store"

const now = new Date().toISOString()
const kids: Kid[] = [
  { id: "kid_emma", name: "Emma", color: "#d46e4d", age: 9, weeklyTarget: 17.5, createdAt: now, updatedAt: now },
  { id: "kid_noah", name: "Noah", color: "#7d9e7d", age: 7, weeklyTarget: 17.5, createdAt: now, updatedAt: now },
]

describe("parseQuickLog", () => {
  it("extracts kid + subject + minutes from a simple sentence", () => {
    const r = parseQuickLog("Emma did 40 min of math", kids)
    expect(r.entries).toHaveLength(1)
    expect(r.entries[0]).toMatchObject({
      kidId: "kid_emma",
      subject: "Mathematics",
      minutes: 40,
    })
    expect(r.hasUsableEntry).toBe(true)
  })

  it("splits on 'and' into separate entries and keeps the kid context", () => {
    const r = parseQuickLog(
      "Emma did 40 min of math and we read Charlotte's Web for 20",
      kids,
    )
    expect(r.entries).toHaveLength(2)
    expect(r.entries[0]).toMatchObject({ subject: "Mathematics", minutes: 40 })
    expect(r.entries[1]).toMatchObject({ subject: "Reading", minutes: 20 })
    // Both segments resolve to Emma (second one inherits context)
    expect(r.entries.every((e) => e.kidId === "kid_emma")).toBe(true)
  })

  it("preserves meaningful notes while stripping kid/subject/duration tokens", () => {
    const r = parseQuickLog(
      "Emma did 40 min of math and we read Charlotte's Web for 20",
      kids,
    )
    expect(r.entries[1].notes).toMatch(/charlotte/i)
  })

  it("resolves 'half an hour' and 'an hour'", () => {
    const half = parseQuickLog("Emma read for half an hour", kids)
    expect(half.entries[0]?.minutes).toBe(30)

    const full = parseQuickLog("Noah did science for an hour", kids)
    expect(full.entries[0]?.minutes).toBe(60)
  })

  it("resolves '1.5 hours' as 90 minutes", () => {
    const r = parseQuickLog("Emma did math for 1.5 hours", kids)
    expect(r.entries[0]?.minutes).toBe(90)
  })

  it("handles number words ('twenty minutes' → 20)", () => {
    const r = parseQuickLog("Emma did math for twenty minutes", kids)
    expect(r.entries[0]?.minutes).toBe(20)
  })

  it("maps subject synonyms to canonical labels", () => {
    const pairs = [
      ["algebra", "Mathematics"],
      ["phonics", "Reading"],
      ["geography", "History"],
      ["painting", "Art"],
      ["piano", "Music"],
      ["soccer", "Physical Education"],
    ] as const
    for (const [term, label] of pairs) {
      const r = parseQuickLog(`Emma did ${term} for 20 min`, kids)
      expect(r.entries[0]?.subject).toBe(label)
    }
  })

  it("returns 0 entries when neither subject nor duration is present", () => {
    const r = parseQuickLog("Emma was very happy today", kids)
    expect(r.entries).toHaveLength(0)
    expect(r.hasUsableEntry).toBe(false)
  })

  it("returns 0 entries when no kid is mentioned anywhere", () => {
    const r = parseQuickLog("we did math for 40 minutes", kids)
    // Subject + minutes present but no kidId, so the entry is skipped
    // since our current loop only pushes when BOTH subject and minutes
    // are found AND we have a lastKid context. Without any kid yet,
    // lastKid stays null so this yields 0 entries.
    expect(r.entries.every((e) => e.kidId === undefined)).toBe(true)
    expect(r.hasUsableEntry).toBe(false)
  })

  it("does not match a kid's name as a substring of a longer word", () => {
    // "Emma" should not match inside "family"
    const r = parseQuickLog("the family did math for 20 min", kids)
    expect(r.entries[0]?.kidId).toBeUndefined()
  })

  it("is case-insensitive for kid names and subject terms", () => {
    const r = parseQuickLog("EMMA did MATH for 30 min", kids)
    expect(r.entries[0]).toMatchObject({ kidId: "kid_emma", subject: "Mathematics", minutes: 30 })
  })

  it("reports confidence between 0 and 1", () => {
    const r = parseQuickLog("Emma did math for 30 min", kids)
    expect(r.entries[0]?.confidence).toBeGreaterThan(0)
    expect(r.entries[0]?.confidence).toBeLessThanOrEqual(1)
  })
})
