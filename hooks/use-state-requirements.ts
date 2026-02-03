import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface StateRequirement {
  id: string
  state: string
  state_code: string
  required_subjects: string[]
  min_hours_per_year: number
  assessment_method: string
  special_needs_requirements: string
  notification_required: boolean
  curriculum_approval_required: boolean
  record_keeping_required: boolean
  details: Record<string, unknown>
  created_at: string
  updated_at: string
}

export function useStateRequirements(state?: string) {
  const url = state
    ? `/api/state-requirements?state=${encodeURIComponent(state)}`
    : "/api/state-requirements"

  const { data, error, isLoading, mutate } = useSWR<{
    requirements: StateRequirement[]
  }>(url, fetcher)

  return {
    requirements: data?.requirements || [],
    isLoading,
    error,
    mutate,
  }
}

export function useStateRequirementByCode(stateCode?: string) {
  const url = stateCode
    ? `/api/state-requirements?code=${encodeURIComponent(stateCode)}`
    : null

  const { data, error, isLoading } = useSWR<{
    requirements: StateRequirement[]
  }>(url, fetcher)

  return {
    requirement: data?.requirements?.[0] || null,
    isLoading,
    error,
  }
}

export function useAllStates() {
  const { requirements, isLoading, error } = useStateRequirements()

  return {
    states: requirements.map((req) => ({
      code: req.state_code,
      name: req.state,
      requirements: req,
    })),
    isLoading,
    error,
  }
}
