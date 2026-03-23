import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { buildPersonalizationDirectives } from "@/lib/ai/personalization-directives"

export const maxDuration = 120

export async function POST(req: Request) {
  const { childName, grade, subject, topic, learningStyle, interests, location, familyValues, philosophy, strengths } = await req.json()

  const systemPrompt = `You are a master homeschool curriculum designer who creates complete, ready-to-teach lesson packets.

You produce structured JSON lesson packets that a parent with ZERO teaching experience can pick up and teach a great lesson. Your output must be practical, age-appropriate, and engaging.

CRITICAL RULES:
1. All content MUST be grade-appropriate for ${grade} grade level.
2. Use the child's name (${childName}) naturally throughout to personalize the experience.
3. Make hands-on activities use common household items whenever possible.
4. The teacher guide must be so clear that any parent can follow it confidently.
5. Every section must be complete and detailed — no placeholders or "add your own" filler.
6. Respond ONLY with valid JSON matching the exact schema below. No markdown, no code fences, no commentary.

JSON SCHEMA (follow this EXACTLY):
{
  "studentLesson": {
    "title": "string - engaging lesson title",
    "objective": "string - what the student will learn, written in kid-friendly language",
    "vocabulary": [
      { "term": "string", "definition": "string - age-appropriate definition" }
    ],
    "readingContent": "string - 3-5 paragraphs of engaging, educational content written at the appropriate reading level. Use vivid language and storytelling where appropriate.",
    "keyConcepts": ["string - 3-5 key takeaways"],
    "summary": "string - brief review of what was learned"
  },
  "worksheet": {
    "title": "string",
    "instructions": "string - general instructions for the student",
    "sections": [
      {
        "sectionTitle": "string",
        "type": "multiple_choice | short_answer | fill_blank | matching | drawing | writing_prompt",
        "instructions": "string",
        "items": ["string - each item is a complete question or prompt. For multiple_choice, format as: 'Question? A) option B) option C) option D) option'"]
      }
    ]
  },
  "teacherGuide": {
    "overview": "string - what this lesson covers and why it matters",
    "timeEstimate": "string - e.g. '45-60 minutes'",
    "preparationSteps": ["string - what to do before starting the lesson"],
    "teachingInstructions": [
      {
        "step": "number",
        "title": "string",
        "duration": "string - e.g. '10 minutes'",
        "instructions": "string - detailed instructions for the parent on what to do and say"
      }
    ],
    "discussionQuestions": ["string - open-ended questions to spark conversation"],
    "assessmentTips": ["string - how to know if the child understood the material"],
    "commonMisconceptions": ["string - mistakes kids commonly make and how to address them"]
  },
  "materialsList": {
    "required": [
      { "item": "string", "quantity": "string", "notes": "string (optional)" }
    ],
    "optional": [
      { "item": "string", "quantity": "string", "notes": "string (optional)" }
    ],
    "householdAlternatives": [
      { "original": "string - the ideal item", "alternative": "string - common household substitute" }
    ]
  },
  "experiment": {
    "title": "string - fun, descriptive name for the activity",
    "objective": "string - what this experiment demonstrates",
    "safetyNotes": ["string - any safety considerations"],
    "steps": [
      {
        "step": "number",
        "instruction": "string - clear, specific instruction",
        "tip": "string (optional) - helpful hint for parent or child"
      }
    ],
    "expectedResults": "string - what should happen and why",
    "scienceConnection": "string - how this connects to the lesson content",
    "cleanupInstructions": "string"
  },
  "localExploration": {
    "fieldTripIdeas": [
      {
        "name": "string - type of place to visit (e.g. 'Natural History Museum', 'Local Creek')",
        "type": "string - museum | park | library | historical_site | nature | community",
        "description": "string - what to do there",
        "learningConnection": "string - how it connects to the lesson"
      }
    ],
    "atHomeAlternatives": ["string - activities that bring the field trip experience home"],
    "onlineResources": [
      {
        "title": "string - name of resource",
        "description": "string - what it offers and how to use it"
      }
    ]
  },
  "extensions": {
    "struggling": [
      { "activity": "string - activity name", "description": "string - simplified version or extra support" }
    ],
    "onTrack": [
      { "activity": "string - activity name", "description": "string - reinforcement activity" }
    ],
    "advanced": [
      { "activity": "string - activity name", "description": "string - challenge activity for advanced learners" }
    ]
  },
  "references": [
    { "id": 1, "title": "string - source title", "url": "string (optional) - URL if known", "author": "string (optional)", "type": "book | article | video | website | research", "snippet": "string - brief description of what was cited" }
  ]
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

RESOURCE & CITATION RULES:
- When recommending books or resources in materialsList or onlineResources, include the URL if you know it with confidence.
- For onlineResources, include a "url" field with the actual URL when known (e.g., Khan Academy, PBS, National Geographic Kids).
- For materialsList items, include a "url" field for purchasable books/materials when you know the URL.
- Include a "references" array at the top level listing sources you drew from — include id, title, url (if known), author, type, and a brief snippet.
- Use [N] citation markers in readingContent and teacherGuide.overview when referencing specific sources.
- Only include URLs you are confident are correct.

Generate the complete lesson packet JSON now. Make it engaging, thorough, and practical. The parent should be able to print this out and teach an amazing lesson today. Every lesson should trace back to the family's values and the child's unique profile.`

  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    prompt: prompt,
  })

  return result.toTextStreamResponse()
}
