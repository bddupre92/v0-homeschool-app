"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Share2, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getGroupSharedPackets, removeSharedPacket } from "@/app/actions/group-coordination-actions"
import type { GroupSharedPacket } from "@/lib/types"

const SUBJECT_COLORS: Record<string, string> = {
  Math: "bg-blue-100 text-blue-800",
  Science: "bg-green-100 text-green-800",
  English: "bg-purple-100 text-purple-800",
  History: "bg-amber-100 text-amber-800",
  Art: "bg-pink-100 text-pink-800",
  Music: "bg-indigo-100 text-indigo-800",
}

interface GroupSharedPacketGridProps {
  groupId: string
  isAdmin: boolean
}

export default function GroupSharedPacketGrid({ groupId, isAdmin }: GroupSharedPacketGridProps) {
  const { toast } = useToast()
  const [packets, setPackets] = useState<GroupSharedPacket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPackets()
  }, [groupId])

  const loadPackets = async () => {
    setIsLoading(true)
    const result = await getGroupSharedPackets(groupId)
    if (result.success) setPackets(result.packets as GroupSharedPacket[])
    setIsLoading(false)
  }

  const handleRemove = async (sharedPacketId: string) => {
    const result = await removeSharedPacket(sharedPacketId, groupId)
    if (result.success) {
      toast({ title: "Removed", description: "Packet removed from group." })
      loadPackets()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Shared Lesson Packets</h2>
      </div>

      {packets.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No packets shared yet.</p>
          <p className="text-xs mt-1">Members can share lesson packets from their library.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packets.map((sp) => (
            <Card key={sp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/planner`}
                      className="font-semibold hover:underline line-clamp-1"
                    >
                      {sp.packetTitle}
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {sp.packetTopic}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(sp.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge className={`text-xs ${SUBJECT_COLORS[sp.packetSubject] || "bg-gray-100 text-gray-800"}`}>
                    {sp.packetSubject}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{sp.packetGrade}</Badge>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    Shared by {sp.sharedByName}
                  </span>
                  <span>{formatDate(sp.sharedAt)}</span>
                </div>
                {sp.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">&ldquo;{sp.notes}&rdquo;</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
