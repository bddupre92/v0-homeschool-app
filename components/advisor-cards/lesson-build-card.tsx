"use client"

import { useState } from "react"
import { BookOpen, ChevronDown, ChevronUp, FileText, FlaskConical, Package } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LessonBuildCard } from "@/lib/advisor-types"

export function LessonBuildCardUI({
  card,
  onSave,
}: {
  card: LessonBuildCard
  onSave?: (data: any) => void
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [packetDepths, setPacketDepths] = useState<Record<number, "light" | "full">>(
    Object.fromEntries(card.lessons.map((l, i) => [i, l.packetDepth || "light"]))
  )
  const [saved, setSaved] = useState(false)

  const toggleDepth = (idx: number) => {
    setPacketDepths((prev) => ({
      ...prev,
      [idx]: prev[idx] === "light" ? "full" : "light",
    }))
  }

  const handleSave = () => {
    if (onSave) {
      const lessonsWithDepth = card.lessons.map((l, i) => ({
        ...l,
        packetDepth: packetDepths[i],
      }))
      onSave({ ...card, lessons: lessonsWithDepth })
      setSaved(true)
    }
  }

  return (
    <Card className="border-blue-500/20 overflow-hidden">
      <CardHeader className="pb-3 bg-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            <BookOpen className="h-4 w-4 inline mr-1.5" />
            Lesson Plans — {card.childName} · {card.subject}
          </div>
          <Badge variant="outline" className="text-xs">
            {card.lessons.length} {card.lessons.length === 1 ? "lesson" : "lessons"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {card.lessons.map((lesson, idx) => {
          const isExpanded = expandedIdx === idx
          const depth = packetDepths[idx]
          return (
            <div key={idx} className="rounded-lg border overflow-hidden">
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lesson.lessonTitle}</p>
                  <p className="text-xs text-muted-foreground">{lesson.objectiveTitle} · {lesson.duration}min</p>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t bg-muted/20">
                  <p className="text-sm text-muted-foreground pt-2">{lesson.description}</p>
                  {lesson.materials.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1 flex items-center gap-1">
                        <Package className="h-3 w-3" /> Materials
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {lesson.materials.map((m, mi) => (
                          <Badge key={mi} variant="secondary" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <p className="text-xs font-medium">Packet depth:</p>
                    <div className="flex rounded-md overflow-hidden border">
                      <button
                        onClick={() => toggleDepth(idx)}
                        className={cn(
                          "px-2.5 py-1 text-xs transition-colors",
                          depth === "light"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background hover:bg-muted"
                        )}
                      >
                        <FileText className="h-3 w-3 inline mr-1" />
                        Outline
                      </button>
                      <button
                        onClick={() => toggleDepth(idx)}
                        className={cn(
                          "px-2.5 py-1 text-xs transition-colors",
                          depth === "full"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background hover:bg-muted"
                        )}
                      >
                        <FlaskConical className="h-3 w-3 inline mr-1" />
                        Full Packet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {card.summary && (
          <p className="text-xs text-muted-foreground pt-1">{card.summary}</p>
        )}

        {onSave && !saved && (
          <Button onClick={handleSave} className="w-full mt-2" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Approve & Save Lessons
          </Button>
        )}
        {saved && (
          <div className="text-center text-sm text-green-600 font-medium py-2">
            Lessons saved! You can now schedule them.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
