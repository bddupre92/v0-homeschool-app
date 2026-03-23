import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"

export const maxDuration = 120

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AI service is not configured. Please set the GROQ_API_KEY environment variable." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
  const {
    message,
    conversationHistory,
    childProfile,
    familyBlueprint,
    stateRequirements,
    complianceData,
    intent,
  } = await req.json()

  const childContext = childProfile
    ? `CHILD PROFILE:
- Name: ${childProfile.name}
- Age: ${childProfile.age || "Not specified"}
- Grade: ${childProfile.grade || "Not specified"}
- Learning Style: ${childProfile.learningStyle || "Not specified"}
- Interests: ${childProfile.interests?.join(", ") || "Not specified"}
- Strengths: ${childProfile.strengths?.join(", ") || "Not specified"}
- Challenges: ${childProfile.challenges?.join(", ") || "Not specified"}`
    : ""

  const familyContext = familyBlueprint
    ? `FAMILY BLUEPRINT:
- Family: ${familyBlueprint.familyName || "Not specified"}
- Values: ${familyBlueprint.values?.join(", ") || "Not specified"}
- Philosophy: ${familyBlueprint.philosophy?.join(", ") || "Not specified"}
- Trait Pillars: ${familyBlueprint.traitPillars?.map((t: any) => t.name).join(", ") || "Not specified"}
- State: ${familyBlueprint.stateAbbreviation || "Not specified"}`
    : ""

  const stateContext = stateRequirements
    ? `STATE REQUIREMENTS (${stateRequirements.stateName || stateRequirements.stateAbbreviation}):
- Required Subjects: ${stateRequirements.subjectsRequired?.join(", ") || "Check state law"}
- Hours Per Year: ${stateRequirements.hoursPerYear || "Check state law"}
- Attendance Rules: ${stateRequirements.attendanceRules || "Check state law"}
- Assessment Requirements: ${stateRequirements.assessmentRequirements || "Check state law"}
- Record Keeping: ${stateRequirements.recordKeepingRequirements || "Check state law"}
- Filing Types: ${stateRequirements.filingTypes?.map((f: any) => `${f.filing_name} (${f.frequency})`).join("; ") || "Check state law"}`
    : ""

  const complianceContext = complianceData
    ? `ACTUAL COMPLIANCE STATUS (from the family's real records — use this data, do NOT guess or hallucinate):
- Total Hours Logged This Year: ${complianceData.totalHoursLogged || 0}
- Hours by Subject: ${complianceData.hoursBySubject?.length > 0
        ? complianceData.hoursBySubject.map((s: any) => `${s.subject}: ${s.total_hours}h (${s.session_count} sessions)`).join(", ")
        : "No hours logged yet"}
- Subjects with Logged Hours: ${complianceData.subjectsWithHours?.length > 0
        ? complianceData.subjectsWithHours.join(", ")
        : "None yet"}
- Filed Compliance Documents: ${complianceData.filings?.length > 0
        ? complianceData.filings.map((f: any) => `${f.filing_type}: ${f.status}${f.filed_date ? ` (filed ${f.filed_date})` : " (NOT filed)"}${f.due_date ? `, due ${f.due_date}` : ""}`).join("; ")
        : "No filings recorded yet — the parent has NOT filed anything"}

CRITICAL: When discussing compliance, ONLY report what the actual data shows. If filings array is empty, the parent has NOT filed anything. Do NOT say filings are "Done" unless the data explicitly shows them as completed.`
    : `ACTUAL COMPLIANCE STATUS: No compliance data available — the parent has not tracked any filings or hours yet.`

  // Intent-specific instructions
  let intentInstructions = ""
  if (intent === "year_curriculum") {
    intentInstructions = `The parent wants to generate a YEAR CURRICULUM for their child. You must:
1. First ask clarifying questions about standards alignment, structure preference, and subject emphasis (if not already discussed).
2. Then generate a complete year outline as a STRUCTURED JSON block embedded in your response.

When generating the curriculum, include this JSON block wrapped in \`\`\`json\`\`\` code fences:
{
  "type": "curriculum_plan",
  "schoolYear": "2026-27",
  "childName": "...",
  "grade": "...",
  "subjects": [
    {
      "name": "Subject Name (Standard)",
      "color": "#hex",
      "objectiveCount": number,
      "objectives": [
        { "title": "Objective title", "description": "Brief description" }
      ]
    }
  ],
  "tags": ["Common Core Aligned", "Charlotte Mason", etc.],
  "totalObjectives": number,
  "summary": "Brief AI summary for the parent"
}`
  } else if (intent === "compliance_check") {
    intentInstructions = `The parent wants to check their COMPLIANCE STATUS. Based on their state, explain:
1. What filings are required and their deadlines
2. What they may be missing
3. How to stay on track

Include a structured JSON block in \`\`\`json\`\`\` fences:
{
  "type": "compliance_check",
  "state": "XX",
  "items": [
    { "name": "Filing name", "status": "on_track | needs_attention | overdue", "detail": "..." }
  ],
  "summary": "Overall compliance summary"
}`
  } else if (intent === "learning_alignment") {
    intentInstructions = `The parent wants to check their child's LEARNING ALIGNMENT / PROGRESS. Provide:
1. Assessment of progress based on available data
2. Areas of strength and areas needing attention
3. Specific recommendations

Include a structured JSON block in \`\`\`json\`\`\` fences:
{
  "type": "progress_report",
  "childName": "...",
  "items": [
    { "subject": "Subject", "status": "on_track | needs_attention | ahead", "detail": "...", "percentComplete": number }
  ],
  "traitGrowth": [
    { "trait": "Trait name", "level": "Growing | Thriving | Emerging", "detail": "..." }
  ],
  "summary": "Overall learning alignment summary"
}`
  } else if (intent === "lesson_help") {
    intentInstructions = `The parent needs help with a specific LESSON or TOPIC for their child. You should:
1. Acknowledge the child's learning style and adapt your approach
2. Provide step-by-step guidance
3. Offer to generate a full lesson packet if needed

Include a structured JSON block in \`\`\`json\`\`\` fences when starting a tutoring/help session:
{
  "type": "lesson_suggestion",
  "childName": "...",
  "items": [
    { "label": "Action taken or suggested", "status": "done" }
  ]
}`
  }

  const systemPrompt = `You are the AtoZ Family AI Curriculum Advisor — a knowledgeable, warm, and practical homeschool planning assistant.

You help parents plan their children's education by:
- Generating personalized year-long curriculum plans with subjects and learning objectives
- Recommending lessons tailored to each child's learning style, interests, and grade level
- Tracking learning alignment and progress against family goals
- Ensuring state compliance with homeschool requirements
- Providing tutoring guidance adapted to the child's learning style

PERSONALITY:
- Warm and encouraging, like a knowledgeable homeschool mentor
- Reference the child BY NAME and use what you know about them
- Reference the family's values and philosophy naturally
- Be specific and actionable — avoid generic advice
- When you know the family uses Charlotte Mason, Montessori, etc., align your suggestions

${childContext}

${familyContext}

${stateContext}

${complianceContext}

${intentInstructions}

RESPONSE RULES:
1. Always be conversational — you're chatting, not writing an essay.
2. When you have enough context, generate structured data as JSON code blocks that the UI can parse into rich cards.
3. Keep text responses concise but helpful. Lead with the most important information.
4. If you don't have enough information to give good advice, ask targeted questions.
5. Always consider the child's profile when making recommendations.
6. For curriculum plans, generate comprehensive objectives organized by subject.
7. For compliance, be specific about the family's state requirements and deadlines.`

  // Build messages array from conversation history
  const messages = [
    ...(conversationHistory || []).map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: message },
  ]

  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages,
  })

  return result.toTextStreamResponse()
  } catch (error) {
    console.error("[curriculum-advisor] Error:", error)
    const message = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
