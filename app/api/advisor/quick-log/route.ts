/**
 * Quick-log AI fallback. The local regex parser in
 * lib/quick-log-parser handles most common sentences; this endpoint
 * picks up the ambiguous ones ("we spent the morning on nature
 * journals with both kids") and returns structured entries.
 *
 * Returns 503 if ANTHROPIC_API_KEY is missing so the UI hides
 * gracefully when the feature isn't configured.
 */

import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface QuickLogRequest {
  text: string
  kids: { id: string; name: string; age?: number }[]
  subjects: string[]
  dateIso: string
}

interface QuickLogEntry {
  kidId: string
  subject: string
  minutes: number
  notes?: string
  confidence: number
}

interface QuickLogResponse {
  entries: QuickLogEntry[]
}

const MODEL = "claude-haiku-4-5"

function buildSystemPrompt(kids: QuickLogRequest["kids"], subjects: string[]): string {
  const kidList = kids.length > 0
    ? kids.map((k) => `- ${k.name} (id: ${k.id}${k.age ? `, age ${k.age}` : ""})`).join("\n")
    : "(no kids on file)"
  const subjectList = subjects.join(", ")
  return `You extract structured learning-log entries from a parent's sentence. Output JSON only.

Known kids:
${kidList}

Preferred subject labels: ${subjectList}

Rules:
- Every entry must reference a known kid by id (exact match from the list above). If a kid is ambiguous or missing, drop the entry.
- subject must be one of the preferred labels when possible; otherwise a clean capitalized label like "Cooking" or "Geography".
- minutes must be a positive integer. Translate "half an hour" = 30, "an hour" = 60, "1.5 hours" = 90.
- notes is an optional short phrase (< 80 chars) preserving meaningful detail like a book title.
- confidence is 0 to 1 based on how certain you are the entry is correct.

Output strictly this JSON shape (no markdown, no prose, no wrapper):
{
  "entries": [
    { "kidId": "...", "subject": "...", "minutes": 40, "notes": "...", "confidence": 0.9 }
  ]
}

If the sentence contains no extractable entries, return { "entries": [] }.`
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Advisor not configured. Set ANTHROPIC_API_KEY in the environment." },
      { status: 503 },
    )
  }

  let body: QuickLogRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (typeof body?.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 })
  }
  if (!Array.isArray(body.kids) || body.kids.length === 0) {
    return NextResponse.json({ error: "At least one kid is required" }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey })
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: buildSystemPrompt(body.kids, body.subjects ?? []),
      messages: [{ role: "user", content: body.text.trim() }],
    })

    const text = extractText(message.content)
    const parsed = parseResponse(text, body.kids)
    return NextResponse.json(parsed satisfies QuickLogResponse)
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Advisor request failed" },
      { status: 500 },
    )
  }
}

function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim()
}

function parseResponse(text: string, kids: QuickLogRequest["kids"]): QuickLogResponse {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { entries: [] }
  try {
    const obj = JSON.parse(jsonMatch[0]) as Partial<QuickLogResponse>
    const rawEntries = Array.isArray(obj.entries) ? obj.entries : []
    const validKidIds = new Set(kids.map((k) => k.id))
    const entries = rawEntries
      .filter((e): e is QuickLogEntry =>
        typeof e?.kidId === "string" &&
        validKidIds.has(e.kidId) &&
        typeof e.subject === "string" &&
        typeof e.minutes === "number" &&
        Number.isFinite(e.minutes) &&
        e.minutes > 0,
      )
      .map((e) => ({
        kidId: e.kidId,
        subject: e.subject.trim(),
        minutes: Math.round(e.minutes),
        notes: typeof e.notes === "string" ? e.notes.slice(0, 120) : undefined,
        confidence: typeof e.confidence === "number" ? Math.min(1, Math.max(0, e.confidence)) : 0.5,
      }))
    return { entries }
  } catch {
    return { entries: [] }
  }
}
