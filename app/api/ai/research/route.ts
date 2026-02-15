import { NextResponse } from "next/server"
import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"
import { searchWeb } from "@/lib/tools/search"
import { requireAuth } from "@/lib/auth-service"
import { rateLimiter, createRateLimitResponse } from "@/lib/rate-limit"
import { type NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { limited } = rateLimiter(req, { limit: 10, windowMs: 60 * 1000 })
  if (limited) {
    return createRateLimitResponse()
  }

  try {
    await requireAuth()

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
  } catch (error: any) {
    if (error?.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Failed to research:", error)
    return NextResponse.json({ error: "Failed to research" }, { status: 500 })
  }
}
