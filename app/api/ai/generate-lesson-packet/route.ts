import { streamText } from "ai"
import { buildPersonalizationDirectives } from "@/lib/ai/personalization-directives"
import { getPacketModel, estimateTokens } from "@/lib/ai/model-config"
import { checkAIRateLimit, getRateLimitKey } from "@/lib/ai/rate-limit-ai"

export const maxDuration = 120

export async function POST(req: Request) {
  // Rate limit: 5 packets per minute
  const rl = checkAIRateLimit(getRateLimitKey(req), 5, 60_000)
  if (rl.limited) {
    return new Response(
      JSON.stringify({ error: rl.message }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    )
  }

  const { childName, grade, subject, topic, learningStyle, interests, location, familyValues, philosophy, strengths } = await req.json()

  // Trimmed prompt — field names only, no verbose descriptions. The model knows what these fields mean.
  const systemPrompt = `You are a homeschool curriculum designer. Create a complete lesson packet as valid JSON (no markdown, no code fences).

RULES: Grade-appropriate for ${grade}. Use "${childName}" by name. Hands-on activities with household items. Teacher guide clear enough for any parent. No placeholders.

JSON STRUCTURE (output this exact structure with real content):
{
  "studentLesson": { "title": "", "objective": "", "vocabulary": [{"term":"","definition":""}], "readingContent": "3-5 paragraphs", "keyConcepts": [""], "summary": "" },
  "worksheet": { "title": "", "instructions": "", "sections": [{"sectionTitle":"","type":"multiple_choice|short_answer|fill_blank|matching|drawing|writing_prompt","instructions":"","items":[""]}] },
  "teacherGuide": { "overview": "", "timeEstimate": "", "preparationSteps": [""], "teachingInstructions": [{"step":1,"title":"","duration":"","instructions":""}], "discussionQuestions": [""], "assessmentTips": [""], "commonMisconceptions": [""] },
  "materialsList": { "required": [{"item":"","quantity":"","notes":""}], "optional": [{"item":"","quantity":""}], "householdAlternatives": [{"original":"","alternative":""}] },
  "experiment": { "title": "", "objective": "", "safetyNotes": [""], "steps": [{"step":1,"instruction":"","tip":""}], "expectedResults": "", "scienceConnection": "", "cleanupInstructions": "" },
  "localExploration": { "fieldTripIdeas": [{"name":"","type":"museum|park|library|nature","description":"","learningConnection":""}], "atHomeAlternatives": [""], "onlineResources": [{"title":"","description":""}] },
  "extensions": { "struggling": [{"activity":"","description":""}], "onTrack": [{"activity":"","description":""}], "advanced": [{"activity":"","description":""}] },
  "references": [{"id":1,"title":"","type":"book|article|video|website","snippet":""}]
}`

  // Build personalization directives
  const philosophyArray = philosophy ? (Array.isArray(philosophy) ? philosophy : [philosophy]) : undefined
  const valuesArray = familyValues ? (Array.isArray(familyValues) ? familyValues : familyValues.split(",").map((v: string) => v.trim())) : undefined
  const interestsArray = interests ? (Array.isArray(interests) ? interests : interests.split(",").map((i: string) => i.trim())) : undefined

  const directives = buildPersonalizationDirectives(
    learningStyle,
    philosophyArray,
    valuesArray,
    interestsArray,
  )

  const prompt = `Create a complete lesson packet for:

STUDENT: ${childName}
GRADE LEVEL: ${grade}
SUBJECT: ${subject}
TOPIC: ${topic}
${learningStyle ? `LEARNING STYLE: ${learningStyle}` : ""}
${interests ? `CHILD'S INTERESTS: ${interests} (weave these into examples and activities where natural)` : ""}
${location ? `LOCATION: ${location} (suggest relevant local field trips and exploration activities for this area)` : ""}
${familyValues ? `FAMILY VALUES: ${familyValues} (subtly weave these values into discussion questions, reflection activities, and character connections)` : ""}
${philosophy ? `EDUCATIONAL PHILOSOPHY: ${philosophy} (align the teaching approach with this philosophy)` : ""}
${strengths ? `CHILD'S STRENGTHS: ${strengths} (leverage these strengths in activities)` : ""}

${directives}

Include a "references" array with sources. Use [N] citations in readingContent. Only include URLs you're confident about.
Generate the complete lesson packet JSON now.`

  const modelConfig = getPacketModel()
  console.log(`[lesson-packet] Prompt: ~${estimateTokens(systemPrompt + prompt)} tokens`)

  const result = await streamText({
    model: modelConfig.model,
    system: systemPrompt,
    prompt: prompt,
    maxTokens: modelConfig.maxOutputTokens,
  })

  return result.toTextStreamResponse()
}
