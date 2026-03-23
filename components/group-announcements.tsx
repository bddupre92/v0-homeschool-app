"use client"

import { useState, useEffect } from "react"
import { Pin, Plus, Trash2, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  createAnnouncement,
  getGroupAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
} from "@/app/actions/group-coordination-actions"
import type { GroupAnnouncement } from "@/lib/types"

interface GroupAnnouncementsProps {
  groupId: string
  isAdmin: boolean
  userRole: string | null
}

export default function GroupAnnouncements({ groupId, isAdmin, userRole }: GroupAnnouncementsProps) {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<GroupAnnouncement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreate = userRole === "admin" || userRole === "moderator"

  useEffect(() => {
    loadAnnouncements()
  }, [groupId])

  const loadAnnouncements = async () => {
    setIsLoading(true)
    const result = await getGroupAnnouncements(groupId)
    if (result.success) setAnnouncements(result.announcements as GroupAnnouncement[])
    setIsLoading(false)
  }

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return
    setIsSubmitting(true)
    const result = await createAnnouncement(groupId, title, content)
    if (result.success) {
      toast({ title: "Posted", description: "Announcement published." })
      setTitle("")
      setContent("")
      setShowForm(false)
      loadAnnouncements()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteAnnouncement(id, groupId)
    if (result.success) {
      toast({ title: "Deleted", description: "Announcement removed." })
      loadAnnouncements()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    const result = await updateAnnouncement(id, groupId, { isPinned: !currentlyPinned })
    if (result.success) loadAnnouncements()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    })
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Announcements</h2>
        {canCreate && (
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-4 space-y-3">
          <Input
            placeholder="Announcement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write your announcement..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={isSubmitting || !title.trim() || !content.trim()}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
            </Button>
          </div>
        </Card>
      )}

      {announcements.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <p>No announcements yet.</p>
        </Card>
      ) : (
        announcements.map((ann) => (
          <Card key={ann.id} className={`p-4 ${ann.isPinned ? "border-primary/30 bg-primary/5" : ""}`}>
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={ann.authorPhotoUrl} />
                <AvatarFallback className="text-xs">{ann.authorName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{ann.authorName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(ann.createdAt)}</span>
                  {ann.isPinned && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Pin className="h-2.5 w-2.5" />Pinned
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold mt-1">{ann.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{ann.content}</p>
              </div>
              {isAdmin && (
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleTogglePin(ann.id, ann.isPinned)}>
                    <Pin className={`h-3.5 w-3.5 ${ann.isPinned ? "text-primary" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(ann.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
