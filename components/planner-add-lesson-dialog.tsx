"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { subjects } from "@/lib/planner-data"

interface AddLessonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
}

export default function AddLessonDialog({ open, onOpenChange, onSubmit, isSubmitting }: AddLessonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>Create a new lesson or activity for your homeschool schedule.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Lesson Title *</Label>
              <Input id="title" name="title" placeholder="Enter lesson title" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select name="subject" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Subjects</SelectLabel>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${subject.color} mr-2`}></div>
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" name="duration" type="number" placeholder="45" min="5" step="5" defaultValue="45" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Enter lesson description" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="materials">Materials Needed</Label>
              <Textarea id="materials" name="materials" placeholder="List materials needed, one per line" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
