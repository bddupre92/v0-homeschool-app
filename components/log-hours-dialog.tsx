"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock } from "lucide-react"

const COMMON_SUBJECTS = [
  "Reading", "Language Arts", "Mathematics", "Science", "Social Studies",
  "History", "Health", "Physical Education", "Art", "Music",
  "Technology", "Foreign Language", "Life Skills", "Religion",
  "Performing Arts", "Home Economics", "Community Service"
]

interface Child {
  id: string
  name: string
}

interface LogHoursDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: Child[]
  onSubmit: (data: {
    childId: string
    subject: string
    hours: number
    date: string
    notes?: string
  }) => void
}

export default function LogHoursDialog({ open, onOpenChange, children, onSubmit }: LogHoursDialogProps) {
  const [childId, setChildId] = useState("")
  const [subject, setSubject] = useState("")
  const [hours, setHours] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    if (!childId || !subject || !hours) return
    onSubmit({
      childId,
      subject,
      hours: parseFloat(hours),
      date,
      notes: notes || undefined,
    })
    setChildId("")
    setSubject("")
    setHours("")
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Log Learning Hours
          </DialogTitle>
          <DialogDescription>
            Track hours for state compliance and your own records.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Child</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger>
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_SUBJECTS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hours</Label>
              <Input
                type="number"
                step="0.25"
                min="0.25"
                max="12"
                placeholder="1.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="What did you work on?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} disabled={!childId || !subject || !hours} className="w-full">
            Log Hours
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
