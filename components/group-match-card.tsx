"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { GroupMatchResult } from "@/lib/types"

const PHILOSOPHY_LABELS: Record<string, string> = {
  classical: "Classical",
  montessori: "Montessori",
  charlotte_mason: "Charlotte Mason",
  unschooling: "Unschooling",
  eclectic: "Eclectic",
  waldorf: "Waldorf",
  reggio: "Reggio Emilia",
  traditional: "Traditional",
}

function MatchBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? "bg-green-500" :
    score >= 50 ? "bg-yellow-500" :
    score >= 25 ? "bg-orange-500" : "bg-red-500"

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="w-8 text-right text-muted-foreground">{score}%</span>
    </div>
  )
}

interface GroupMatchCardProps {
  group: GroupMatchResult
  onJoin?: (groupId: string) => void
}

export default function GroupMatchCard({ group, onJoin }: GroupMatchCardProps) {
  const [expanded, setExpanded] = useState(false)

  const matchColor =
    group.matchScore >= 80 ? "text-green-600 bg-green-50 border-green-200" :
    group.matchScore >= 50 ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
    "text-gray-600 bg-gray-50 border-gray-200"

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={group.imageUrl || "/placeholder.svg"} alt={group.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/community/groups/${group.id}`}
                  className="font-semibold text-base hover:underline line-clamp-1"
                >
                  {group.name}
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {group.description}
                </p>
              </div>
              <Badge variant="outline" className={`shrink-0 text-sm font-bold ${matchColor}`}>
                {group.matchScore}%
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {group.philosophy && (
                <Badge variant="secondary" className="text-xs">
                  {PHILOSOPHY_LABELS[group.philosophy] || group.philosophy}
                </Badge>
              )}
              {group.ageGroups.slice(0, 2).map((ag) => (
                <Badge key={ag} variant="outline" className="text-xs">
                  {ag}
                </Badge>
              ))}
              {group.ageGroups.length > 2 && (
                <span className="text-xs text-muted-foreground">+{group.ageGroups.length - 2}</span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {group.memberCount} members
              </span>
              {group.distanceMiles !== undefined && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {group.distanceMiles < 1
                    ? "< 1 mi"
                    : `${group.distanceMiles.toFixed(1)} mi`}
                </span>
              )}
              {group.city && (
                <span>{group.city}</span>
              )}
              {group.meetingFrequency && (
                <span className="capitalize">{group.meetingFrequency}</span>
              )}
            </div>

            {/* Match breakdown (expandable) */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Why this match?
            </button>

            {expanded && (
              <div className="mt-2 space-y-1.5 p-2 bg-muted/50 rounded-md">
                <MatchBar label="Distance" score={group.matchBreakdown.distance} />
                <MatchBar label="Age groups" score={group.matchBreakdown.ageOverlap} />
                <MatchBar label="Philosophy" score={group.matchBreakdown.philosophyMatch} />
                <MatchBar label="Subjects" score={group.matchBreakdown.subjectOverlap} />
                <MatchBar label="Schedule" score={group.matchBreakdown.scheduleCompat} />
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/community/groups/${group.id}`}>View Group</Link>
              </Button>
              {group.isAcceptingMembers && onJoin && (
                <Button size="sm" onClick={() => onJoin(group.id)}>
                  Join
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
