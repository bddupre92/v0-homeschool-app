import { groq } from "@ai-sdk/groq"

/**
 * AI model configuration with tiering and fallback.
 *
 * Model tiers:
 * - "fast"    → Small model for simple tasks (chat, compliance, suggestions)
 * - "smart"   → Large model for creative tasks (lesson building, curriculum plans)
 * - "packet"  → Large model for detailed JSON generation (lesson packets)
 *
 * Token budgets help keep within free tier limits.
 */

export type ModelTier = "fast" | "smart" | "packet"

interface ModelConfig {
  model: ReturnType<typeof groq>
  maxOutputTokens: number
  description: string
}

const MODEL_CONFIGS: Record<ModelTier, ModelConfig> = {
  fast: {
    model: groq("llama-3.1-8b-instant"),
    maxOutputTokens: 2048,
    description: "Fast 8B model for simple conversational tasks",
  },
  smart: {
    model: groq("llama-3.3-70b-versatile"),
    maxOutputTokens: 4096,
    description: "70B model for creative lesson building",
  },
  packet: {
    model: groq("llama-3.3-70b-versatile"),
    maxOutputTokens: 8192,
    description: "70B model for detailed lesson packet JSON",
  },
}

/**
 * Get the appropriate model config for a given intent.
 */
export function getModelForIntent(intent: string): ModelConfig {
  switch (intent) {
    // Creative tasks need the big model
    case "build_lessons":
    case "build_and_schedule":
    case "year_curriculum":
      return MODEL_CONFIGS.smart

    // Simple factual/conversational tasks use fast model
    case "compliance_check":
    case "learning_alignment":
    case "lesson_help":
    case "general":
    case "schedule_lessons":
    default:
      return MODEL_CONFIGS.fast
  }
}

/**
 * Get packet generation model config.
 */
export function getPacketModel(): ModelConfig {
  return MODEL_CONFIGS.packet
}

/**
 * Estimate token count from text (~4 chars per token for English).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Trim conversation history to fit within a token budget.
 * Keeps the most recent messages, always preserving the latest user message.
 */
export function trimConversationHistory(
  history: { role: string; content: string }[],
  maxTokens: number = 3000,
): { role: string; content: string }[] {
  if (history.length === 0) return history

  // Always include the last message
  let totalTokens = estimateTokens(history[history.length - 1].content)
  const trimmed: { role: string; content: string }[] = []

  // Walk backwards from second-to-last, adding messages until budget is hit
  for (let i = history.length - 2; i >= 0; i--) {
    const msgTokens = estimateTokens(history[i].content)
    if (totalTokens + msgTokens > maxTokens) break
    trimmed.unshift(history[i])
    totalTokens += msgTokens
  }

  // Always add the last message
  trimmed.push(history[history.length - 1])
  return trimmed
}
