import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"
import { searchWeb } from "@/lib/tools/search"

export const maxDuration = 30

export async function POST(req: Request) {
  const { subject, grade, topics } = await req.json()

  const result = await streamText({
    model: groq("llama3-70b-8192"),
    system: `You are an expert curriculum research assistant. Your goal is to find the best, most accurate, and relevant online resources for a specific subject and grade level.
    You will be given a subject, a grade, and key topics.
    Use the search tool to find high-quality educational websites, articles, videos, and interactive resources.
    Prioritize sources from reputable institutions like universities, museums, and well-known educational companies (e.g., Khan Academy, PBS Kids, National Geographic).
    For each resource you find, provide a concise summary of why it's relevant.
    Return a list of at least 5 and at most 10 resources.`,
    prompt: `Find curriculum resources for the subject: ${subject}, for grade: ${grade}. The key topics of interest are: ${topics}.`,
    tools: {
      searchWeb: {
        description: "Search the web for educational resources based on a query.",
        parameters: z.object({
          query: z.string().describe("The search query to find resources."),
        }),
        execute: async ({ query }) => searchWeb(query),
      },
    },
  })

  return result.toAIStreamResponse()
}
