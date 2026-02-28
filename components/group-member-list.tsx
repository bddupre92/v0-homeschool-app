"use client"

import { Users, Shield, Crown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { GroupMember } from "@/lib/types"

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  admin: { icon: <Crown className="h-3 w-3" />, label: "Admin", color: "bg-amber-100 text-amber-800" },
  moderator: { icon: <Shield className="h-3 w-3" />, label: "Mod", color: "bg-blue-100 text-blue-800" },
  member: { icon: null, label: "Member", color: "bg-gray-100 text-gray-800" },
}

interface GroupMemberListProps {
  members: GroupMember[]
  groupId: string
  isAdmin: boolean
  onUpdate: () => void
}

export default function GroupMemberList({ members, groupId, isAdmin, onUpdate }: GroupMemberListProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Members ({members.length})</h2>
      </div>

      {members.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No members yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.member
            return (
              <Card key={member.id} className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.photoUrl} alt={member.displayName} />
                    <AvatarFallback className="text-sm">
                      {member.displayName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{member.displayName}</span>
                      <Badge className={`text-xs gap-1 ${roleConfig.color}`}>
                        {roleConfig.icon}
                        {roleConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(member.joinedAt)}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
