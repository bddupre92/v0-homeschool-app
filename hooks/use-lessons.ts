import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Lesson {
  id: string
  curriculum_id: string
  title: string
  description?: string
  subject?: string
  week_number?: number
  day_of_week?: string
  duration_minutes?: number
  resources?: any[]
  created_at: string
  updated_at: string
}

export function useLessons(curriculumId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    curriculumId ? `/api/lessons?curriculumId=${curriculumId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    lessons: (data as Lesson[]) || [],
    isLoading,
    error,
    mutate,
  }
}

export async function createLesson(curriculumId: string, lessonData: Partial<Lesson>) {
  const response = await fetch('/api/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      curriculumId,
      ...lessonData,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create lesson')
  }

  return response.json()
}

export async function updateLesson(lessonId: string, lessonData: Partial<Lesson>) {
  const response = await fetch(`/api/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lessonData),
  })

  if (!response.ok) {
    throw new Error('Failed to update lesson')
  }

  return response.json()
}

export async function deleteLesson(lessonId: string) {
  const response = await fetch(`/api/lessons/${lessonId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete lesson')
  }

  return response.json()
}
