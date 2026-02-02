import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Curriculum {
  id: string
  user_id: string
  title: string
  description?: string
  grade_level?: string
  state_abbreviation?: string
  created_at: string
  updated_at: string
}

export function useCurricula(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/curricula?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    curricula: (data as Curriculum[]) || [],
    isLoading,
    error,
    mutate,
  }
}

export async function createCurriculum(userId: string, curriculumData: Partial<Curriculum>) {
  const response = await fetch('/api/curricula', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      ...curriculumData,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create curriculum')
  }

  return response.json()
}

export async function updateCurriculum(curriculumId: string, curriculumData: Partial<Curriculum>) {
  const response = await fetch(`/api/curricula/${curriculumId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(curriculumData),
  })

  if (!response.ok) {
    throw new Error('Failed to update curriculum')
  }

  return response.json()
}

export async function deleteCurriculum(curriculumId: string) {
  const response = await fetch(`/api/curricula/${curriculumId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete curriculum')
  }

  return response.json()
}
