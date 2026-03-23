"use client"

import { useState } from "react"
import { BookOpen, CalendarDays, ChevronDown, ChevronUp, FileText, FlaskConical, Package, Loader2, Check } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LessonBuildCard } from "@/lib/advisor-types"
import { CitationText } from "@/components/ui/citation-text"
import { ReferencesSection } from "@/components/advisor-cards/references-section"
import { MaterialLink } from "@/components/advisor-cards/material-link"

export function LessonBuildCardUI(props: {
  card: LessonBuildCard
  onSave?: (data: any) => void
  onGeneratePacket?: (lesson: LessonBuildCard["lessons"][0], context: { childName: string; subject: string }) => void
  onScheduleRequest?: (card: LessonBuildCard) => void
  onContinueBuilding?: (card: LessonBuildCard) => void
}) {
  const { card, onSave, onGeneratePacket, onScheduleRequest, onContinueBuilding } = props
  const lessons = card.lessons || []
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [packetDepths, setPacketDepths] = useState<Record<number, "light" | "full">>(
    Object.fromEntries(lessons.map((l, i) => [i, l.packetDepth || "light"]))
  )
  const [saved, setSaved] = useState(false)
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null)
  const [generatedIdxs, setGeneratedIdxs] = useState<Set<number>>(new Set())

  const toggleDepth = (idx: number) => {
    setPacketDepths((prev) => ({
      ...prev,
      [idx]: prev[idx] === "light" ? "full" : "light",
    }))
  }

  const handleSave = () => {
    if (onSave) {
      const lessonsWithDepth = lessons.map((l, i) => ({
        ...l,
        packetDepth: packetDepths[i],
      }))
      onSave({ ...card, lessons: lessonsWithDepth })
      setSaved(true)
    }
  }

  const handleGeneratePacket = async (lesson: LessonBuildCard["lessons"][0], idx: number) => {
    if (!onGeneratePacket || generatingIdx !== null) return
    setGeneratingIdx(idx)
    try {
      await onGeneratePacket(lesson, { childName: card.childName, subject: card.subject })
      setGeneratedIdxs((prev) => new Set(prev).add(idx))
    } finally {
      setGeneratingIdx(null)
    }
  }

  return (
    <Card className="border-blue-500/20 overflow-hidden">
      <CardHeader className="pb-3 bg-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            <BookOpen className="h-4 w-4 inline mr-1.5" />
            Lesson Plans{card.childName ? ` — ${card.childName}` : ""}{card.subject ? ` · ${card.subject}` : ""}
          </div>
          <Badge variant="outline" className="text-xs">
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {lessons.map((lesson, idx) => {
          const isExpanded = expandedIdx === idx
          const depth = packetDepths[idx]
          const isGenerating = generatingIdx === idx
          const isGenerated = generatedIdxs.has(idx)
          return (
            <div key={idx} className="rounded-lg border overflow-hidden">
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lesson.lessonTitle || lesson.objectiveTitle || "Untitled Lesson"}</p>
                  <p className="text-xs text-muted-foreground">{lesson.objectiveTitle || ""}{lesson.duration ? ` · ${lesson.duration}min` : ""}</p>
                </div>
                {isGenerated && (
                  <Badge variant="default" className="text-xs bg-green-600 shrink-0 mr-1">
                    <Check className="h-3 w-3 mr-0.5" /> Generated
                  </Badge>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t bg-muted/20">
                  <p className="text-sm text-muted-foreground pt-2">
                    <CitationText text={lesson.description} references={card.references} />
                  </p>
                  {lesson.materials?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1 flex items-center gap-1">
                        <Package className="h-3 w-3" /> Materials
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {lesson.materials.map((m, mi) => (
                          <MaterialLink key={mi} material={m} />
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
                  {onGeneratePacket && !isGenerated && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGeneratePacket(lesson, idx)}
                      disabled={isGenerating || generatingIdx !== null}
                      className="w-full mt-1"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                          Generate Full Lesson Packet
                        </>
                      )}
                    </Button>
                  )}
                  {isGenerated && (
                    <p className="text-xs text-green-600 font-medium text-center">
                      Full packet generated and saved! See below in chat.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {card.summary && (
          <p className="text-xs text-muted-foreground pt-1">{card.summary}</p>
        )}

        {card.references && card.references.length > 0 && (
          <ReferencesSection references={card.references} />
        )}

        {onSave && !saved && (
          <Button onClick={handleSave} className="w-full mt-2" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Approve & Save Lessons
          </Button>
        )}
        {saved && (
          <div className="space-y-2 pt-1">
            <div className="text-center text-sm text-green-600 font-medium">
              Lessons saved! You can now schedule them.
            </div>
            <div className="flex gap-2">
              {onScheduleRequest && (
                <Button
                  onClick={() => onScheduleRequest(card)}
                  variant="outline"
                  className="flex-1 border-green-500/30 text-green-700 hover:bg-green-500/10"
                  size="sm"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Schedule to Planner
                </Button>
              )}
              {onContinueBuilding && (
                <Button
                  onClick={() => onContinueBuilding(card)}
                  variant="outline"
                  className="flex-1 border-blue-500/30 text-blue-700 hover:bg-blue-500/10"
                  size="sm"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Build More Lessons
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
