/**
 * Natural-language quick-log parser. Best-effort, client-only, no AI.
 *
 * "Emma did 40 min of math and we read Charlotte's Web for 20"
 *   → [
 *       { kidId: "kid_emma", subject: "Mathematics", minutes: 40 },
 *       { kidId: "kid_emma", subject: "Reading",     minutes: 20, notes: "Charlotte's Web" },
 *     ]
 *
 * Phase 4.4 adds an AI fallback when this can't extract cleanly.
 */

import type { Kid } from "@/lib/atoz-store"

export interface ParsedLogEntry {
  kidId?: string
  kidName?: string
  subject: string
  minutes: number
  notes?: string
  /** 0-1, how much of the segment was confidently mapped. */
  confidence: number
}

export interface ParsedLog {
  entries: ParsedLogEntry[]
  /** Original text minus anything that matched cleanly. Useful for "did we miss anything?" warnings. */
  residue: string
  /** True if at least one entry had both kid and subject and minutes. */
  hasUsableEntry: boolean
}

// Canonical subject synonyms → display name. Keep list short; match anywhere.
const SUBJECT_MAP: Array<{ match: RegExp; label: string }> = [
  { match: /\b(math(s)?|mathematics|algebra|arithmetic|geometry|fractions?)\b/i, label: "Mathematics" },
  { match: /\b(reading|read|books?|phonics|novel|chapter)\b/i, label: "Reading" },
  { match: /\b(writing|journal|spelling|grammar|language arts|vocab)\b/i, label: "Language Arts" },
  { match: /\b(science|biology|chemistry|physics|nature study|nature)\b/i, label: "Science" },
  { match: /\b(history|social studies|geography|civics)\b/i, label: "History" },
  { match: /\b(art|drawing|painting|craft)\b/i, label: "Art" },
  { match: /\b(music|piano|violin|guitar)\b/i, label: "Music" },
  { match: /\b(pe|gym|exercise|soccer|running|physical education)\b/i, label: "Physical Education" },
  { match: /\b(spanish|french|german|foreign language)\b/i, label: "Foreign Language" },
  { match: /\b(health|hygiene)\b/i, label: "Health" },
  { match: /\b(life skills?|cooking|baking|chores)\b/i, label: "Life Skills" },
  { match: /\b(tech|coding|programming|computer)\b/i, label: "Technology" },
]

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  ninety: 90,
}

function parseNumberToken(token: string): number | null {
  const lower = token.toLowerCase()
  if (NUMBER_WORDS[lower] !== undefined) return NUMBER_WORDS[lower]
  const n = Number(token.replace(/,/g, "."))
  return Number.isFinite(n) ? n : null
}

/** Extract a minute count from a segment like "40 min", "1 hour", "1.5 hr", "half an hour". */
function extractMinutes(segment: string): number | null {
  if (/\bhalf\s+an?\s+hour\b/i.test(segment)) return 30
  if (/\bquarter\s+of\s+an\s+hour\b/i.test(segment)) return 15
  if (/\ban\s+hour\b/i.test(segment)) return 60

  // "for 20", "20 min", "20m", "40 minutes", "1 hr", "1 hour", "1.5 hours"
  const patterns: Array<{ re: RegExp; unit: "min" | "hr" }> = [
    { re: /(\d+(?:[.,]\d+)?|\w+)\s*(?:hours?|hrs?|h)\b/i, unit: "hr" },
    { re: /(\d+(?:[.,]\d+)?|\w+)\s*(?:minutes?|mins?|m)\b/i, unit: "min" },
  ]
  for (const { re, unit } of patterns) {
    const m = segment.match(re)
    if (m) {
      const n = parseNumberToken(m[1])
      if (n !== null && n > 0) {
        return unit === "hr" ? Math.round(n * 60) : Math.round(n)
      }
    }
  }

  // "for 20" — fallback: assume minutes if the number is reasonable.
  const forMatch = segment.match(/\bfor\s+(\d+(?:[.,]\d+)?)\b/i)
  if (forMatch) {
    const n = Number(forMatch[1].replace(",", "."))
    if (n >= 5 && n <= 240) return Math.round(n)
  }

  return null
}

function findSubject(segment: string): { subject: string | null; matchText?: string } {
  for (const { match, label } of SUBJECT_MAP) {
    const m = segment.match(match)
    if (m) return { subject: label, matchText: m[0] }
  }
  return { subject: null }
}

function findKid(segment: string, kids: Kid[]): Kid | null {
  const lower = segment.toLowerCase()
  for (const kid of kids) {
    const name = kid.name.toLowerCase()
    if (!name) continue
    // Word-boundary match so "Mia" doesn't match in "family".
    const re = new RegExp(`\\b${escapeRegExp(name)}\\b`, "i")
    if (re.test(lower)) return kid
  }
  return null
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Split a sentence on clause separators that likely mark distinct log entries. */
function splitSegments(text: string): string[] {
  return text
    .split(/(?:,|;|\band\b|\bthen\b|\balso\b|\bplus\b|\n)+/i)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function parseQuickLog(text: string, kids: Kid[]): ParsedLog {
  const entries: ParsedLogEntry[] = []
  const segments = splitSegments(text)
  const matched: string[] = []

  let lastKid: Kid | null = null

  for (const raw of segments) {
    const kid = findKid(raw, kids) ?? lastKid
    if (kid) lastKid = kid

    const { subject, matchText } = findSubject(raw)
    const minutes = extractMinutes(raw)

    if (!subject && !minutes) continue // skip purely noise segments

    // Build a short "notes" from residual text after stripping kid, subject,
    // duration mentions. Keeps "Charlotte's Web" in "we read Charlotte's Web for 20".
    let notes: string | undefined = raw
    if (kid?.name) notes = notes.replace(new RegExp(`\\b${escapeRegExp(kid.name)}\\b`, "gi"), "")
    if (matchText) notes = notes.replace(new RegExp(escapeRegExp(matchText), "gi"), "")
    notes = notes
      .replace(/\b(for|of|on|did|we|i|spent|worked|studied|had|read)\b/gi, "")
      .replace(/\d+(?:[.,]\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b/gi, "")
      .replace(/\bfor\s+\d+\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[:·\-—]+|[:·\-—]+$/g, "")
      .trim() || undefined

    const signals = Number(!!kid) + Number(!!subject) + Number(!!minutes)
    const confidence = signals / 3

    if (minutes && subject) {
      entries.push({
        kidId: kid?.id,
        kidName: kid?.name,
        subject,
        minutes,
        notes,
        confidence,
      })
      matched.push(raw)
    }
  }

  const residue = text
  const hasUsableEntry = entries.some((e) => !!e.kidId && !!e.subject && e.minutes > 0)

  return { entries, residue, hasUsableEntry }
}
