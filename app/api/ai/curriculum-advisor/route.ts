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
    allChildren,
    familyBlueprint,
    stateRequirements,
    complianceData,
    approvedObjectives,
    workflowMode,
    intent,
  } = await req.json()

  // Build context for the selected child
  const childContext = childProfile
    ? `SELECTED CHILD PROFILE:
- Name: ${childProfile.name}
- Age: ${childProfile.age || "Not specified"}
- Grade: ${childProfile.grade || "Not specified"}
- Learning Style: ${childProfile.learningStyle || "Not specified"}
- Interests: ${childProfile.interests?.join(", ") || "Not specified"}
- Strengths: ${childProfile.strengths?.join(", ") || "Not specified"}
- Challenges: ${childProfile.challenges?.join(", ") || "Not specified"}`
    : ""

  // Build context for ALL children in the family
  const allChildrenContext = allChildren?.length > 0
    ? `ALL CHILDREN IN FAMILY:
${allChildren.map((c: any) => `- ${c.name} (Age: ${c.age || "?"}, Grade: ${c.grade || "?"}, Style: ${c.learningStyle || "?"})`).join("\n")}

IMPORTANT: These are the REAL children in this family. Never reference children who are not in this list.`
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

  // Build context for approved objectives the AI can reference
  const objectivesContext = approvedObjectives?.length > 0
    ? `APPROVED CURRICULUM OBJECTIVES (approved by parent, not yet completed):
${approvedObjectives.map((o: any) => `- [${o.subject}] ${o.title}${o.lesson_source ? ` (lesson source: ${o.lesson_source})` : ""}`).join("\n")}

You can reference these objectives when building lessons or scheduling. The parent has already approved these learning goals.`
    : ""

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
    intentInstructions = `The parent wants to check their COMPLIANCE STATUS. Based on their state and ACTUAL compliance data, explain:
1. What filings are required and their deadlines
2. What they have actually completed vs what is missing (use ACTUAL data, not assumptions)
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
  } else if (intent === "build_lessons") {
    intentInstructions = `The parent wants to BUILD LESSON PLANS. You should:
1. Ask which subject/topics they want lessons for, OR reference approved objectives if available.
2. For each lesson, generate an overview with title, duration, description, and materials.
3. The parent will choose per-lesson whether to generate a full 7-section packet (worksheets, quizzes, experiments, materials lists) or keep it as a light outline.

When you have enough context, include EXACTLY ONE structured JSON block in \`\`\`json\`\`\` fences with ALL lessons inside the "lessons" array:
{
  "type": "lesson_build",
  "childName": "Child Name",
  "subject": "Subject Name",
  "lessons": [
    {
      "objectiveId": "optional-id",
      "objectiveTitle": "The learning objective this covers",
      "lessonTitle": "Engaging lesson title",
      "duration": 45,
      "description": "What the student will learn and do in this lesson",
      "materials": ["Material 1", "Material 2"],
      "packetDepth": "light"
    }
  ],
  "summary": "Brief summary of the lesson set"
}

Generate 3-5 lessons per subject unless the parent specifies otherwise. Make lesson titles engaging and aligned with the child's interests and learning style.

CRITICAL RULES:
- Output exactly ONE \`\`\`json block containing ONE object with a "lessons" array. Do NOT output multiple separate JSON blocks — put ALL lessons inside the single "lessons" array.
- You MUST always provide a non-empty "lessonTitle" and "objectiveTitle" for EVERY lesson in the array. Never leave these fields blank, null, or empty.
- Each lessonTitle should be specific and engaging (e.g., "Butterfly Life Cycle Adventure" not just "Science Lesson").
- If building for multiple children, use "childName": "Asher & Zuri" and put all lessons in one array.`
  } else if (intent === "schedule_lessons") {
    // Calculate next Monday for default weekStart
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7
    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + daysUntilMonday)
    const defaultWeekStart = nextMonday.toISOString().split("T")[0]

    intentInstructions = `The parent wants to SCHEDULE LESSONS onto their planner. You should:
1. Ask which week they want to schedule for.
2. Ask about preferred days/times per subject, or check if they have a pattern they like.
3. Propose a weekly schedule based on their preferences.

When you have enough context, include EXACTLY ONE structured JSON block in \`\`\`json\`\`\` fences:
{
  "type": "schedule_proposal",
  "childName": "Child Name",
  "weekStart": "${defaultWeekStart}",
  "lessons": [
    {
      "title": "Lesson title",
      "subject": "Subject",
      "day": "Monday",
      "time": "9:00 AM",
      "duration": 45,
      "objectiveId": "optional-id",
      "lessonPacketId": "optional-id"
    }
  ],
  "summary": "Schedule overview"
}

CRITICAL: "weekStart" MUST be a valid ISO date string (YYYY-MM-DD format) representing the Monday of the target week. If the parent doesn't specify a week, use "${defaultWeekStart}" as the default. NEVER omit this field.

Distribute lessons evenly across the week. Suggest reasonable times (morning for focused subjects, afternoon for hands-on). Consider the child's age when setting duration.`
  } else if (intent === "build_and_schedule") {
    intentInstructions = `The parent wants the FULL WORKFLOW: build lesson plans AND schedule them. This supports building up to a full semester of lessons. You should:
1. Ask about subjects, grade, and scope (how many weeks/months of lessons they want).
2. Build lessons in batches of 4-6 at a time. Generate engaging, specific lesson titles — NEVER leave lessonTitle empty.
3. After the parent approves a batch, offer to either:
   a) Schedule the approved batch onto their planner (generate a schedule_proposal card)
   b) Continue building more lessons for the next batch/week
4. Repeat steps 2-3 until the requested scope is complete.

IMPORTANT: When building semester-scale plans, organize lessons by week. Tell the parent which week number you're building (e.g., "Week 1 of 18").

CRITICAL: Output exactly ONE \`\`\`json block per response. Put ALL lessons inside a single "lessons" array — do NOT output separate JSON blocks for each lesson. Use this exact format:
{
  "type": "lesson_build",
  "childName": "Child Name",
  "subject": "Subject",
  "lessons": [
    { "lessonTitle": "Title 1", "objectiveTitle": "Objective 1", "duration": 45, "description": "...", "materials": ["..."], "packetDepth": "light" },
    { "lessonTitle": "Title 2", "objectiveTitle": "Objective 2", "duration": 30, "description": "...", "materials": ["..."], "packetDepth": "light" }
  ],
  "summary": "Week X of Y — topic overview"
}

Start by asking about subjects/objectives and the desired scope (e.g., "a semester" = ~18 weeks, "a quarter" = ~9 weeks). Generate a lesson_build card first.
After the parent approves, generate a schedule_proposal card for the approved lessons, then offer to build the next batch.

For building steps, use the lesson_build JSON format. For scheduling steps, use the schedule_proposal JSON format.`
  }

  const systemPrompt = `You are the AtoZ Family AI Curriculum Advisor — a knowledgeable, warm, and practical homeschool planning assistant.

You help parents plan their children's education by:
- Generating personalized year-long curriculum plans with subjects and learning objectives
- Building detailed lesson plans with worksheets, quizzes, experiments, and materials
- Scheduling lessons onto the family's weekly planner
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

${allChildrenContext}

${familyContext}

${stateContext}

${complianceContext}

${objectivesContext}

${intentInstructions}

RESPONSE RULES:
1. Always be conversational — you're chatting, not writing an essay.
2. When you have enough context, generate structured data as JSON code blocks that the UI can parse into rich cards.
3. Keep text responses concise but helpful. Lead with the most important information.
4. If you don't have enough information to give good advice, ask targeted questions.
5. Always consider the child's profile when making recommendations.
6. For curriculum plans, generate comprehensive objectives organized by subject.
7. For compliance, be specific about the family's state requirements and deadlines.
8. NEVER reference children who are not in the family. Only use names from the ALL CHILDREN list.
9. NEVER assume or hallucinate data about filings, hours, or progress. Only state what the actual records show.
10. CRITICAL JSON FORMATTING: When generating structured data cards, you MUST:
    - Output the JSON directly inside \`\`\`json code fences — do NOT describe, announce, or narrate it
    - Do NOT say "here is the JSON" or "here's a JSON block" — just output the fenced JSON block after your conversational text
    - The JSON must be valid: no trailing commas, no single quotes, no JS comments
    - Do NOT wrap string values across multiple lines inside the JSON
    - Ensure all arrays and objects are properly closed with matching brackets
    - The "type" field must exactly match one of: curriculum_plan, compliance_check, progress_report, lesson_suggestion, lesson_build, schedule_proposal`

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
