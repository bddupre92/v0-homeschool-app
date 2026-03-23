// ─── AI Curriculum Advisor Types ─────────────────────────────────────────────

export interface AdvisorMessage {
  id: string
  role: "user" | "assistant"
  content: string
  structuredData?: StructuredCard | null
  messageType?: string
  createdAt?: string
}

export type StructuredCard =
  | CurriculumPlanCard
  | ComplianceCheckCard
  | ProgressReportCard
  | LessonSuggestionCard

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

export type AdvisorIntent =
  | "year_curriculum"
  | "compliance_check"
  | "learning_alignment"
  | "lesson_help"
  | "general"
