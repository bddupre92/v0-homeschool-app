import { describe, expect, it } from "vitest"
import {
  MA_PLAN_META,
  OR_TEST_RESULTS_META,
  renderFilingPdf,
  type FilingSnapshot,
} from "@/lib/compliance/filings"

function baseSnapshot(overrides: Partial<FilingSnapshot> = {}): FilingSnapshot {
  return {
    state: "ma",
    filingType: "plan",
    schoolYear: "2026-2027",
    generatedAt: "2026-08-15T12:00:00.000Z",
    parent: {
      displayName: "Jordan Lee",
      email: "jordan@example.com",
      phone: "617-555-0100",
      address: { line1: "1 Beacon St", city: "Boston", state: "MA", zip: "02108" },
    },
    child: { id: "kid_q", name: "Quinn Lee", birthDate: "2017-05-10", age: 9, grade: "4" },
    rulesVersion: "2026-06-18",
    ...overrides,
  }
}

describe("MA plan template", () => {
  it("meta cites Charles 1987 and routes to the local school committee", () => {
    expect(MA_PLAN_META.state).toBe("ma")
    expect(MA_PLAN_META.filingType).toBe("plan")
    expect(MA_PLAN_META.citation).toMatch(/Charles/)
    expect(MA_PLAN_META.citation).toContain("399 Mass. 324")
    expect(MA_PLAN_META.recipient).toMatch(/school committee/i)
  })

  it("renders a non-empty PDF with curriculum + days + hours", async () => {
    const snap = baseSnapshot({
      curriculumBySubject: [
        { subject: "Reading", materials: "Sonlight Core E" },
        { subject: "Mathematics", materials: "Beast Academy 4A" },
        { subject: "Science", materials: "Mystery Science + REAL Science 4 Kids" },
      ],
      hoursBySubject: [{ subject: "Total weekly hours", minutes: 25 * 60 }],
      daysOfInstruction: 180,
      periodStartDate: "2026-09-08",
      periodEndDate: "2027-06-15",
    })
    const buf = await renderFilingPdf(snap)
    expect(buf.length).toBeGreaterThan(1500)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)

  it("renders without curriculum (empty hint shows in the criterion-2 block)", async () => {
    const snap = baseSnapshot({ curriculumBySubject: [] })
    const buf = await renderFilingPdf(snap)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)

  it("uses notes as the Charles competence paragraph (bytes change with notes)", async () => {
    const a = await renderFilingPdf(baseSnapshot({ notes: "" }))
    const b = await renderFilingPdf(
      baseSnapshot({
        notes: "Parent holds a Massachusetts teaching license + 6 years of K-5 classroom experience.",
      }),
    )
    expect(a.equals(b)).toBe(false)
  }, 20000)
})

describe("OR test results template", () => {
  it("meta cites ORS 339.035 / OAR 581-021-0029 and routes to ESD", () => {
    expect(OR_TEST_RESULTS_META.state).toBe("or")
    expect(OR_TEST_RESULTS_META.filingType).toBe("test-results")
    expect(OR_TEST_RESULTS_META.citation).toContain("ORS 339.035")
    expect(OR_TEST_RESULTS_META.recipient).toMatch(/Education Service District/i)
  })

  it("renders with a single Iowa test result", async () => {
    const snap = baseSnapshot({
      state: "or",
      filingType: "test-results",
      child: { id: "k1", name: "Quinn Lee", grade: "3" },
      testResults: [
        {
          testName: "Iowa Tests of Basic Skills",
          date: "2027-05-15",
          grade: "3",
          notes: "Composite 73rd percentile",
        },
      ],
    })
    const buf = await renderFilingPdf(snap)
    expect(buf.length).toBeGreaterThan(1500)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)

  it("renders with multiple test results stacked", async () => {
    const snap = baseSnapshot({
      state: "or",
      filingType: "test-results",
      child: { id: "k1", name: "Quinn Lee", grade: "5" },
      testResults: [
        { testName: "TerraNova", date: "2025-05-12", grade: "3" },
        { testName: "Stanford Achievement Test", date: "2027-05-10", grade: "5" },
      ],
    })
    const buf = await renderFilingPdf(snap)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)

  it("empty test-results list renders the hint instead of crashing", async () => {
    const snap = baseSnapshot({ state: "or", filingType: "test-results", testResults: [] })
    const buf = await renderFilingPdf(snap)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)
})
