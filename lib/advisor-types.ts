import type { MaterialResource, Reference } from "./types"

// ─── AI Curriculum Advisor Types ─────────────────────────────────────────────

export interface AdvisorMessage {
  id: string
  role: "user" | "assistant"
  content: string
  structuredData?: StructuredCard | null
  messageType?: string
  createdAt?: string
  lessonPacket?: any | null
  savedPacketId?: string | null
}

export type StructuredCard =
  | CurriculumPlanCard
  | ComplianceCheckCard
  | ProgressReportCard
  | LessonSuggestionCard
  | LessonBuildCard
  | ScheduleProposalCard

export interface CurriculumPlanCard {
  type: "curriculum_plan"
  schoolYear: string
  childName: string
  grade: string
  subjects: {
    name: string
    color: string
    objectiveCount: number
    objectives: { title: string; description?: string }[]
  }[]
  tags: string[]
  totalObjectives: number
  summary: string
}

export interface ComplianceCheckCard {
  type: "compliance_check"
  state: string
  items: {
    name: string
    status: "on_track" | "needs_attention" | "overdue"
    detail: string
  }[]
  summary: string
}

export interface ProgressReportCard {
  type: "progress_report"
  childName: string
  items: {
    subject: string
    status: "on_track" | "needs_attention" | "ahead"
    detail: string
    percentComplete: number
  }[]
  traitGrowth?: {
    trait: string
    level: string
    detail: string
  }[]
  summary: string
}

export interface LessonSuggestionCard {
  type: "lesson_suggestion"
  childName: string
  items: {
    label: string
    status: "done" | "pending"
  }[]
}

export interface LessonBuildCard {
  type: "lesson_build"
  childName: string
  subject: string
  lessons: {
    objectiveId?: string
    objectiveTitle: string
    lessonTitle: string
    duration: number
    description: string
    materials: (string | MaterialResource)[]
    packetDepth: "light" | "full"
  }[]
  references?: Reference[]
  summary: string
}

export interface ScheduleProposalCard {
  type: "schedule_proposal"
  childName: string
  weekStart: string
  lessons: {
    title: string
    subject: string
    day: string
    time: string
    duration: number
    objectiveId?: string
    lessonPacketId?: string
  }[]
  summary: string
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export interface ChildProfile {
  id: string
  name: string
  age?: number
  grade?: string
  learningStyle?: string
  interests?: string[]
  strengths?: string[]
  challenges?: string[]
}

export interface FamilyBlueprintData {
  familyName?: string
  values?: string[]
  philosophy?: string[]
  traitPillars?: { name: string; description: string }[]
  stateAbbreviation?: string
}

// ─── Intents & Workflow Modes ────────────────────────────────────────────────

export type AdvisorIntent =
  | "year_curriculum"
  | "compliance_check"
  | "learning_alignment"
  | "lesson_help"
  | "build_lessons"
  | "schedule_lessons"
  | "build_and_schedule"
  | "general"

export type AdvisorWorkflowMode =
  | "chat"
  | "build_lessons"
  | "schedule_lessons"
  | "build_and_schedule"

// ─── Multi-Child Workflow Tracker ────────────────────────────────────────────

export interface WorkflowTask {
  id: string
  childName: string
  subject: string
  status: "pending" | "building" | "awaiting_approval" | "approved" | "scheduled" | "skipped"
  lessonCount?: number
}

export interface WorkflowPlan {
  id: string
  title: string
  tasks: WorkflowTask[]
  currentTaskIndex: number
  createdAt: string
}
