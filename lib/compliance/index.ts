/**
 * State-specific compliance stub. Phase 4 expands this into a full
 * guides database with legal review. For Phase 2.3 we ship one
 * hand-curated entry per major state so the countdown UI has
 * something real to read.
 */

export type FilingType = "annual-assessment" | "intent-to-homeschool" | "portfolio-review" | "standardized-test"

export interface ComplianceFiling {
  type: FilingType
  label: string
  /** MM-DD (recurring each year). */
  recurring?: string
  /** Full ISO date for one-off deadlines. */
  date?: string
  note?: string
}

export interface StateCompliance {
  abbr: string
  name: string
  summary: string
  filings: ComplianceFiling[]
}

/**
 * Hand-curated stub. Every entry must be legally reviewed before
 * shipping publicly — flag missing reviews in the UI until then.
 */
const STATE_COMPLIANCE: Record<string, StateCompliance> = {
  FL: {
    abbr: "FL",
    name: "Florida",
    summary: "Annual evaluation due by the anniversary of your notice of intent.",
    filings: [
      {
        type: "annual-assessment",
        label: "Annual evaluation",
        recurring: "05-15",
        note: "Nationally normed test OR portfolio evaluation.",
      },
    ],
  },
  TX: {
    abbr: "TX",
    name: "Texas",
    summary: "No mandatory filings. Curriculum must cover reading, spelling, grammar, math, and citizenship.",
    filings: [],
  },
  CA: {
    abbr: "CA",
    name: "California",
    summary: "File Private School Affidavit (PSA) annually in October.",
    filings: [
      {
        type: "intent-to-homeschool",
        label: "Private School Affidavit",
        recurring: "10-15",
        note: "File online via CDE between Oct 1 and Oct 15.",
      },
    ],
  },
  NY: {
    abbr: "NY",
    name: "New York",
    summary: "IHIP + quarterly reports + annual assessment.",
    filings: [
      { type: "intent-to-homeschool", label: "Notice of Intent", recurring: "07-01" },
      { type: "portfolio-review", label: "Quarterly report #1", recurring: "11-15" },
      { type: "annual-assessment", label: "Annual assessment", recurring: "06-30" },
    ],
  },
  PA: {
    abbr: "PA",
    name: "Pennsylvania",
    summary: "Affidavit + portfolio evaluation by a certified evaluator.",
    filings: [
      { type: "intent-to-homeschool", label: "Annual affidavit", recurring: "08-01" },
      { type: "portfolio-review", label: "Portfolio evaluation", recurring: "06-30" },
    ],
  },
}

export function getStateCompliance(abbr?: string): StateCompliance | null {
  if (!abbr) return null
  return STATE_COMPLIANCE[abbr.toUpperCase()] ?? null
}

/**
 * Next upcoming filing, if any. Handles year-rollover by treating a
 * past recurring date this year as "next year".
 */
export function nextFiling(abbr?: string, reference: Date = new Date()): { filing: ComplianceFiling; due: Date } | null {
  const state = getStateCompliance(abbr)
  if (!state || state.filings.length === 0) return null

  const upcoming = state.filings
    .map((f) => ({ filing: f, due: resolveDueDate(f, reference) }))
    .filter((x) => x.due !== null) as { filing: ComplianceFiling; due: Date }[]

  if (upcoming.length === 0) return null
  upcoming.sort((a, b) => a.due.getTime() - b.due.getTime())
  return upcoming[0]
}

function resolveDueDate(filing: ComplianceFiling, reference: Date): Date | null {
  if (filing.date) {
    const d = new Date(filing.date)
    return d >= reference ? d : null
  }
  if (filing.recurring) {
    const [m, dayStr] = filing.recurring.split("-").map(Number)
    if (!m || !dayStr) return null
    let year = reference.getFullYear()
    let due = new Date(year, m - 1, dayStr)
    if (due < reference) {
      year += 1
      due = new Date(year, m - 1, dayStr)
    }
    return due
  }
  return null
}

export function daysUntil(date: Date, reference: Date = new Date()): number {
  const ms = date.getTime() - reference.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}
