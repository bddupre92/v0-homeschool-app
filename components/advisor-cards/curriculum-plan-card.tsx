"use client"

import { useState } from "react"
import { Check, ChevronDown, ChevronUp, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { CurriculumPlanCard } from "@/lib/advisor-types"

interface Props {
  card: CurriculumPlanCard
  onSave?: (data: any) => void
}

const SUBJECT_COLORS: Record<string, string> = {
  default: "bg-blue-500",
  mathematics: "bg-blue-500",
  "language arts": "bg-pink-500",
  science: "bg-green-500",
  history: "bg-amber-500",
  art: "bg-rose-500",
  nature: "bg-emerald-500",
  "physical education": "bg-red-500",
  music: "bg-purple-500",
}

function getSubjectColor(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (lower.includes(key)) return color
  }
  return SUBJECT_COLORS.default
}

export function CurriculumPlanCardUI({ card, onSave }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave?.(card)
    setSaved(true)
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground">
          {card.childName}&apos;s Year Curriculum — Grade {card.grade} ({card.schoolYear})
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {(card.subjects || []).map((subject) => {
          const isExpanded = expanded === subject.name
          const dotColor = getSubjectColor(subject.name)

          return (
            <div key={subject.name}>
              <button
                onClick={() => setExpanded(isExpanded ? null : subject.name)}
                className="w-full flex items-center justify-between py-1.5 hover:bg-muted/50 rounded px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  <span className="text-sm font-medium">{subject.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {subject.objectiveCount} objectives
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && subject.objectives && (
                <div className="ml-5 mt-1 space-y-1 border-l-2 border-muted pl-3 pb-2">
                  {subject.objectives.map((obj, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground py-0.5">
                      <span className="font-medium text-foreground">{obj.title}</span>
                      {obj.description && (
                        <span> — {obj.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Tags */}
        {card.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {card.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Summary footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>
              Year Outline Generated: {card.subjects.length} subjects · {card.totalObjectives} objectives
            </span>
          </div>
          <Button
            size="sm"
            variant={saved ? "outline" : "default"}
            onClick={handleSave}
            disabled={saved}
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" /> Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1" /> Save Plan
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
