/**
 * Advisor API — contextual lesson suggestions from Claude. Deliberately
 * NOT a global chat widget; the client posts a lesson + kid + recent
 * sessions snapshot and gets back a short structured response.
 *
 * Returns 503 if ANTHROPIC_API_KEY is not configured so the UI can
 * hide the feature silently in dev.
 */

import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface SuggestRequest {
  lesson: {
    title: string
    subject: string
    goal?: string
    durationMin?: number
    materials: string[]
    planSteps: { id: string; text: string }[]
  }
  kid?: {
    name: string
    age?: number
  }
  recentSubjects?: string[]
  /** Free-form parent note — what's going on, what worked last time, etc. */
  context?: string
}

interface SuggestResponse {
  summary: string
  steps: string[]
  warnings?: string[]
}

const MODEL = "claude-sonnet-4-6"

const SYSTEM_PROMPT = `You are a calm homeschool advisor built into a five-room homeschool app called AtoZ Family. Parents open you only during active lesson planning. You offer concrete, age-appropriate suggestions grounded in what the parent is already teaching — not generic curriculum advice.

Anti-goals (strict):
- Never reference streaks, badges, points, leaderboards, or "keeping up."
- Never shame or pressure about missed lessons or gaps.
- Never recommend assessments, standardized tests, or grading unless the parent asks.
- Never suggest paid curricula or external services.

Tone: brief, practical, warm. Trust the parent.

Output format: reply ONLY with valid JSON matching this shape exactly:
{
  "summary": "one sentence describing the suggested shape of the lesson",
  "steps": ["3-5 short actionable suggestions, each one phrase or sentence"],
  "warnings": ["optional array — only include if there is something worth flagging"]
}

Keep steps to single actions. No markdown in values.`

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Advisor not configured. Set ANTHROPIC_API_KEY in the environment." },
      { status: 503 },
    )
  }

  let body: SuggestRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body?.lesson?.title || !body?.lesson?.subject) {
    return NextResponse.json(
      { error: "lesson.title and lesson.subject are required" },
      { status: 400 },
    )
  }

  const userPrompt = buildPrompt(body)

  const anthropic = new Anthropic({ apiKey })
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    })

    const text = extractText(message.content)
    const parsed = parseSuggest(text)
    if (!parsed) {
      return NextResponse.json(
        { error: "Advisor returned an unreadable response. Try again." },
        { status: 502 },
      )
    }
    return NextResponse.json(parsed satisfies SuggestResponse)
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Advisor request failed" },
      { status: 500 },
    )
  }
}

function buildPrompt(req: SuggestRequest): string {
  const { lesson, kid, recentSubjects, context } = req
  const lines = [
    `Lesson title: ${lesson.title}`,
    `Subject: ${lesson.subject}`,
  ]
  if (lesson.goal) lines.push(`Goal: ${lesson.goal}`)
  if (lesson.durationMin) lines.push(`Planned duration: ${lesson.durationMin} minutes`)
  if (lesson.materials.length) lines.push(`Materials: ${lesson.materials.join(", ")}`)
  if (lesson.planSteps.length) {
    lines.push(`Existing plan steps:`)
    for (const s of lesson.planSteps) lines.push(`- ${s.text}`)
  }
  if (kid) lines.push(`Learner: ${kid.name}${kid.age ? ` (age ${kid.age})` : ""}`)
  if (recentSubjects?.length) lines.push(`Recent subjects this week: ${recentSubjects.join(", ")}`)
  if (context) lines.push(`Parent note: ${context}`)
  lines.push("", "Suggest 3-5 concrete steps or tweaks for this lesson. Respond in JSON as specified.")
  return lines.join("\n")
}

function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim()
}

function parseSuggest(text: string): SuggestResponse | null {
  // Tolerate minor preamble/trailing before/after the JSON.
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    const obj = JSON.parse(jsonMatch[0]) as Partial<SuggestResponse>
    if (typeof obj.summary !== "string" || !Array.isArray(obj.steps)) return null
    return {
      summary: obj.summary,
      steps: obj.steps.filter((s): s is string => typeof s === "string"),
      warnings: Array.isArray(obj.warnings)
        ? obj.warnings.filter((s): s is string => typeof s === "string")
        : undefined,
    }
  } catch {
    return null
  }
}
