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

// ─── Saved (DB-backed) Lesson Packet Types ──────────────────────────────────

export interface SavedLessonPacket extends LessonPacket {
  userId: string
  isFavorite: boolean
  tags: string[]
  timesPrinted: number
  isShared: boolean
  sharedToGroupId?: string
  updatedAt: string
}

export interface PacketFilters {
  subject?: string
  grade?: string
  childName?: string
  isFavorite?: boolean
  search?: string
}

export interface PacketListResult {
  packets: SavedLessonPacket[]
  total: number
  page: number
  pageSize: number
}

// ─── Group / Co-op Discovery Types ────────────────────────────────────────────

export interface GroupProfile {
  id: string
  name: string
  description: string
  location: string
  groupType: string
  stateAbbreviation?: string
  maxMembers?: number
  isPrivate: boolean
  imageUrl?: string
  createdById: string
  createdAt: string
  updatedAt: string
  // Discovery fields
  philosophy?: string
  ageGroups: string[]
  subjectsOffered: string[]
  schedule?: GroupSchedule
  meetingFrequency?: string
  meetingSchedule?: string
  latitude?: number
  longitude?: number
  city?: string
  zipCode?: string
  isAcceptingMembers: boolean
  memberCount: number
}

export interface GroupSchedule {
  day: string
  startTime: string
  endTime: string
  frequency: string
}

export interface GroupMember {
  id: string
  userId: string
  displayName: string
  email: string
  photoUrl?: string
  role: "admin" | "moderator" | "member"
  joinedAt: string
}

export interface GroupMatchResult extends GroupProfile {
  matchScore: number
  matchBreakdown: MatchBreakdown
  distanceMiles?: number
}

export interface MatchBreakdown {
  distance: number
  ageOverlap: number
  philosophyMatch: number
  subjectOverlap: number
  scheduleCompat: number
}

export interface UserGroupPreferences {
  latitude?: number
  longitude?: number
  maxDistanceMiles: number
  preferredPhilosophy?: string
  childAgeGroups: string[]
  wantedSubjects: string[]
  preferredDay?: string
}

export interface GroupSharedPacket {
  id: string
  groupId: string
  packetId: string
  sharedByUserId: string
  sharedByName: string
  notes?: string
  sharedAt: string
  // Packet summary fields
  packetTitle: string
  packetSubject: string
  packetGrade: string
  packetChildName: string
  packetTopic: string
}

export interface GroupAnnouncement {
  id: string
  groupId: string
  authorUserId: string
  authorName: string
  authorPhotoUrl?: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface TeachingRotation {
  id: string
  groupId: string
  teacherUserId: string
  teacherName: string
  subject: string
  dayOfWeek: string
  startTime?: string
  endTime?: string
  notes?: string
  createdAt: string
}

export interface GroupFieldTrip {
  id: string
  groupId: string
  organizerUserId: string
  organizerName: string
  title: string
  description?: string
  location: string
  latitude?: number
  longitude?: number
  tripDate: string
  maxAttendees?: number
  costPerFamily?: number
  relatedPacketId?: string
  rsvpCount: number
  userRsvpStatus?: string
  createdAt: string
  updatedAt: string
}

export interface FieldTripRSVP {
  id: string
  fieldTripId: string
  userId: string
  userName: string
  numChildren: number
  status: "going" | "maybe" | "not_going"
  createdAt: string
}

export interface GroupDiscoveryFilters {
  search?: string
  philosophy?: string
  ageGroup?: string
  maxDistanceMiles?: number
  subjects?: string[]
  isAccepting?: boolean
  city?: string
  latitude?: number
  longitude?: number
}
