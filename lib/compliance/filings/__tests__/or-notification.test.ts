import { describe, expect, it } from "vitest"
import { OR_NOTIFICATION_META, renderFilingPdf, type FilingSnapshot } from "@/lib/compliance/filings"

function buildSnapshot(overrides: Partial<FilingSnapshot> = {}): FilingSnapshot {
  return {
    state: "or",
    filingType: "notification",
    schoolYear: "2026-2027",
    generatedAt: "2026-08-15T12:00:00.000Z",
    instructionStartDate: "2026-08-25",
    parent: {
      displayName: "Alex Rivera",
      email: "alex@example.com",
      phone: "503-555-0123",
      address: { line1: "1200 SW Pine St", city: "Portland", state: "OR", zip: "97205" },
    },
    child: {
      id: "kid_rowan",
      name: "Rowan Rivera",
      birthDate: "2019-04-12",
      age: 7,
      grade: "2",
    },
    rulesVersion: "2026-06-14",
    ...overrides,
  }
}

describe("Oregon notification filing", () => {
  it("meta is registered with the correct citation and recipient", () => {
    expect(OR_NOTIFICATION_META.state).toBe("or")
    expect(OR_NOTIFICATION_META.filingType).toBe("notification")
    expect(OR_NOTIFICATION_META.citation).toContain("ORS 339.030")
    expect(OR_NOTIFICATION_META.recipient).toMatch(/Education Service District/i)
  })

  it("renders a non-empty PDF buffer for a complete snapshot", async () => {
    const snapshot = buildSnapshot()
    const buf = await renderFilingPdf(snapshot)
    expect(buf).toBeInstanceOf(Buffer)
    expect(buf.length).toBeGreaterThan(1000) // a single-page PDF is small but not tiny
    // PDF magic header
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)

  it("renders even with sparse / missing optional fields", async () => {
    const snapshot = buildSnapshot({
      parent: { displayName: "Minimal Parent" },
      child: { id: "", name: "Minimal Child" },
      instructionStartDate: undefined,
      rulesVersion: undefined,
    })
    const buf = await renderFilingPdf(snapshot)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)

  it("rejects unknown filing types", async () => {
    const snapshot = buildSnapshot({ filingType: "made-up" })
    await expect(renderFilingPdf(snapshot)).rejects.toThrow(/No filing template/i)
  })

  it("produces a different filing for a different child (sanity check on data flow)", async () => {
    const a = await renderFilingPdf(buildSnapshot({ child: { id: "k1", name: "Alpha" } }))
    const b = await renderFilingPdf(buildSnapshot({ child: { id: "k2", name: "Beta" } }))
    expect(a.equals(b)).toBe(false)
  }, 20000)
})
