export interface Subject {
  id: string
  name: string
  color: string
}

export const subjects: Subject[] = [
  { id: "math", name: "Math", color: "bg-blue-500" },
  { id: "science", name: "Science", color: "bg-green-500" },
  { id: "language", name: "Language Arts", color: "bg-purple-500" },
  { id: "history", name: "History", color: "bg-amber-500" },
  { id: "art", name: "Art", color: "bg-pink-500" },
  { id: "music", name: "Music", color: "bg-indigo-500" },
  { id: "pe", name: "Physical Education", color: "bg-red-500" },
  { id: "foreign", name: "Foreign Language", color: "bg-cyan-500" },
]

export function getSubjectById(id: string): Subject {
  return subjects.find((s) => s.id === id) || { id, name: id, color: "bg-gray-500" }
}

export interface CurriculumResource {
  id: string
  title: string
  subject: string
  description: string
  publisher: string
  lessons: number
  progress: number
}

export interface Collaborator {
  id: string
  name: string
  role: string
  avatar: string | null
}

export const curriculumResources: CurriculumResource[] = [
  {
    id: "1",
    title: "Saxon Math 3",
    subject: "math",
    description: "Complete math curriculum with daily practice",
    publisher: "Saxon",
    lessons: 120,
    progress: 78,
  },
  {
    id: "2",
    title: "Story of the World Vol. 1",
    subject: "history",
    description: "Ancient history through engaging narratives",
    publisher: "Well-Trained Mind",
    lessons: 42,
    progress: 28,
  },
]

export const collaborators: Collaborator[] = [
  { id: "1", name: "Co-Teacher Parent", role: "Editor", avatar: null },
]
