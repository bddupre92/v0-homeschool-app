"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { joinGroup, leaveGroup } from "@/app/actions/group-discovery-actions"
import { useToast } from "@/hooks/use-toast"
import { AnalyticsEvents, trackEvent } from "@/lib/analytics"

interface JoinLeaveButtonProps {
  groupId: string
  initialIsMember: boolean
  groupIsPrivate?: boolean
  isAcceptingMembers?: boolean
  className?: string
}

export default function JoinLeaveButton({
  groupId,
  initialIsMember,
  groupIsPrivate,
  isAcceptingMembers,
  className,
}: JoinLeaveButtonProps) {
  const { toast } = useToast()
  const [isMember, setIsMember] = useState(initialIsMember)
  const [pending, startTransition] = useTransition()

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinGroup(groupId)
      if (!result.success) {
        toast({ title: "Couldn't join", description: result.error })
        return
      }
      setIsMember(true)
      trackEvent(AnalyticsEvents.COMMUNITY_GROUP_JOINED, {
        group_id: groupId,
        already_member: Boolean(result.alreadyMember),
      })
      toast({ title: result.alreadyMember ? "You're already a member" : "Joined" })
    })
  }

  const handleLeave = () => {
    if (!confirm("Leave this group? You can rejoin later if it's public.")) return
    startTransition(async () => {
      const result = await leaveGroup(groupId)
      if (!result.success) {
        toast({ title: "Couldn't leave", description: result.error })
        return
      }
      setIsMember(false)
      trackEvent(AnalyticsEvents.COMMUNITY_GROUP_LEFT, { group_id: groupId })
      toast({ title: "You left the group" })
    })
  }

  if (isMember) {
    return (
      <Button variant="outline" onClick={handleLeave} disabled={pending} className={className}>
        {pending ? "Working…" : "Leave group"}
      </Button>
    )
  }

  if (groupIsPrivate) {
    return (
      <Button variant="outline" disabled className={className}>
        Invite-only
      </Button>
    )
  }

  if (isAcceptingMembers === false) {
    return (
      <Button variant="outline" disabled className={className}>
        Not accepting members
      </Button>
    )
  }

  return (
    <Button
      onClick={handleJoin}
      disabled={pending}
      className={`bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white ${className ?? ""}`}
    >
      {pending ? "Joining…" : "Join group"}
    </Button>
  )
}
