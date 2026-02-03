"use client"

import { app } from "@/lib/firebase"
import { getAI, getGenerativeModel, type GenerativeModel } from "firebase/ai"

let model: GenerativeModel | null = null

export const isFirebaseAIAvailable = () => Boolean(app) && typeof window !== "undefined"

export const getFirebaseAIModel = () => {
  if (!isFirebaseAIAvailable() || !app) {
    return null
  }

  if (!model) {
    const ai = getAI(app)
    model = getGenerativeModel(ai, { model: "gemini-1.5-pro" })
  }

  return model
}
