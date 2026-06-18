/**
 * Phase 8 filing-template shared types.
 *
 * Every generated PDF is rendered from a frozen `FilingSnapshot` so the
 * record is reproducible. The snapshot lives in `compliance_filings.
 * source_data_snapshot JSONB` — regenerating a year-old filing produces
 * the same bytes.
 */

export interface FilingParent {
  displayName: string
  email?: string
  phone?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    zip?: string
  }
}

export interface FilingChild {
  id: string
  name: string
  birthDate?: string // ISO date
  age?: number
  grade?: string
}

export interface FilingHoursBySubject {
  subject: string
  minutes: number
}

export interface FilingPortfolioSample {
  date: string // ISO
  title: string
  subject?: string
  notes?: string
}

export interface FilingTestResult {
  testName: string
  date: string
  grade?: string
  notes?: string
}

/**
 * The frozen input for a single filing render. State-specific renderers
 * may use a subset; OR notification needs only parent + child + dates,
 * while NY IHIP needs hours by subject + curriculum plan.
 */
export interface FilingSnapshot {
  /** State code in lowercase ISO ('or', 'ny', 'pa', 'ma'). */
  state: "or" | "ny" | "pa" | "ma"
  /** Which form within the state ('notification', 'ihip', 'portfolio', etc.) */
  filingType: string
  /** 'YYYY-YYYY', e.g. '2026-2027'. */
  schoolYear: string
  /** Quarter number 1-4 for NY quarterlies. */
  quarter?: number
  /** Period covered (used by NY quarterlies + PA portfolios). */
  periodStartDate?: string
  periodEndDate?: string
  /** ISO timestamp the parent generated this filing. */
  generatedAt: string
  /** Date the homeschool year started, ISO. */
  instructionStartDate?: string
  parent: FilingParent
  child: FilingChild
  /** Curriculum / materials chosen per subject (NY IHIP). */
  curriculumBySubject?: FilingCurriculumLine[]
  hoursBySubject?: FilingHoursBySubject[]
  portfolioSamples?: FilingPortfolioSample[]
  testResults?: FilingTestResult[]
  /** Per-subject narrative or grade — NY quarterlies use this. */
  subjectProgress?: FilingSubjectProgress[]
  /** Days of instruction in the period (PA + NY hour-targets). */
  daysOfInstruction?: number
  /** ISO date the state rules data was last reviewed by us. */
  rulesVersion?: string
  /** Optional free-text notes the parent wants on the filing. */
  notes?: string
  /** Evaluator info — PA portfolios reference the evaluator's certification. */
  evaluator?: FilingEvaluator
}

export interface FilingCurriculumLine {
  subject: string
  materials: string
}

export interface FilingSubjectProgress {
  subject: string
  hoursThisPeriod?: number
  narrative?: string
  grade?: string
}

export interface FilingEvaluator {
  name: string
  certificationNumber?: string
  evaluationDate?: string
}

export interface FilingTypeMeta {
  state: FilingSnapshot["state"]
  filingType: string
  /** Human title shown in the UI and on the PDF. */
  title: string
  /** One-sentence description for the picker. */
  description: string
  /** Citation string for the disclaimer ("ORS 339.030"). */
  citation: string
  /** Who receives the filing ("Education Service District", "School Superintendent"). */
  recipient: string
}
