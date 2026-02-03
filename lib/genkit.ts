import { genkit } from "genkit"
import { enableFirebaseTelemetry } from "@genkit-ai/firebase"
import { googleAI } from "@genkit-ai/googleai"

export const ai = genkit({
  plugins: [googleAI()],
  logLevel: "info",
})

export const defaultModel = googleAI.model("gemini-1.5-pro")

export const initializeGenkitTelemetry = async () => {
  await enableFirebaseTelemetry()
}
