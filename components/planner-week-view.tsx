"use client"

import { format, isSameDay } from "date-fns"
import { Clock, Calendar } from "lucide-react"
import { getSubjectById } from "@/lib/planner-data"
import { Skeleton } from "@/components/ui/skeleton"

interface PlannerWeekViewProps {
  lessonsByDay: { date: Date; lessons: any[] }[]
  onSelectLesson: (lesson: any) => void
  isLoading: boolean
}

export default function PlannerWeekView({ lessonsByDay, onSelectLesson, isLoading }: PlannerWeekViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <Skeleton className="h-14 rounded-t-lg rounded-b-none" />
            <div className="border rounded-b-lg p-2 space-y-2 min-h-[300px]">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const hasAnyLessons = lessonsByDay.some((day) => day.lessons.length > 0)

  if (!hasAnyLessons) {
    return (
      <div className="text-center py-16 border rounded-lg">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No lessons this week</h3>
        <p className="text-muted-foreground">Add lessons to see them on your weekly calendar.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
      {lessonsByDay.map((day, index) => (
        <div key={index} className="flex flex-col">
          <div
            className={`text-center p-2 rounded-t-lg font-medium text-sm ${
              isSameDay(day.date, new Date()) ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            <div>{format(day.date, "EEE")}</div>
            <div>{format(day.date, "MMM d")}</div>
          </div>
          <div className="flex-1 border rounded-b-lg p-2 space-y-2 min-h-[300px]">
            {day.lessons.length > 0 ? (
              day.lessons.map((lesson) => {
                const subject = getSubjectById(lesson.subject)
                return (
                  <div
                    key={lesson.id}
                    className="p-2 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => onSelectLesson(lesson)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                      <span className="font-medium text-sm truncate">{lesson.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(lesson.date, "h:mm a")} ({lesson.duration} min)
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No lessons
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
