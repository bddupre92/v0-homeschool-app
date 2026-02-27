export interface ResearchResult {
  title: string
  url: string
  snippet: string
}

// ─── AI Lesson Packet Types ─────────────────────────────────────────────────

export interface LessonPacket {
  id: string
  title: string
  subject: string
  grade: string
  childName: string
  topic: string
  createdAt: string

  studentLesson: StudentLesson
  worksheet: Worksheet
  teacherGuide: TeacherGuide
  materialsList: MaterialsList
  experiment: Experiment
  localExploration: LocalExploration
  extensions: Extensions
}

export interface StudentLesson {
  title: string
  objective: string
  vocabulary: VocabularyWord[]
  readingContent: string
  keyConcepts: string[]
  summary: string
}

export interface VocabularyWord {
  term: string
  definition: string
}

export interface Worksheet {
  title: string
  instructions: string
  sections: WorksheetSection[]
}

export interface WorksheetSection {
  sectionTitle: string
  type: "multiple_choice" | "short_answer" | "fill_blank" | "matching" | "drawing" | "writing_prompt"
  instructions: string
  items: string[]
}

export interface TeacherGuide {
  overview: string
  timeEstimate: string
  preparationSteps: string[]
  teachingInstructions: TeachingStep[]
  discussionQuestions: string[]
  assessmentTips: string[]
  commonMisconceptions: string[]
}

export interface TeachingStep {
  step: number
  title: string
  duration: string
  instructions: string
}

export interface MaterialsList {
  required: MaterialItem[]
  optional: MaterialItem[]
  householdAlternatives: HouseholdAlternative[]
}

export interface MaterialItem {
  item: string
  quantity: string
  notes?: string
}

export interface HouseholdAlternative {
  original: string
  alternative: string
}

export interface Experiment {
  title: string
  objective: string
  safetyNotes: string[]
  steps: ExperimentStep[]
  expectedResults: string
  scienceConnection: string
  cleanupInstructions: string
}

export interface ExperimentStep {
  step: number
  instruction: string
  tip?: string
}

export interface LocalExploration {
  fieldTripIdeas: FieldTripIdea[]
  atHomeAlternatives: string[]
  onlineResources: OnlineResource[]
}

export interface FieldTripIdea {
  name: string
  type: string
  description: string
  learningConnection: string
}

export interface OnlineResource {
  title: string
  description: string
}

export interface Extensions {
  struggling: ExtensionActivity[]
  onTrack: ExtensionActivity[]
  advanced: ExtensionActivity[]
}

export interface ExtensionActivity {
  activity: string
  description: string
}

export interface LessonPacketFormData {
  childName: string
  grade: string
  subject: string
  topic: string
  learningStyle?: string
  interests?: string
  location?: string
  stateCode?: string
}
