#!/usr/bin/env node
/**
 * Phase 8 dogfooding harness — actually generate the six filing PDFs +
 * one JSON sidecar from realistic snapshots and write them to
 * .review-logs/dogfood/ so a human can visually inspect them.
 *
 * Not a unit test — those exist in lib/compliance/filings/__tests__.
 * This is for spotting layout breakage, line-wrap weirdness, missing
 * spacing, or copy issues that don't surface as a binary-render
 * failure.
 */

import { mkdir, writeFile } from "node:fs/promises"
import { renderFilingPdf } from "../lib/compliance/filings/index.ts"

const OUT = ".review-logs/dogfood"
await mkdir(OUT, { recursive: true })

const today = new Date().toISOString()

const parent = {
  displayName: "Alex Rivera",
  email: "alex@example.com",
  phone: "503-555-0123",
  address: { line1: "1200 SW Pine St", city: "Portland", state: "OR", zip: "97205" },
}

const childYoung = { id: "kid_rowan", name: "Rowan Rivera", birthDate: "2019-04-12", age: 7, grade: "2" }
const childMid = { id: "kid_ari", name: "Ari Cohen", birthDate: "2017-09-01", age: 9, grade: "4" }
const childOlder = { id: "kid_juno", name: "Juno Cohen", birthDate: "2013-03-15", age: 13, grade: "8" }

const snapshots = [
  // 1. Oregon notification — simplest, one-page
  {
    state: "or",
    filingType: "notification",
    schoolYear: "2026-2027",
    generatedAt: today,
    instructionStartDate: "2026-08-25",
    parent,
    child: childYoung,
    rulesVersion: "2026-06-18",
    notes: "First year homeschooling — transferring from Buckman Elementary.",
  },
  // 2. Oregon test results — multiple stacked tests
  {
    state: "or",
    filingType: "test-results",
    schoolYear: "2026-2027",
    generatedAt: today,
    parent,
    child: { ...childMid, grade: "5" },
    rulesVersion: "2026-06-18",
    testResults: [
      { testName: "TerraNova", date: "2025-05-12", grade: "3", notes: "Composite 73rd percentile (passed)" },
      { testName: "Stanford Achievement Test", date: "2027-05-10", grade: "5", notes: "Reading 82, Math 78, Lang 79" },
    ],
  },
  // 3. NY IHIP — full K-6 curriculum
  {
    state: "ny",
    filingType: "ihip",
    schoolYear: "2026-2027",
    generatedAt: today,
    parent: { ...parent, displayName: "Sam Cohen", address: { line1: "100 W 86th St", city: "New York", state: "NY", zip: "10024" } },
    child: childMid,
    rulesVersion: "2026-06-15",
    curriculumBySubject: [
      { subject: "Arithmetic", materials: "Beast Academy 4A-4D (Art of Problem Solving) — workbook + guide + online platform" },
      { subject: "Reading", materials: "Sonlight Core E literature list: Charlotte's Web, Wonder, From the Mixed-Up Files of Mrs. Basil E. Frankweiler, plus daily silent reading" },
      { subject: "Spelling", materials: "All About Spelling Level 4 — phonogram review, dictation practice" },
      { subject: "Writing", materials: "IEW Student Writing Intensive A — weekly assignments, daily journaling" },
      { subject: "English", materials: "First Language Lessons Level 4 — grammar diagramming + oral narration" },
      { subject: "Geography", materials: "Beautiful Feet Geography of US — map drills + Holling C. Holling Paddle to the Sea" },
      { subject: "US History", materials: "Story of the World Vol. 3 (Early Modern) — chapter-a-week + biographies" },
      { subject: "Science", materials: "REAL Science Odyssey: Life Level 1 — weekly experiment + nature journaling" },
      { subject: "Health Education", materials: "Standard health curriculum from district library; safety + hygiene units" },
      { subject: "Music", materials: "Piano lessons Tuesday, weekly choir, classical-composer study (Bach this quarter)" },
      { subject: "Visual Arts", materials: "Atelier Art Curriculum + monthly museum visits, sketchbook practice" },
      { subject: "Physical Education", materials: "Soccer practice Mon/Wed, family hikes, weekly swimming" },
    ],
    notes: "Working ahead in math; reading is at grade 6 level.",
  },
  // 4. NY Quarterly Q4 — annual assessment included
  {
    state: "ny",
    filingType: "quarterly",
    schoolYear: "2026-2027",
    generatedAt: today,
    quarter: 4,
    periodStartDate: "2027-04-01",
    periodEndDate: "2027-06-30",
    daysOfInstruction: 55,
    parent: { ...parent, displayName: "Sam Cohen" },
    child: childMid,
    rulesVersion: "2026-06-15",
    subjectProgress: [
      { subject: "Arithmetic", hoursThisPeriod: 40, grade: "A", narrative: "Completed Beast Academy 4D. Fractions + decimals fluent. Started pre-algebra concepts." },
      { subject: "Reading", hoursThisPeriod: 45, narrative: "Read Wonder + Roll of Thunder, Hear My Cry. Excellent oral narration." },
      { subject: "Writing", hoursThisPeriod: 25, grade: "B+", narrative: "Five-paragraph essay on Civil War causes. Working on transitions." },
      { subject: "US History", hoursThisPeriod: 20, narrative: "Reconstruction → Industrial Revolution. Built a model of a factory." },
      { subject: "Science", hoursThisPeriod: 30, grade: "A", narrative: "Plant biology unit, dissected an owl pellet, two field trips to the arboretum." },
      { subject: "Health Education", hoursThisPeriod: 8, narrative: "Nutrition unit, planned and cooked three family meals." },
      { subject: "Music", hoursThisPeriod: 22, narrative: "Piano recital, Mozart movement learned." },
      { subject: "Visual Arts", hoursThisPeriod: 18, narrative: "Watercolor self-portrait, attended Met youth program." },
      { subject: "Physical Education", hoursThisPeriod: 35, narrative: "Soccer season ended (team won bracket). Swimming weekly." },
    ],
    testResults: [
      { testName: "Iowa Test of Basic Skills (ITBS)", date: "2027-05-15", grade: "4", notes: "Composite 78th percentile — Reading 84, Math 81, Lang 72" },
    ],
    notes: "Year-end portfolio attached separately.",
  },
  // 5. PA Act 169 portfolio — full year
  {
    state: "pa",
    filingType: "portfolio",
    schoolYear: "2026-2027",
    generatedAt: today,
    periodStartDate: "2026-09-05",
    periodEndDate: "2027-06-15",
    daysOfInstruction: 182,
    parent: { ...parent, displayName: "Pat Sullivan", address: { line1: "414 Walnut St", city: "Pittsburgh", state: "PA", zip: "15222" } },
    child: childMid,
    rulesVersion: "2026-06-15",
    hoursBySubject: [
      { subject: "English (reading)", minutes: 180 * 60 },
      { subject: "English (writing)", minutes: 95 * 60 },
      { subject: "English (spelling)", minutes: 60 * 60 },
      { subject: "Arithmetic", minutes: 150 * 60 },
      { subject: "Science", minutes: 100 * 60 },
      { subject: "Geography", minutes: 40 * 60 },
      { subject: "Civics", minutes: 30 * 60 },
      { subject: "Safety", minutes: 15 * 60 },
      { subject: "Health & Physiology", minutes: 45 * 60 },
      { subject: "Art", minutes: 60 * 60 },
      { subject: "Music", minutes: 80 * 60 },
      { subject: "Physical Education", minutes: 120 * 60 },
    ],
    portfolioSamples: [
      { date: "2026-10-15", title: "Long-division worksheet (mixed practice)", subject: "Arithmetic" },
      { date: "2026-11-04", title: "Charlotte's Web narration journal", subject: "English (reading)" },
      { date: "2027-01-22", title: "Solar system 3D model + write-up", subject: "Science" },
      { date: "2027-03-02", title: "PA state-history report", subject: "Geography", notes: "8 pages, illustrated" },
      { date: "2027-05-08", title: "Watercolor landscape", subject: "Art" },
    ],
    testResults: [
      { testName: "TerraNova", date: "2027-04-30", grade: "4", notes: "Composite 75th percentile" },
    ],
    evaluator: {
      name: "Dr. Maria Lopez",
      certificationNumber: "PA-CERT-12345",
      evaluationDate: "2027-06-20",
    },
    notes: "All Act 169 required subjects covered. Standardized test included per § 13-1327.1(d)(2).",
  },
  // 6. MA Charles plan — older student, full Charles paragraph
  {
    state: "ma",
    filingType: "plan",
    schoolYear: "2026-2027",
    generatedAt: today,
    periodStartDate: "2026-09-08",
    periodEndDate: "2027-06-15",
    daysOfInstruction: 180,
    parent: { ...parent, displayName: "Jordan Lee", address: { line1: "1 Beacon St", city: "Boston", state: "MA", zip: "02108" } },
    child: childOlder,
    rulesVersion: "2026-06-18",
    notes: "Parent holds a Massachusetts professional teaching license (active) with 6 years K-5 classroom experience at Boston Public Schools. Continuing professional development in math instruction. Direct knowledge of this child's preferred learning style (concrete-sequential, math-strong, struggles with extended writing).",
    curriculumBySubject: [
      { subject: "Reading", materials: "Sonlight Core G literature — heavy on biographies, plus daily silent reading." },
      { subject: "Writing", materials: "IEW Advanced Writing Tools — weekly assignments, focus on argumentation." },
      { subject: "English language and grammar", materials: "Easy Grammar Plus, daily review." },
      { subject: "Mathematics", materials: "Saxon Math 8/7 — daily lessons + cumulative review." },
      { subject: "Geography", materials: "Trail Guide to World Geography — map work + current events." },
      { subject: "United States history", materials: "Story of the World Vol. 4 (Modern Age) — chapter-a-week + primary sources." },
      { subject: "Science", materials: "REAL Science Odyssey: Earth & Space — weekly experiment + lab notebook." },
      { subject: "Civics", materials: "Hillsdale K-12 Civics + weekly news discussion." },
      { subject: "Physical education", materials: "Tennis lessons Mon/Wed/Fri, swimming weekly, family hikes weekends." },
      { subject: "Health", materials: "Standard adolescent-health curriculum from district library." },
      { subject: "Art", materials: "Atelier Art + monthly MFA Boston visit." },
      { subject: "Music", materials: "Cello lessons Tuesday, weekly orchestra rehearsal." },
    ],
    hoursBySubject: [{ subject: "Total weekly hours", minutes: 28 * 60 }],
  },
]

const summary = []

for (const snap of snapshots) {
  const buf = await renderFilingPdf(snap)
  const filename = `${snap.state}-${snap.filingType}-${snap.child.name.replace(/\s+/g, "-")}.pdf`
  const path = `${OUT}/${filename}`
  await writeFile(path, buf)

  // simple PDF inspection: count /Page references (rough page count)
  const text = buf.toString("latin1")
  const pageMatches = text.match(/\/Type\s*\/Page\b/g) || []
  const pageCount = pageMatches.length

  summary.push({
    state: snap.state,
    filingType: snap.filingType,
    child: snap.child.name,
    filename,
    bytes: buf.length,
    pageCount,
    pdfMagic: buf.toString("utf8", 0, 4) === "%PDF",
  })
}

// One JSON sidecar example — produced by hand here (the API route returns the same shape)
const sidecarExample = {
  generator: "AtoZ Family",
  generator_version: "Phase 8",
  generated_at: today,
  submitted_at: null,
  rules_version: snapshots[2].rulesVersion,
  state_code: snapshots[2].state,
  filing_type: snapshots[2].filingType,
  school_year: snapshots[2].schoolYear,
  snapshot: snapshots[2],
  status: "generated",
  notes: snapshots[2].notes,
}
await writeFile(
  `${OUT}/sidecar-example-ny-ihip.json`,
  JSON.stringify(sidecarExample, null, 2),
)

console.log("=== Phase 8 dogfooding ===")
console.log(`Wrote ${summary.length} PDFs + 1 JSON sidecar to ${OUT}/`)
console.log()
for (const s of summary) {
  console.log(
    `  ${s.state.toUpperCase()}/${s.filingType.padEnd(13)} ${s.child.padEnd(15)} ${s.pageCount}p ${s.bytes.toString().padStart(6)}B  magic=${s.pdfMagic}`,
  )
}
console.log()
console.log(`Sidecar example: ${OUT}/sidecar-example-ny-ihip.json (${JSON.stringify(sidecarExample).length} chars)`)
