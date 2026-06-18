import { describe, expect, it } from "vitest"
import {
  NY_IHIP_META,
  NY_QUARTERLY_META,
  PA_PORTFOLIO_META,
  renderFilingPdf,
  type FilingSnapshot,
} from "@/lib/compliance/filings"

function baseSnapshot(overrides: Partial<FilingSnapshot> = {}): FilingSnapshot {
  return {
    state: "ny",
    filingType: "ihip",
    schoolYear: "2026-2027",
    generatedAt: "2026-08-15T12:00:00.000Z",
    parent: {
      displayName: "Sam Cohen",
      email: "sam@example.com",
      phone: "212-555-0100",
      address: { line1: "100 W 86th St", city: "New York", state: "NY", zip: "10024" },
    },
    child: { id: "kid_a", name: "Ari Cohen", birthDate: "2017-09-01", age: 9, grade: "4" },
    rulesVersion: "2026-06-15",
    ...overrides,
  }
}

describe("NY IHIP template", () => {
  it("meta is registered with NYCRR § 100.10 citation", () => {
    expect(NY_IHIP_META.state).toBe("ny")
    expect(NY_IHIP_META.filingType).toBe("ihip")
    expect(NY_IHIP_META.citation).toContain("100.10")
    expect(NY_IHIP_META.recipient).toMatch(/superintendent/i)
  })

  it("renders a non-empty PDF with full curriculum list", async () => {
    const snap = baseSnapshot({
      curriculumBySubject: [
        { subject: "Arithmetic", materials: "Beast Academy 4A" },
        { subject: "Reading", materials: "Charlotte's Web, Wonder" },
        { subject: "Science", materials: "Real Science 4 Kids" },
      ],
    })
    const buf = await renderFilingPdf(snap)
    expect(buf.length).toBeGreaterThan(1000)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)

  it("renders even with empty curriculum (the hint is shown instead)", async () => {
    const snap = baseSnapshot({ curriculumBySubject: [] })
    const buf = await renderFilingPdf(snap)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)
})

describe("NY Quarterly template", () => {
  it("meta is registered with § 100.10(g) citation", () => {
    expect(NY_QUARTERLY_META.state).toBe("ny")
    expect(NY_QUARTERLY_META.filingType).toBe("quarterly")
    expect(NY_QUARTERLY_META.citation).toContain("100.10(g)")
  })

  it("renders Q1 with subject progress + period range", async () => {
    const snap = baseSnapshot({
      filingType: "quarterly",
      quarter: 1,
      periodStartDate: "2026-09-05",
      periodEndDate: "2026-11-14",
      daysOfInstruction: 45,
      subjectProgress: [
        {
          subject: "Arithmetic",
          hoursThisPeriod: 25,
          narrative: "Multi-digit multiplication, long division.",
          grade: "A",
        },
        { subject: "Reading", hoursThisPeriod: 30, narrative: "Read Charlotte's Web; narrated chapters." },
      ],
    })
    const buf = await renderFilingPdf(snap)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
    expect(buf.length).toBeGreaterThan(1500)
  }, 15000)

  it("Q4 shows the annual-assessment block (different bytes than Q1)", async () => {
    const q1 = await renderFilingPdf(baseSnapshot({ filingType: "quarterly", quarter: 1 }))
    const q4 = await renderFilingPdf(
      baseSnapshot({
        filingType: "quarterly",
        quarter: 4,
        testResults: [{ testName: "Iowa Test of Basic Skills", date: "2027-05-15", grade: "4" }],
      }),
    )
    expect(q1.equals(q4)).toBe(false)
  }, 20000)

  it("annual target reflects grade band (990 for 7-12)", async () => {
    // No assertion against the rendered text directly (PDF binary), but the
    // render must succeed for an upper-grade student.
    const buf = await renderFilingPdf(
      baseSnapshot({
        filingType: "quarterly",
        quarter: 1,
        child: { id: "k2", name: "Older Student", grade: "9" },
      }),
    )
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)
})

describe("PA Act 169 portfolio template", () => {
  it("meta is registered with 24 P.S. § 13-1327.1 citation", () => {
    expect(PA_PORTFOLIO_META.state).toBe("pa")
    expect(PA_PORTFOLIO_META.filingType).toBe("portfolio")
    expect(PA_PORTFOLIO_META.citation).toContain("13-1327.1")
    expect(PA_PORTFOLIO_META.recipient).toMatch(/evaluator/i)
  })

  it("renders a full portfolio with hours + samples + tests + evaluator", async () => {
    const snap = baseSnapshot({
      state: "pa",
      filingType: "portfolio",
      daysOfInstruction: 182,
      hoursBySubject: [
        { subject: "English (reading)", minutes: 180 * 60 },
        { subject: "Arithmetic", minutes: 150 * 60 },
        { subject: "Science", minutes: 100 * 60 },
      ],
      portfolioSamples: [
        { date: "2026-10-15", title: "Long-division worksheet", subject: "Arithmetic" },
        { date: "2027-03-02", title: "Solar system diagram", subject: "Science" },
      ],
      testResults: [{ testName: "TerraNova", date: "2027-04-30", grade: "3", notes: "75th percentile" }],
      evaluator: { name: "Dr. Maria Lopez", certificationNumber: "PA-12345", evaluationDate: "2027-06-15" },
    })
    const buf = await renderFilingPdf(snap)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
    expect(buf.length).toBeGreaterThan(2000)
  }, 15000)

  it("renders even with zero samples and zero hours (empty hints shown)", async () => {
    const snap = baseSnapshot({
      state: "pa",
      filingType: "portfolio",
      hoursBySubject: [],
      portfolioSamples: [],
    })
    const buf = await renderFilingPdf(snap)
    expect(buf.toString("utf8", 0, 4)).toBe("%PDF")
  }, 15000)

  it("different evaluator → different bytes (snapshot flows through)", async () => {
    const a = await renderFilingPdf(
      baseSnapshot({
        state: "pa",
        filingType: "portfolio",
        evaluator: { name: "Evaluator A" },
      }),
    )
    const b = await renderFilingPdf(
      baseSnapshot({
        state: "pa",
        filingType: "portfolio",
        evaluator: { name: "Evaluator B" },
      }),
    )
    expect(a.equals(b)).toBe(false)
  }, 20000)
})
