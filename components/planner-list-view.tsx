"use client"

import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { getSubjectById } from "@/lib/planner-data"

interface PlannerListViewProps {
  lessons: any[]
  onSelectLesson: (lesson: any) => void
  onToggleCompletion: (lessonId: string) => void
  onAddLesson: () => void
  isLoading: boolean
}

export default function PlannerListView({
  lessons,
  onSelectLesson,
  onToggleCompletion,
  onAddLesson,
  isLoading,
}: PlannerListViewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Scheduled Lessons</CardTitle>
          <CardDescription>All your planned lessons for the current week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Scheduled Lessons</CardTitle>
        <CardDescription>All your planned lessons for the current week</CardDescription>
      </CardHeader>
      <CardContent>
        {lessons.length > 0 ? (
          <div className="space-y-4">
            {[...lessons]
              .sort((a, b) => a.date - b.date)
              .map((lesson) => {
                const subject = getSubjectById(lesson.subject)
                return (
                  <div
                    key={lesson.id}
                    className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => onSelectLesson(lesson)}
                  >
                    <div className={`w-1 self-stretch ${subject.color} rounded-full`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{lesson.title}</h3>
                        <Badge variant="outline">{subject.name}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {format(lesson.date, "EEEE, MMM d")}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          {format(lesson.date, "h:mm a")} ({lesson.duration} min)
                        </div>
                      </div>
                    </div>
                    <Checkbox
                      checked={lesson.completed}
                      onCheckedChange={() => onToggleCompletion(lesson.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No lessons scheduled</h3>
            <p className="text-muted-foreground mb-4">You don&apos;t have any lessons scheduled for this week.</p>
            <Button onClick={onAddLesson}>Add Your First Lesson</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
