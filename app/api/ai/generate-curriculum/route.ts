import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"

export const maxDuration = 60

export async function POST(req: Request) {
  const { researchQuery, researchContext, childName, duration, learningStyle, focusAreas, stateRequirements } =
    await req.json()

  const systemPrompt = `You are a master homeschool curriculum designer.
  You will be given a research context containing a list of online resources, along with a child's details and desired curriculum structure.
  Your task is to create a comprehensive, engaging, and personalized curriculum.

  **Instructions:**
  1.  **Analyze the Research:** Carefully review the provided research context. Synthesize the information to form a coherent educational plan.
  2.  **Structure the Curriculum:** Create a curriculum with a clear title, a brief description, a list of 3-5 high-level learning objectives, and a week-by-week lesson plan.
  3.  **Personalize:** Tailor the activities and suggestions to the child's name, specified learning style (if any), and focus areas. For example, for a 'Kinesthetic' learner, suggest more hands-on activities.
  4.  **Weekly Plan:** For each week, provide a clear theme or topic, and a brief description of the activities. Reference the provided URLs from the research context where appropriate.
  5.  **State Requirements:** If state requirements are provided, align the curriculum to those requirements.
  6.  **Output Format:** Respond with a single, valid JSON object. Do not include any text or markdown formatting before or after the JSON.

  **JSON Schema:**
  {
    "title": "string",
    "description": "string",
    "objectives": ["string"],
    "lessons": [
      { "title": "Week 1: [Theme]", "description": "string" }
    ]
  }
  `

  const prompt = `
  **Research Query:**
  - Subject: ${researchQuery.subject}
  - Grade: ${researchQuery.grade}
  - Topics: ${researchQuery.topics}

  **Research Context:**
  ${JSON.stringify(researchContext, null, 2)}

  **Child & Curriculum Details:**
  - Child's Name: ${childName}
  - Duration: ${duration}
  - Learning Style: ${learningStyle || "Balanced"}
  - Focus Areas: ${focusAreas || "Core concepts"}
  - State Requirements: ${stateRequirements || "None provided"}

  Generate the curriculum now.
  `

  const result = await streamText({
    model: groq("llama3-70b-8192"),
    system: systemPrompt,
    prompt: prompt,
    response_format: { type: "json" },
  })

  return result.toAIStreamResponse()
}
