"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, Sparkles, Loader2, Trash2, BookOpen, CalendarDays, Layers, ClipboardCheck, BarChart3, MessageCircle, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type {
  AdvisorMessage,
  StructuredCard,
  LessonBuildCard,
  ChildProfile,
  FamilyBlueprintData,
  AdvisorIntent,
  AdvisorWorkflowMode,
  WorkflowPlan,
  WorkflowTask,
} from "@/lib/advisor-types"
import { CurriculumPlanCardUI } from "@/components/advisor-cards/curriculum-plan-card"
import { ComplianceCheckCardUI } from "@/components/advisor-cards/compliance-check-card"
import { ProgressReportCardUI } from "@/components/advisor-cards/progress-report-card"
import { LessonSuggestionCardUI } from "@/components/advisor-cards/lesson-suggestion-card"
import { LessonBuildCardUI } from "@/components/advisor-cards/lesson-build-card"
import { ScheduleProposalCardUI } from "@/components/advisor-cards/schedule-proposal-card"
import { WorkflowProgressCard } from "@/components/advisor-cards/workflow-progress-card"
import { WorkflowSidebar } from "@/components/advisor-cards/workflow-sidebar"
import LessonPacketViewer from "@/components/lesson-packet-viewer"
import { savePacket } from "@/app/actions/packet-actions"
import type { LessonPacket } from "@/lib/types"

interface ComplianceData {
  totalHoursLogged: number
  hoursBySubject: { subject: string; total_hours: number; session_count: number }[]
  filings: { filing_type: string; status: string; due_date?: string; filed_date?: string; notes?: string }[]
  subjectsWithHours: string[]
}

interface AIAdvisorChatProps {
  children: ChildProfile[]
  familyBlueprint: FamilyBlueprintData | null
  stateRequirements: any | null
  stateFilingTypes: any[]
  complianceData?: ComplianceData | null
  approvedObjectives?: any[]
  onSaveRecommendation?: (data: any) => Promise<void>
  onScheduleLessons?: (lessons: any[]) => Promise<void>
  initialMessages?: AdvisorMessage[]
}

const KNOWN_CARD_TYPES = [
  "curriculum_plan", "compliance_check", "progress_report",
  "lesson_suggestion", "lesson_build", "schedule_proposal",
]

function cleanJsonString(raw: string): string {
  return raw
    .replace(/,\s*([}\]])/g, "$1")       // trailing commas
    .replace(/\/\/[^\n]*/g, "")           // JS-style comments
    .replace(/[\x00-\x1F\x7F]/g, (c) =>  // control chars (except newline/tab)
      c === "\n" || c === "\t" ? c : " "
    )
}

/**
 * Normalize AI-generated card data to match expected field names.
 * LLMs (especially Llama) often return variant field names like `title` instead of `lessonTitle`,
 * snake_case instead of camelCase, or omit optional arrays.
 */
function normalizeCard(parsed: any): any {
  if (!parsed || typeof parsed !== "object") return parsed

  if (parsed.type === "lesson_build") {
    // Normalize top-level fields
    parsed.childName = parsed.childName || parsed.child_name || parsed.studentName || parsed.student_name ||
      (Array.isArray(parsed.studentNames) ? parsed.studentNames.join(" & ") : "") || ""
    parsed.subject = parsed.subject || parsed.subjectName || parsed.subject_name || ""
    parsed.summary = parsed.summary || ""

    // Normalize lessons array — handle many possible AI output formats
    if (!Array.isArray(parsed.lessons)) {
      parsed.lessons = parsed.lesson_plans || parsed.lessonPlans || parsed.lesson_list || []
    }

    // Handle flat lesson format: AI returned a single lesson as top-level fields instead of a lessons array
    if (parsed.lessons.length === 0 && (parsed.lessonTitle || parsed.lesson_title || parsed.objectiveTitle)) {
      parsed.lessons = [parsed]
    }

    // Handle object-of-lessons: AI returned { "lesson_1": {...}, "lesson_2": {...} } instead of an array
    if (parsed.lessons.length === 0) {
      const possibleLessons = Object.keys(parsed)
        .filter((k) => k.match(/^lesson[_\s]?\d/i) || k.match(/^week[_\s]?\d/i))
        .map((k) => parsed[k])
        .filter((v) => v && typeof v === "object" && !Array.isArray(v))
      if (possibleLessons.length > 0) {
        parsed.lessons = possibleLessons
      }
    }

    // Safely normalize materials — always produce a string array for maximum compatibility
    const safeMaterials = (mats: any): string[] => {
      if (!Array.isArray(mats)) return []
      return mats.map((m: any) => {
        if (typeof m === "string") return m
        if (m && typeof m === "object") {
          const name = m.name || m.item || m.title || ""
          const typeHint = m.type && m.type !== "supply" ? ` (${m.type})` : ""
          return name + typeHint
        }
        return String(m)
      }).filter(Boolean)
    }

    parsed.lessons = parsed.lessons.map((l: any) => {
      try {
        return {
          objectiveId: l.objectiveId || l.objective_id || undefined,
          objectiveTitle: l.objectiveTitle || l.objective_title || l.objective || l.topic || "",
          lessonTitle: l.lessonTitle || l.lesson_title || l.title || l.name || l.lesson_name || "",
          duration: l.duration || l.time || l.minutes || 0,
          description: l.description || l.summary || l.overview ||
            (Array.isArray(l.learningObjectives) ? l.learningObjectives.join("; ") : "") ||
            (Array.isArray(l.procedure) ? l.procedure.join("; ") : "") || "",
          materials: safeMaterials(l.materials),
          packetDepth: l.packetDepth || l.packet_depth || "light",
        }
      } catch {
        console.warn("[normalizeCard] Failed to normalize lesson:", l)
        return {
          objectiveId: undefined,
          objectiveTitle: String(l?.objectiveTitle || l?.objective || ""),
          lessonTitle: String(l?.lessonTitle || l?.title || "Untitled Lesson"),
          duration: 0,
          description: String(l?.description || ""),
          materials: [],
          packetDepth: "light" as const,
        }
      }
    }).filter((l: any) => l.lessonTitle || l.objectiveTitle)

    // Normalize card-level references (with safety)
    try {
      const rawRefs = parsed.references || parsed.sources || parsed.citations || []
      parsed.references = (Array.isArray(rawRefs) ? rawRefs : []).map((r: any) => ({
        id: r.id || r.number || 0,
        title: r.title || r.name || "",
        url: r.url || undefined,
        author: r.author || undefined,
        type: r.type || "article",
        snippet: r.snippet || r.description || "",
      }))
    } catch {
      parsed.references = []
    }
  }

  if (parsed.type === "schedule_proposal") {
    // Normalize childName
    parsed.childName = parsed.childName || parsed.child_name || parsed.studentName ||
      (Array.isArray(parsed.studentNames) ? parsed.studentNames.join(" & ") : "") || ""

    // Default weekStart to next Monday if missing
    if (!parsed.weekStart || !parsed.week_start) {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7
      const nextMonday = new Date(now)
      nextMonday.setDate(now.getDate() + daysUntilMonday)
      parsed.weekStart = parsed.weekStart || parsed.week_start || nextMonday.toISOString().split("T")[0]
    } else {
      parsed.weekStart = parsed.weekStart || parsed.week_start
    }

    parsed.lessons = (parsed.lessons || parsed.schedule || parsed.schedule_items || parsed.scheduledLessons || []).map((l: any) => ({
      title: l.title || l.lessonTitle || l.lesson_title || l.name || "",
      subject: l.subject || l.subjectName || "",
      day: l.day || l.dayOfWeek || l.day_of_week || "",
      time: l.time || l.startTime || l.start_time || "9:00 AM",
      duration: l.duration || l.minutes || 45,
      objectiveId: l.objectiveId || l.objective_id || undefined,
      lessonPacketId: l.lessonPacketId || l.lesson_packet_id || undefined,
    }))
  }

  if (parsed.type === "compliance_check") {
    parsed.items = (parsed.items || parsed.requirements || []).map((i: any) => ({
      name: i.name || i.title || i.requirement || "",
      status: i.status || "needs_attention",
      detail: i.detail || i.details || i.description || "",
    }))
  }

  if (parsed.type === "progress_report") {
    parsed.items = (parsed.items || parsed.subjects || []).map((i: any) => ({
      subject: i.subject || i.name || "",
      status: i.status || "on_track",
      detail: i.detail || i.details || i.description || "",
      percentComplete: i.percentComplete || i.percent_complete || i.percent || 0,
    }))
  }

  if (parsed.type === "curriculum_plan") {
    parsed.subjects = (parsed.subjects || []).map((s: any) => ({
      name: s.name || s.subject || "",
      color: s.color || "gray",
      objectiveCount: s.objectiveCount || s.objective_count || (s.objectives || []).length || 0,
      objectives: (s.objectives || []).map((o: any) => ({
        title: o.title || o.name || "",
        description: o.description || "",
      })),
    }))
    parsed.tags = parsed.tags || []
    parsed.totalObjectives = parsed.totalObjectives || parsed.total_objectives ||
      parsed.subjects.reduce((sum: number, s: any) => sum + (s.objectiveCount || 0), 0)
  }

  if (parsed.type === "lesson_suggestion") {
    parsed.items = (parsed.items || parsed.suggestions || []).map((i: any) => ({
      label: i.label || i.title || i.name || i.suggestion || "",
      status: i.status || "pending",
    }))
  }

  return parsed
}

function tryParseJson(raw: string): StructuredCard | null {
  try {
    const cleaned = cleanJsonString(raw.trim())
    const parsed = JSON.parse(cleaned)
    if (parsed && typeof parsed === "object" && KNOWN_CARD_TYPES.includes(parsed.type)) {
      return normalizeCard(parsed) as StructuredCard
    }
    return null
  } catch {
    return null
  }
}

/**
 * Merge multiple lesson_build cards (from multiple JSON blocks) into one card with a combined lessons array.
 */
function mergeLessonBuildCards(cards: any[]): any {
  const first = cards[0]
  const allLessons = cards.flatMap((c) => c.lessons || [])
  return {
    ...first,
    lessons: allLessons,
    summary: first.summary || `${allLessons.length} lessons across ${cards.length} weeks`,
  }
}

function parseStructuredData(text: string): { cleanText: string; card: StructuredCard | null } {
  // Strategy 1: Find ALL ```json...``` code fences (AI often returns multiple blocks)
  const fenceRegex = /```(?:json|JSON|Json)?\s*\n?([\s\S]*?)```/g
  const allFenceMatches: string[] = []
  let match
  while ((match = fenceRegex.exec(text)) !== null) {
    allFenceMatches.push(match[1])
  }

  if (allFenceMatches.length > 0) {
    // Parse all JSON blocks
    const parsedCards = allFenceMatches
      .map((raw) => tryParseJson(raw))
      .filter(Boolean)

    if (parsedCards.length > 0) {
      const cleanText = text.replace(/```(?:json|JSON|Json)?\s*\n?[\s\S]*?```/g, "").trim()

      // If multiple lesson_build cards, merge them into one
      if (parsedCards.length > 1 && parsedCards.every((c: any) => c!.type === "lesson_build")) {
        const merged = mergeLessonBuildCards(parsedCards)
        return { cleanText, card: merged as StructuredCard }
      }

      // Otherwise return the first valid card
      return { cleanText, card: parsedCards[0]! }
    }
  }

  // Strategy 2: Bare JSON extraction — find outermost { ... } containing a "type" field
  const jsonStart = text.indexOf("{")
  const jsonEnd = text.lastIndexOf("}")
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    const candidate = text.slice(jsonStart, jsonEnd + 1)
    if (candidate.includes('"type"')) {
      const card = tryParseJson(candidate)
      if (card) {
        const cleanText = (text.slice(0, jsonStart) + text.slice(jsonEnd + 1)).trim()
        return { cleanText, card }
      }
    }
  }

  // No valid card found
  if (text.includes('"type"') && (text.includes("{") || text.includes("```"))) {
    console.warn("[parseStructuredData] Text appears to contain card JSON but failed to parse:", text.slice(0, 300))
  }
  return { cleanText: text, card: null }
}

function StructuredCardRenderer({
  card,
  onSave,
  onSchedule,
  onGeneratePacket,
  onScheduleRequest,
  onContinueBuilding,
}: {
  card: StructuredCard
  onSave?: (data: any) => void
  onSchedule?: (lessons: any[]) => void
  onGeneratePacket?: (lesson: any, context: { childName: string; subject: string }) => void
  onScheduleRequest?: (card: LessonBuildCard) => void
  onContinueBuilding?: (card: LessonBuildCard) => void
}) {
  switch (card.type) {
    case "curriculum_plan":
      return <CurriculumPlanCardUI card={card} onSave={onSave} />
    case "compliance_check":
      return <ComplianceCheckCardUI card={card} />
    case "progress_report":
      return <ProgressReportCardUI card={card} />
    case "lesson_suggestion":
      return <LessonSuggestionCardUI card={card} />
    case "lesson_build":
      return <LessonBuildCardUI card={card} onSave={onSave} onGeneratePacket={onGeneratePacket} onScheduleRequest={onScheduleRequest} onContinueBuilding={onContinueBuilding} />
    case "schedule_proposal":
      return <ScheduleProposalCardUI card={card} onSchedule={onSchedule} />
    default:
      return null
  }
}

const WORKFLOW_MODES = [
  {
    id: "build_lessons" as AdvisorWorkflowMode,
    label: "Build Lesson Plans",
    description: "Generate lesson packets with worksheets, quizzes, experiments, and materials lists",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
  },
  {
    id: "schedule_lessons" as AdvisorWorkflowMode,
    label: "Schedule Lessons",
    description: "Place approved lessons onto your weekly planner calendar",
    icon: CalendarDays,
    color: "text-green-500",
    bgColor: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20",
  },
  {
    id: "build_and_schedule" as AdvisorWorkflowMode,
    label: "Build & Schedule",
    description: "Build lessons, review them, then auto-schedule to your planner",
    icon: Layers,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
  },
  {
    id: "chat" as AdvisorWorkflowMode,
    label: "Plan My Year",
    description: "Generate a full year curriculum for your child",
    icon: ClipboardCheck,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20",
  },
]

export default function AIAdvisorChat({
  children,
  familyBlueprint,
  stateRequirements,
  stateFilingTypes,
  complianceData,
  approvedObjectives,
  onSaveRecommendation,
  onScheduleLessons,
  initialMessages,
}: AIAdvisorChatProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>(
    initialMessages?.length
      ? initialMessages
      : [
          {
            id: "welcome",
            role: "assistant",
            content: children.length > 0
              ? `Hi! I'm your AtoZ Family curriculum advisor. I see you have ${children.map(c => c.name).join(" and ")} — choose a workflow below or just ask me anything!`
              : "Hi! I'm your AtoZ Family curriculum advisor. To give you the best recommendations, make sure to set up your family blueprint and add your children's profiles in the Family page. How can I help today?",
            structuredData: null,
            messageType: "text",
          },
        ]
  )
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(children[0] || null)
  const [workflowMode, setWorkflowMode] = useState<AdvisorWorkflowMode | null>(null)
  const [workflowPlan, setWorkflowPlan] = useState<WorkflowPlan | null>(null)
  const [showWorkflowSidebar, setShowWorkflowSidebar] = useState(false)
  const lastProcessedMsgIdRef = useRef<string | null>(null)
  const workflowInitializedRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const detectIntent = (text: string): AdvisorIntent => {
    // If workflow mode is active, use it as the intent
    if (workflowMode === "build_lessons") return "build_lessons"
    if (workflowMode === "schedule_lessons") return "schedule_lessons"
    if (workflowMode === "build_and_schedule") return "build_and_schedule"

    const lower = text.toLowerCase()
    if (lower.includes("year curriculum") || lower.includes("year plan") || lower.includes("annual plan") || lower.includes("curriculum for"))
      return "year_curriculum"
    if (lower.includes("compliance") || lower.includes("filing") || lower.includes("requirement") || lower.includes("state law"))
      return "compliance_check"
    if (lower.includes("progress") || lower.includes("alignment") || lower.includes("on track") || lower.includes("how is"))
      return "learning_alignment"
    if (lower.includes("build lesson") || lower.includes("create lesson") || lower.includes("lesson packet") || lower.includes("generate lesson"))
      return "build_lessons"
    if (lower.includes("schedule") || lower.includes("planner") || lower.includes("calendar"))
      return "schedule_lessons"
    if (lower.includes("stuck") || lower.includes("help with") || lower.includes("lesson") || lower.includes("tutor"))
      return "lesson_help"
    return "general"
  }

  const selectWorkflowMode = (mode: AdvisorWorkflowMode) => {
    setWorkflowMode(mode)
    const childName = selectedChild?.name || "my child"
    const childNames = children.map(c => c.name).join(" and ")

    const modeMessages: Record<AdvisorWorkflowMode, string> = {
      build_lessons: `I want to build lesson plans for ${childNames}. What subjects and objectives should we start with?`,
      schedule_lessons: `I'd like to schedule lessons for ${childNames} on my planner. Let's set up the weekly schedule.`,
      build_and_schedule: `Let's build lesson plans for ${childNames} and then schedule them on my planner.`,
      chat: `I need to create a year curriculum for ${childName}.`,
    }

    sendMessage(modeMessages[mode])
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isStreaming) return

    const userMessage: AdvisorMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsStreaming(true)

    const assistantMessage: AdvisorMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const intent = detectIntent(messageText)
      // Only send last 6 messages as history to save tokens (sliding window)
      const recentMessages = messages
        .filter((m) => m.id !== "welcome" && m.content)
        .slice(-6)
      const conversationHistory = recentMessages
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await fetch("/api/ai/curriculum-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationHistory,
          childProfile: selectedChild,
          allChildren: children,
          familyBlueprint,
          stateRequirements: stateRequirements
            ? { ...stateRequirements, filingTypes: stateFilingTypes }
            : null,
          complianceData: complianceData || null,
          approvedObjectives: approvedObjectives || [],
          workflowMode,
          intent,
        }),
      })

      if (!response.ok) {
        let errorMessage = "Sorry, I ran into an issue. Please try again."
        try {
          const errorData = await response.json()
          if (response.status === 503) {
            errorMessage = "The AI service is temporarily unavailable. Please check that the API key is configured."
          } else if (response.status === 429) {
            errorMessage = "Too many requests. Please wait a moment and try again."
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // response wasn't JSON, use default
        }
        throw new Error(errorMessage)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ""

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            fullText += chunk
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: fullText } : m
              )
            )
          }
        } catch (streamError) {
          console.error("[advisor] Stream error:", streamError)
          if (!fullText.trim()) {
            fullText = "Sorry, the AI service had a connection issue. Please try again."
          }
        }
      }

      // Check for Groq error responses embedded in stream (they start with error markers)
      if (fullText.startsWith('{"error"') || fullText.startsWith('{"message"')) {
        try {
          const errData = JSON.parse(fullText)
          console.error("[advisor] Groq error in stream:", errData)
          fullText = `AI service error: ${errData.error?.message || errData.message || "Unknown error"}. Please try again.`
        } catch { /* not JSON, continue */ }
      }

      if (!fullText.trim()) {
        console.warn("[advisor] AI returned empty response")
      }
      const { cleanText, card } = parseStructuredData(fullText)
      const displayText = cleanText || fullText || "Sorry, I didn't get a response. The request may have been too large. Please try a simpler question or clear the chat and try again."
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: displayText, structuredData: card }
            : m
        )
      )
    } catch (error) {
      console.error("Advisor error:", error)
      const errorText = error instanceof Error ? error.message : "Sorry, I ran into an issue. Please try again."
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: errorText }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleGeneratePacket = async (
    lesson: { objectiveTitle: string; lessonTitle: string; description: string; materials: string[] },
    context: { childName: string; subject: string }
  ) => {
    const loadingMsgId = crypto.randomUUID()
    const loadingMsg: AdvisorMessage = {
      id: loadingMsgId,
      role: "assistant",
      content: "Generating full lesson packet...",
    }
    setMessages((prev) => [...prev, loadingMsg])

    try {
      const response = await fetch("/api/ai/generate-lesson-packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: context.childName,
          grade: selectedChild?.grade || "",
          subject: context.subject,
          topic: lesson.lessonTitle,
          learningStyle: selectedChild?.learningStyle || "",
          interests: selectedChild?.interests?.join(", ") || "",
          location: familyBlueprint?.stateAbbreviation || "",
          familyValues: familyBlueprint?.values?.join(", ") || "",
          philosophy: familyBlueprint?.philosophy?.join(", ") || "",
          strengths: selectedChild?.strengths?.join(", ") || "",
        }),
      })

      if (!response.ok) throw new Error("Failed to generate lesson packet")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullResponse += decoder.decode(value, { stream: true })
          const chars = fullResponse.length
          let progress = "Preparing..."
          if (chars < 2000) progress = "Generating student lesson..."
          else if (chars < 5000) progress = "Creating worksheet..."
          else if (chars < 8000) progress = "Writing teacher guide..."
          else if (chars < 11000) progress = "Building materials & experiment..."
          else progress = "Adding exploration & extensions..."
          setMessages((prev) =>
            prev.map((m) => (m.id === loadingMsgId ? { ...m, content: progress } : m))
          )
        }
      }

      // Parse JSON using proven "find outermost braces" approach
      let jsonStr = fullResponse.trim()
      const jsonStart = jsonStr.indexOf("{")
      const jsonEnd = jsonStr.lastIndexOf("}")
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1)
      }
      const packetData = JSON.parse(jsonStr)

      const packet: LessonPacket = {
        id: crypto.randomUUID(),
        title: packetData.studentLesson?.title || lesson.lessonTitle,
        subject: context.subject,
        grade: selectedChild?.grade || "",
        childName: context.childName,
        topic: lesson.lessonTitle,
        createdAt: new Date().toISOString(),
        studentLesson: packetData.studentLesson,
        worksheet: packetData.worksheet,
        teacherGuide: packetData.teacherGuide,
        materialsList: packetData.materialsList,
        experiment: packetData.experiment,
        localExploration: packetData.localExploration,
        extensions: packetData.extensions,
      }

      // Auto-save to database
      let savedId: string | null = null
      try {
        const saveResult = await savePacket(packet, {
          learningStyle: selectedChild?.learningStyle || "",
          interests: selectedChild?.interests?.join(", ") || "",
        })
        if (saveResult.success && saveResult.packet) {
          savedId = saveResult.packet.id
        }
      } catch {
        // Save is not critical — packet still shows inline
      }

      // Replace loading message with the full packet viewer
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsgId
            ? {
                ...m,
                content: `Here's the full lesson packet for "${lesson.lessonTitle}":`,
                lessonPacket: packet,
                savedPacketId: savedId,
              }
            : m
        )
      )
    } catch (error) {
      console.error("Error generating packet:", error)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsgId
            ? { ...m, content: `Failed to generate packet for "${lesson.lessonTitle}". Please try again.` }
            : m
        )
      )
    }
  }

  const handleContinueBuilding = (buildCard: LessonBuildCard) => {
    if (isStreaming) return
    const childName = buildCard.childName || selectedChild?.name || "my child"
    const subject = buildCard.subject || "the same subjects"
    sendMessage(
      `Great, those lessons for ${childName} are saved! Please build the next batch of ${subject} lessons — continue where we left off.`
    )
  }

  const handleScheduleRequest = (buildCard: LessonBuildCard) => {
    if (isStreaming) return

    // Generate schedule directly from lesson data — no AI call needed
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const times = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"]
    const childName = buildCard.childName || selectedChild?.name || "my child"
    const subject = buildCard.subject || "Lessons"

    // Calculate next Monday
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7
    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + daysUntilMonday)
    const weekStart = nextMonday.toISOString().split("T")[0]

    // Distribute lessons across the week
    const scheduledLessons = (buildCard.lessons || []).map((lesson, i) => ({
      title: lesson.lessonTitle || lesson.objectiveTitle || "Untitled",
      subject: subject,
      day: days[i % days.length],
      time: times[i % times.length],
      duration: lesson.duration || 45,
    }))

    const scheduleCard: StructuredCard = {
      type: "schedule_proposal",
      childName,
      weekStart,
      lessons: scheduledLessons,
      summary: `${scheduledLessons.length} ${subject} lessons for ${childName}, week of ${weekStart}`,
    }

    // Add as a new assistant message with the schedule card
    const scheduleMsg: AdvisorMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Here's a proposed schedule for ${childName}'s ${subject} lessons this week. You can adjust the times and confirm to add them to your planner.`,
      structuredData: scheduleCard,
    }
    setMessages((prev) => [...prev, scheduleMsg])
    setWorkflowMode("schedule_lessons")
  }

  const clearChat = () => {
    setWorkflowMode(null)
    setWorkflowPlan(null)
    setShowWorkflowSidebar(false)
    lastProcessedMsgIdRef.current = null
    workflowInitializedRef.current = false
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat cleared! Choose a workflow or ask me anything.",
        structuredData: null,
        messageType: "text",
      },
    ])
  }

  // ─── Multi-Child Workflow Management ─────────────────────────────────────

  const detectMultiChildIntent = useCallback((text: string): boolean => {
    const lower = text.toLowerCase()
    const mentionedChildren = children.filter((c) =>
      lower.includes(c.name.toLowerCase())
    )
    const hasMultiKeywords = lower.includes("all my kids") || lower.includes("both") ||
      lower.includes("all children") || lower.includes("everyone") || lower.includes("each child")
    return mentionedChildren.length > 1 || (hasMultiKeywords && children.length > 1)
  }, [children])

  const initializeWorkflowPlan = useCallback((subjects: string[]) => {
    const tasks: WorkflowTask[] = []
    for (const child of children) {
      for (const subject of subjects) {
        tasks.push({
          id: `${child.id}-${subject}`,
          childName: child.name,
          subject,
          status: "pending",
        })
      }
    }
    if (tasks.length > 0) {
      tasks[0].status = "building"
    }
    const plan: WorkflowPlan = {
      id: crypto.randomUUID(),
      title: subjects.length === 1 ? `${subjects[0]} for All Children` : "Multi-Subject Build",
      tasks,
      currentTaskIndex: 0,
      createdAt: new Date().toISOString(),
    }
    setWorkflowPlan(plan)
    setShowWorkflowSidebar(true)
    return plan
  }, [children])

  const updateWorkflowTask = useCallback((taskId: string, updates: Partial<WorkflowTask>) => {
    setWorkflowPlan((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
      }
    })
  }, [])

  const handleWorkflowApprove = useCallback((taskId: string) => {
    updateWorkflowTask(taskId, { status: "approved" })
    // Find the next pending task and start building
    setWorkflowPlan((prev) => {
      if (!prev) return prev
      const nextIdx = prev.tasks.findIndex((t) => t.status === "pending")
      if (nextIdx !== -1) {
        const nextTask = prev.tasks[nextIdx]
        const updatedTasks = prev.tasks.map((t, i) =>
          i === nextIdx ? { ...t, status: "building" as const } : t
        )
        // Auto-send message to build next child
        setTimeout(() => {
          sendMessage(
            `Great, ${taskId.split("-")[0]}'s lessons are approved! Now please build ${nextTask.subject} lessons for ${nextTask.childName}.`
          )
        }, 300)
        return { ...prev, tasks: updatedTasks, currentTaskIndex: nextIdx }
      }
      return prev
    })
  }, [updateWorkflowTask])

  const handleWorkflowSkip = useCallback((taskId: string) => {
    updateWorkflowTask(taskId, { status: "skipped" })
  }, [updateWorkflowTask])

  const handleWorkflowSchedule = useCallback((taskId: string) => {
    updateWorkflowTask(taskId, { status: "scheduled" })
  }, [updateWorkflowTask])

  // Update workflow plan when lesson_build cards arrive (only process each message once)
  useEffect(() => {
    if (!workflowPlan) return
    const latestMsg = messages[messages.length - 1]
    if (!latestMsg || latestMsg.id === lastProcessedMsgIdRef.current) return
    if (latestMsg.structuredData?.type !== "lesson_build") return

    lastProcessedMsgIdRef.current = latestMsg.id
    const card = latestMsg.structuredData as LessonBuildCard
    const childName = card.childName
    const subject = card.subject

    setWorkflowPlan((prev) => {
      if (!prev) return prev
      const hasMatch = prev.tasks.some(
        (t) =>
          t.childName.toLowerCase() === childName?.toLowerCase() &&
          t.subject.toLowerCase() === subject?.toLowerCase() &&
          t.status === "building"
      )
      if (!hasMatch) return prev
      return {
        ...prev,
        tasks: prev.tasks.map((t) => {
          if (
            t.childName.toLowerCase() === childName?.toLowerCase() &&
            t.subject.toLowerCase() === subject?.toLowerCase() &&
            t.status === "building"
          ) {
            return { ...t, status: "awaiting_approval" as const, lessonCount: card.lessons?.length || 0 }
          }
          return t
        }),
      }
    })
  }, [messages.length, workflowPlan]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-detect multi-child intent — ONLY when the AI responds with a lesson_build card
  // for the first time and there are multiple children. Do NOT trigger on mode selection
  // auto-messages or schedule_lessons mode.
  useEffect(() => {
    if (workflowInitializedRef.current) return
    if (workflowPlan) { workflowInitializedRef.current = true; return }
    if (children.length < 2) return
    // Only in build modes, never in schedule-only mode
    if (workflowMode !== "build_lessons" && workflowMode !== "build_and_schedule") return

    // Only trigger when the AI returns the FIRST lesson_build card
    const latestMsg = messages[messages.length - 1]
    if (!latestMsg || latestMsg.role !== "assistant") return
    if (latestMsg.structuredData?.type !== "lesson_build") return

    workflowInitializedRef.current = true
    const card = latestMsg.structuredData as LessonBuildCard
    const subject = card.subject || "Lessons"
    initializeWorkflowPlan([subject])
  }, [messages.length, workflowPlan, workflowMode, children.length, initializeWorkflowPlan]) // eslint-disable-line react-hooks/exhaustive-deps

  const showModeSelector = messages.length <= 1 && !workflowMode

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-5xl mx-auto">
    <div className="flex flex-col flex-1 min-w-0">
      {/* Header with child selector */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AtoZ AI Advisor</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">
                {workflowMode ? `Mode: ${WORKFLOW_MODES.find(m => m.id === workflowMode)?.label || "Chat"}` : "Online"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {children.length > 0 && (
            <select
              value={selectedChild?.id || ""}
              onChange={(e) => {
                const child = children.find((c) => c.id === e.target.value)
                setSelectedChild(child || null)
              }}
              className="text-sm border rounded-md px-2 py-1 bg-background"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          )}
          {workflowMode && (
            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => { setWorkflowMode(null) }}>
              {WORKFLOW_MODES.find(m => m.id === workflowMode)?.label} ✕
            </Badge>
          )}
          {workflowPlan && (
            <Button
              variant={showWorkflowSidebar ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowWorkflowSidebar(!showWorkflowSidebar)}
              title="Toggle build progress"
            >
              <ListChecks className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className={cn("max-w-[85%] space-y-3", msg.role === "user" ? "items-end" : "items-start")}>
              {msg.content && (
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {isStreaming && msg === messages[messages.length - 1] && msg.role === "assistant" && (
                    <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5" />
                  )}
                </div>
              )}
              {msg.structuredData && (
                <StructuredCardRenderer
                  card={msg.structuredData}
                  onSave={onSaveRecommendation}
                  onSchedule={onScheduleLessons}
                  onGeneratePacket={handleGeneratePacket}
                  onScheduleRequest={handleScheduleRequest}
                  onContinueBuilding={handleContinueBuilding}
                />
              )}
              {msg.lessonPacket && (
                <div className="w-full">
                  <LessonPacketViewer packet={msg.lessonPacket} savedPacketId={msg.savedPacketId} />
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarFallback className="bg-muted">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Workflow progress card — shown inline when a multi-child plan is active */}
        {workflowPlan && workflowPlan.tasks.length > 0 && (
          <div className="px-11">
            <WorkflowProgressCard
              plan={workflowPlan}
              onApprove={handleWorkflowApprove}
              onSkip={handleWorkflowSkip}
              onSchedule={handleWorkflowSchedule}
            />
          </div>
        )}

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
              <div className="flex space-x-1.5 items-center">
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Workflow mode selector — show when conversation hasn't started */}
      {showModeSelector && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Choose a workflow:</p>
          <div className="grid grid-cols-2 gap-2">
            {WORKFLOW_MODES.map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => selectWorkflowMode(mode.id)}
                  disabled={isStreaming}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                    mode.bgColor,
                    "disabled:opacity-50"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", mode.color)} />
                  <div>
                    <p className="text-sm font-medium">{mode.label}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{mode.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendMessage("Check my compliance status for this year")}
              disabled={isStreaming}
              className="text-xs flex-1"
            >
              <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />
              Check Compliance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const name = selectedChild?.name || "my children"
                sendMessage(`How is ${name} doing? Check learning progress.`)
              }}
              disabled={isStreaming}
              className="text-xs flex-1"
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              Learning Progress
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3 border-t bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your advisor anything..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="shrink-0 h-11 w-11 rounded-full"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>

    {/* Workflow sidebar — shown when multi-child plan is active */}
    {showWorkflowSidebar && workflowPlan && (
      <WorkflowSidebar
        plan={workflowPlan}
        onClose={() => setShowWorkflowSidebar(false)}
        onApprove={handleWorkflowApprove}
        onSkip={handleWorkflowSkip}
        onSchedule={handleWorkflowSchedule}
      />
    )}
    </div>
  )
}
