"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getSubjectById } from "@/lib/planner-data"

interface LessonDetailDialogProps {
  lesson: any | null
  onClose: () => void
  onDelete: (lessonId: string) => void
  onToggleCompletion: (lessonId: string) => void
  isDeleting: boolean
}

export default function LessonDetailDialog({
  lesson,
  onClose,
  onDelete,
  onToggleCompletion,
  isDeleting,
}: LessonDetailDialogProps) {
  if (!lesson) return null

  const subject = getSubjectById(lesson.subject)

  return (
    <Dialog open={!!lesson} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
            <DialogTitle>{lesson.title}</DialogTitle>
          </div>
          <DialogDescription>
            {format(lesson.date, "EEEE, MMMM d, yyyy")} at {format(lesson.date, "h:mm a")} (
            {lesson.duration} minutes)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm">{lesson.description}</p>
          </div>
          {lesson.childName && (
            <div>
              <h4 className="text-sm font-medium mb-1">Student</h4>
              <Badge variant="secondary">{lesson.childName}</Badge>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium mb-1">Subject</h4>
            <Badge variant="outline">{subject.name}</Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Materials Needed</h4>
            <ul className="text-sm space-y-1 list-disc pl-5">
              {lesson.materials?.map((material: string, index: number) => (
                <li key={index}>{material}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={lesson.completed}
              onCheckedChange={() => onToggleCompletion(lesson.id)}
            />
            <Label htmlFor="completed">Mark as completed</Label>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive bg-transparent"
              onClick={() => onDelete(lesson.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
