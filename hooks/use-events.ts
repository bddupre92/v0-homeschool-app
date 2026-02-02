import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  address: string
  type: string
  created_by_id: string
  created_by_name: string
  created_by_email: string
  max_attendees: number | null
  age_groups: string[]
  tags: string[]
  attendee_count: number
  created_at: string
  updated_at: string
}

export interface EventAttendee {
  id: string
  event_id: string
  user_id: string
  display_name: string
  email: string
  created_at: string
}

export function useEvents(type?: string, location?: string, limit?: number) {
  let url = "/api/events"
  const params = new URLSearchParams()

  if (type) params.append("type", type)
  if (location) params.append("location", location)
  if (limit) params.append("limit", limit.toString())

  if (params.toString()) {
    url += `?${params.toString()}`
  }

  const { data, error, isLoading, mutate } = useSWR<{
    events: Event[]
    count: number
  }>(url, fetcher)

  return {
    events: data?.events || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  }
}

export function useEvent(eventId?: string) {
  const url = eventId ? `/api/events/${eventId}` : null

  const { data, error, isLoading, mutate } = useSWR<Event>(url, fetcher)

  return {
    event: data || null,
    isLoading,
    error,
    mutate,
  }
}

export function useEventAttendees(eventId?: string) {
  const url = eventId ? `/api/events/${eventId}/attendees` : null

  const { data, error, isLoading, mutate } = useSWR<{
    attendees: EventAttendee[]
    count: number
  }>(url, fetcher)

  return {
    attendees: data?.attendees || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  }
}

export async function createEvent(eventData: {
  title: string
  description: string
  date: string
  time: string
  location: string
  address: string
  type: string
  maxAttendees?: number
  ageGroups?: string[]
  tags?: string[]
}) {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  })

  if (!response.ok) {
    throw new Error("Failed to create event")
  }

  return response.json()
}

export async function updateEvent(
  eventId: string,
  eventData: {
    title: string
    description: string
    date: string
    time: string
    location: string
    address: string
    type: string
    maxAttendees?: number
    ageGroups?: string[]
    tags?: string[]
  }
) {
  const response = await fetch(`/api/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  })

  if (!response.ok) {
    throw new Error("Failed to update event")
  }

  return response.json()
}

export async function deleteEvent(eventId: string) {
  const response = await fetch(`/api/events/${eventId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete event")
  }

  return response.json()
}

export async function joinEvent(eventId: string) {
  const response = await fetch(`/api/events/${eventId}/attendees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to join event")
  }

  return response.json()
}

export async function leaveEvent(eventId: string, userId: string) {
  const response = await fetch(`/api/events/${eventId}/attendees/${userId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to leave event")
  }

  return response.json()
}
