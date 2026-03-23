"use client"

import { useState } from "react"
import { Plus, Trash2, GraduationCap, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { addTeachingRotation, removeTeachingRotation } from "@/app/actions/group-coordination-actions"
import type { TeachingRotation, GroupMember } from "@/lib/types"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const SUBJECT_COLORS: Record<string, string> = {
  Math: "bg-blue-100 text-blue-800 border-blue-200",
  Science: "bg-green-100 text-green-800 border-green-200",
  English: "bg-purple-100 text-purple-800 border-purple-200",
  History: "bg-amber-100 text-amber-800 border-amber-200",
  Art: "bg-pink-100 text-pink-800 border-pink-200",
  Music: "bg-indigo-100 text-indigo-800 border-indigo-200",
  PE: "bg-orange-100 text-orange-800 border-orange-200",
}

interface TeachingRotationCalendarProps {
  groupId: string
  rotations: TeachingRotation[]
  isAdmin: boolean
  members: GroupMember[]
  onUpdate: () => void
}

export default function TeachingRotationCalendar({
  groupId,
  rotations,
  isAdmin,
  members,
  onUpdate,
}: TeachingRotationCalendarProps) {
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newRotation, setNewRotation] = useState({
    teacherUserId: "",
    subject: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  })

  const handleAdd = async () => {
    if (!newRotation.teacherUserId || !newRotation.subject || !newRotation.dayOfWeek) return
    setIsSubmitting(true)
    const result = await addTeachingRotation(
      groupId,
      newRotation.teacherUserId,
      newRotation.subject,
      newRotation.dayOfWeek,
      newRotation.startTime || undefined,
      newRotation.endTime || undefined
    )
    if (result.success) {
      toast({ title: "Added", description: "Teaching rotation added." })
      setShowForm(false)
      setNewRotation({ teacherUserId: "", subject: "", dayOfWeek: "", startTime: "", endTime: "" })
      onUpdate()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsSubmitting(false)
  }

  const handleRemove = async (rotationId: string) => {
    const result = await removeTeachingRotation(rotationId, groupId)
    if (result.success) {
      toast({ title: "Removed", description: "Rotation removed." })
      onUpdate()
    }
  }

  // Group rotations by day
  const rotationsByDay: Record<string, TeachingRotation[]> = {}
  for (const day of DAYS) {
    rotationsByDay[day] = rotations.filter((r) => r.dayOfWeek === day)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Teaching Schedule</h2>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Teacher</Label>
              <Select
                value={newRotation.teacherUserId}
                onValueChange={(v) => setNewRotation({ ...newRotation, teacherUserId: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subject</Label>
              <Input
                placeholder="Subject"
                value={newRotation.subject}
                onChange={(e) => setNewRotation({ ...newRotation, subject: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Day</Label>
              <Select
                value={newRotation.dayOfWeek}
                onValueChange={(v) => setNewRotation({ ...newRotation, dayOfWeek: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Start</Label>
                <Input
                  type="time"
                  value={newRotation.startTime}
                  onChange={(e) => setNewRotation({ ...newRotation, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End</Label>
                <Input
                  type="time"
                  value={newRotation.endTime}
                  onChange={(e) => setNewRotation({ ...newRotation, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        </Card>
      )}

      {rotations.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No teaching schedule set up yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {DAYS.map((day) => {
            const dayRotations = rotationsByDay[day]
            if (dayRotations.length === 0) return null
            return (
              <Card key={day} className="p-3">
                <h3 className="font-medium text-sm mb-2">{day}</h3>
                <div className="space-y-2">
                  {dayRotations.map((rot) => {
                    const colorClass = SUBJECT_COLORS[rot.subject] || "bg-gray-100 text-gray-800 border-gray-200"
                    return (
                      <div key={rot.id} className={`flex items-center justify-between p-2 rounded border ${colorClass}`}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{rot.subject}</Badge>
                          <span className="text-sm">{rot.teacherName}</span>
                          {rot.startTime && (
                            <span className="text-xs text-muted-foreground">
                              {rot.startTime}{rot.endTime ? ` - ${rot.endTime}` : ""}
                            </span>
                          )}
                        </div>
                        {isAdmin && (
                          <Button variant="ghost" size="sm" onClick={() => handleRemove(rot.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
