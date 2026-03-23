"use client"

import { useState } from "react"
import { CalendarDays, Clock, Check } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ScheduleProposalCard } from "@/lib/advisor-types"

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function ScheduleProposalCardUI({
  card,
  onSchedule,
}: {
  card: ScheduleProposalCard
  onSchedule?: (lessons: any[]) => void
}) {
  const [saveTemplate, setSaveTemplate] = useState(true)
  const [scheduled, setScheduled] = useState(false)
  const [scheduling, setScheduling] = useState(false)

  // Group lessons by day
  const allLessons = card.lessons || []
  const lessonsByDay = DAY_ORDER.reduce<Record<string, typeof allLessons>>((acc, day) => {
    const dayLessons = allLessons.filter((l) => l.day === day)
    if (dayLessons.length > 0) acc[day] = dayLessons
    return acc
  }, {})

  const handleSchedule = async () => {
    if (!onSchedule) return
    setScheduling(true)
    try {
      await onSchedule(allLessons.map((l) => ({
        ...l,
        weekStart: card.weekStart,
        childName: card.childName,
        saveTemplate,
      })))
      setScheduled(true)
    } catch (err) {
      console.error("Failed to schedule:", err)
    } finally {
      setScheduling(false)
    }
  }

  return (
    <Card className="border-green-500/20 overflow-hidden">
      <CardHeader className="pb-3 bg-green-500/5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            <CalendarDays className="h-4 w-4 inline mr-1.5" />
            Schedule Proposal — {card.childName}
          </div>
          <Badge variant="outline" className="text-xs">
            Week of {card.weekStart}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {Object.entries(lessonsByDay).map(([day, lessons]) => (
          <div key={day}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{day}</p>
            <div className="space-y-1.5">
              {lessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/50"
                >
                  <Clock className="h-3.5 w-3.5 shrink-0 text-green-500" />
                  <span className="text-xs font-medium text-muted-foreground w-14">{lesson.time}</span>
                  <span className="text-sm font-medium flex-1">{lesson.title}</span>
                  <Badge variant="outline" className="text-xs">{lesson.subject}</Badge>
                  <span className="text-xs text-muted-foreground">{lesson.duration}min</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {card.summary && (
          <p className="text-xs text-muted-foreground">{card.summary}</p>
        )}

        {!scheduled && onSchedule && (
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={saveTemplate}
                onChange={(e) => setSaveTemplate(e.target.checked)}
                className="rounded border-muted-foreground/30"
              />
              Save this as my weekly template for future scheduling
            </label>
            <Button onClick={handleSchedule} className="w-full" size="sm" disabled={scheduling}>
              {scheduling ? (
                <>Scheduling...</>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Confirm & Schedule {allLessons.length} Lessons
                </>
              )}
            </Button>
          </div>
        )}
        {scheduled && (
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-1.5 text-sm text-green-600 font-medium">
              <Check className="h-4 w-4" />
              {allLessons.length} lessons scheduled!
            </div>
            <a href="/planner" className="text-xs text-primary underline mt-1 inline-block">
              View in Planner →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
