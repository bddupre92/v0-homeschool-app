import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Group {
  id: string
  created_by_id: string
  name: string
  description?: string
  location?: string
  group_type: string
  state_abbreviation?: string
  max_members?: number
  is_private: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: string
  joined_at: string
  display_name?: string
  email?: string
  photo_url?: string
}

export function usePublicGroups(stateAbbr?: string) {
  const url = stateAbbr
    ? `/api/groups?state=${stateAbbr}`
    : '/api/groups'

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    groups: (data as Group[]) || [],
    isLoading,
    error,
    mutate,
  }
}

export function useUserGroups(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/groups?userGroups=true&userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    groups: (data as Group[]) || [],
    isLoading,
    error,
    mutate,
  }
}

export function useGroupMembers(groupId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    groupId ? `/api/groups/${groupId}/members` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    members: (data as GroupMember[]) || [],
    isLoading,
    error,
    mutate,
  }
}

export async function createGroup(userId: string, groupData: Partial<Group>) {
  const response = await fetch('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      createdById: userId,
      ...groupData,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create group')
  }

  return response.json()
}

export async function updateGroup(groupId: string, groupData: Partial<Group>) {
  const response = await fetch(`/api/groups/${groupId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(groupData),
  })

  if (!response.ok) {
    throw new Error('Failed to update group')
  }

  return response.json()
}

export async function deleteGroup(groupId: string) {
  const response = await fetch(`/api/groups/${groupId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete group')
  }

  return response.json()
}

export async function joinGroup(groupId: string, userId: string) {
  const response = await fetch(`/api/groups/${groupId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to join group')
  }

  return response.json()
}

export async function leaveGroup(groupId: string, userId: string) {
  const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to leave group')
  }

  return response.json()
}

export async function updateMemberRole(groupId: string, userId: string, role: string) {
  const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })

  if (!response.ok) {
    throw new Error('Failed to update member role')
  }

  return response.json()
}
