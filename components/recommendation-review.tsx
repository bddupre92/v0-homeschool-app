"use client"

import { useState } from "react"
import { Check, X, Sparkles, PenLine, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

interface Objective {
  id: string
  title: string
  description?: string
  status: string
  lesson_source?: string | null
  parent_notes?: string | null
  lesson_packet_id?: string | null
}

interface Subject {
  id: string
  name: string
  color?: string
  objectives: Objective[]
}

interface RecommendationDetail {
  id: string
  title: string
  child_name: string
  school_year?: string
  grade?: string
  status: string
  tags?: string[]
  ai_notes?: string
  subjects: Subject[]
  totalObjectives: number
  approvedCount: number
  completedCount: number
}

interface Props {
  recommendation: RecommendationDetail
  onReviewObjective: (objectiveId: string, status: "approved" | "rejected", notes?: string) => Promise<void>
  onBulkApprove: (objectiveIds: string[]) => Promise<void>
  onSetLessonSource: (objectiveId: string, source: "ai" | "parent") => Promise<void>
  onGenerateLesson: (objectiveId: string, objective: Objective, subject: string) => void
  onMarkCompleted: (objectiveId: string) => Promise<void>
}

export default function RecommendationReview({
  recommendation,
  onReviewObjective,
  onBulkApprove,
  onSetLessonSource,
  onGenerateLesson,
  onMarkCompleted,
}: Props) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(
    recommendation.subjects[0]?.id || null
  )
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)

  const totalObjectives = recommendation.totalObjectives
  const approvedCount = recommendation.subjects.reduce(
    (sum, s) => sum + s.objectives.filter((o) => o.status === "approved" || o.status === "completed").length,
    0
  )
  const completedCount = recommendation.subjects.reduce(
    (sum, s) => sum + s.objectives.filter((o) => o.status === "completed").length,
    0
  )
  const reviewProgress = totalObjectives > 0 ? Math.round(
    (recommendation.subjects.reduce(
      (sum, s) => sum + s.objectives.filter((o) => o.status !== "pending").length,
      0
    ) / totalObjectives) * 100
  ) : 0

  const handleReview = async (objectiveId: string, status: "approved" | "rejected") => {
    setLoading(objectiveId)
    await onReviewObjective(objectiveId, status, reviewNotes[objectiveId])
    setLoading(null)
  }

  const handleBulkApproveSubject = async (subject: Subject) => {
    const pendingIds = subject.objectives.filter((o) => o.status === "pending").map((o) => o.id)
    if (pendingIds.length === 0) return
    setLoading(subject.id)
    await onBulkApprove(pendingIds)
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">{recommendation.title}</h2>
        <p className="text-sm text-muted-foreground">
          {recommendation.child_name} · Grade {recommendation.grade} · {recommendation.school_year}
        </p>
        {recommendation.tags && recommendation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {recommendation.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Review progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-2xl font-bold">{totalObjectives}</p>
              <p className="text-xs text-muted-foreground">Total Objectives</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Review Progress</span>
              <span>{reviewProgress}%</span>
            </div>
            <Progress value={reviewProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Subjects and objectives */}
      {recommendation.subjects.map((subject) => {
        const isExpanded = expandedSubject === subject.id
        const pendingCount = subject.objectives.filter((o) => o.status === "pending").length
        const approvedInSubject = subject.objectives.filter(
          (o) => o.status === "approved" || o.status === "completed"
        ).length

        return (
          <Card key={subject.id}>
            <CardHeader className="pb-3">
              <button
                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                className="w-full flex items-center justify-between"
              >
                <CardTitle className="text-base flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject.color || "#3b82f6" }}
                  />
                  {subject.name}
                  <Badge variant="secondary" className="text-xs font-normal ml-2">
                    {approvedInSubject}/{subject.objectives.length} approved
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {pendingCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBulkApproveSubject(subject)
                      }}
                      disabled={loading === subject.id}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Approve All ({pendingCount})
                    </Button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 space-y-3">
                {subject.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{obj.title}</p>
                        {obj.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{obj.description}</p>
                        )}
                      </div>
                      <Badge
                        variant={
                          obj.status === "approved"
                            ? "default"
                            : obj.status === "completed"
                            ? "default"
                            : obj.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs shrink-0"
                      >
                        {obj.status}
                      </Badge>
                    </div>

                    {/* Pending: show approve/reject */}
                    {obj.status === "pending" && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Optional notes..."
                          value={reviewNotes[obj.id] || ""}
                          onChange={(e) =>
                            setReviewNotes((prev) => ({ ...prev, [obj.id]: e.target.value }))
                          }
                          className="min-h-[40px] text-xs"
                          rows={1}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={() => handleReview(obj.id, "approved")}
                            disabled={loading === obj.id}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleReview(obj.id, "rejected")}
                            disabled={loading === obj.id}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Approved: choose lesson source */}
                    {obj.status === "approved" && !obj.lesson_source && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            onSetLessonSource(obj.id, "ai")
                            onGenerateLesson(obj.id, obj, subject.name)
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1" /> AI Generate Lesson
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => onSetLessonSource(obj.id, "parent")}
                        >
                          <PenLine className="h-3.5 w-3.5 mr-1" /> Parent-Built
                        </Button>
                      </div>
                    )}

                    {/* Has lesson source: show status */}
                    {obj.lesson_source && obj.status !== "completed" && (
                      <div className="flex items-center justify-between pt-1">
                        <Badge variant="outline" className="text-xs">
                          {obj.lesson_source === "ai" ? "AI-Generated Lesson" : "Parent-Built Lesson"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => onMarkCompleted(obj.id)}
                        >
                          <Check className="h-3 w-3 mr-1" /> Mark Complete
                        </Button>
                      </div>
                    )}

                    {obj.status === "completed" && (
                      <div className="flex items-center gap-2 text-green-600 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completed
                        {obj.lesson_source && (
                          <span className="text-muted-foreground">
                            ({obj.lesson_source === "ai" ? "AI-Generated" : "Parent-Built"})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
