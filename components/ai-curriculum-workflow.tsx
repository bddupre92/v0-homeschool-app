"use client"

import { useState } from "react"
import AIResearchPhase from "./ai-research-phase"
import AICurriculumGenerationPhase from "./ai-curriculum-generation-phase"
import type { ResearchResult } from "@/lib/types"

export default function AICurriculumWorkflow() {
  const [step, setStep] = useState<"research" | "generate">("research")
  const [researchQuery, setResearchQuery] = useState<{ subject: string; grade: string; topics: string }>({
    subject: "",
    grade: "",
    topics: "",
  })
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([])

  const handleResearchComplete = (
    query: { subject: string; grade: string; topics: string },
    results: ResearchResult[],
  ) => {
    setResearchQuery(query)
    setResearchResults(results)
    setStep("generate")
  }

  const handleStartOver = () => {
    setStep("research")
    setResearchQuery({ subject: "", grade: "", topics: "" })
    setResearchResults([])
  }

  return (
    <div className="p-4 md:p-6">
      {step === "research" && <AIResearchPhase onResearchComplete={handleResearchComplete} />}
      {step === "generate" && (
        <AICurriculumGenerationPhase
          researchQuery={researchQuery}
          researchResults={researchResults}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  )
}
