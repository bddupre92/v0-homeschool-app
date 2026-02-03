import { z } from "zod"

// User validation schemas
export const userSchema = z.object({
  id: z.string().optional(),
  firebaseUid: z.string().min(1, "Firebase UID is required"),
  email: z.string().email("Invalid email address"),
  displayName: z.string().min(1, "Display name is required").max(100),
  photoURL: z.string().url().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const updateUserSchema = userSchema.partial().required({ firebaseUid: true })

// Curriculum validation schemas
export const curriculumSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  subject: z.string().min(1, "Subject is required").max(100),
  gradeLevel: z.string().min(1, "Grade level is required").max(50),
  duration: z.enum(["quarter", "semester", "year"]),
  stateCode: z.string().length(2).optional().nullable(),
  objectives: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const createCurriculumSchema = curriculumSchema.omit({ id: true, createdAt: true, updatedAt: true })

// Lesson validation schemas
export const lessonSchema = z.object({
  id: z.string().optional(),
  curriculumId: z.string().min(1, "Curriculum ID is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  weekNumber: z.number().int().positive().optional(),
  orderIndex: z.number().int().min(0).optional(),
  content: z.string().optional(),
  resources: z.array(z.string().url()).optional(),
  objectives: z.array(z.string()).optional(),
  estimatedDuration: z.number().positive().optional(),
  scheduledDate: z.date().optional().nullable(),
  completedAt: z.date().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const createLessonSchema = lessonSchema.omit({ id: true, createdAt: true, updatedAt: true })

export const updateLessonSchema = lessonSchema.partial().required({ id: true })

// Group validation schemas
export const groupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Group name is required").max(100),
  description: z.string().max(1000).optional(),
  type: z.enum(["co-op", "support", "study", "activity", "other"]),
  location: z.string().max(200).optional(),
  meetingSchedule: z.string().max(500).optional(),
  maxMembers: z.number().int().positive().optional().nullable(),
  isPrivate: z.boolean().default(false),
  createdById: z.string().min(1, "Creator ID is required"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const createGroupSchema = groupSchema.omit({ id: true, createdAt: true, updatedAt: true })

export const updateGroupSchema = groupSchema.partial().required({ id: true })

// Event validation schemas
export const eventSchema = z.object({
  id: z.string().optional(),
  groupId: z.string().min(1, "Group ID is required").optional().nullable(),
  title: z.string().min(1, "Event title is required").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["field-trip", "class", "meetup", "workshop", "performance", "sports", "other"]),
  location: z.string().min(1, "Location is required").max(300),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  maxAttendees: z.number().int().positive().optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  ageRange: z.string().max(50).optional(),
  createdById: z.string().min(1, "Creator ID is required"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const createEventSchema = eventSchema.omit({ id: true, createdAt: true, updatedAt: true })

export const updateEventSchema = eventSchema.partial().required({ id: true })

// Request validation helpers
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

// Format validation errors for API responses
export function formatValidationErrors(errors: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  
  errors.errors.forEach((error) => {
    const path = error.path.join(".")
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(error.message)
  })
  
  return formatted
}
