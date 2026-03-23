"use client"

import { useState, useEffect, useCallback } from "react"
import Navigation from "@/components/navigation"
import AIAdvisorChat from "@/components/ai-advisor-chat"
import RecommendationReview from "@/components/recommendation-review"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getChildren, getFamilyBlueprint, getComplianceFilings, getHourSummary, getTotalHoursThisYear } from "@/app/actions/family-actions"
import {
  saveRecommendation,
  getRecommendations,
  getRecommendationDetail,
  getApprovedObjectives,
  reviewObjective,
  bulkReviewObjectives,
  setObjectiveLessonSource,
  markObjectiveCompleted,
  getStateFilingTypes,
} from "@/app/actions/advisor-actions"
import { scheduleLessonsToPlanner } from "@/app/actions/planner-actions"
import { Sparkles, ClipboardList, BookOpen, Loader2, Users } from "lucide-react"
import Link from "next/link"
import type { ChildProfile, FamilyBlueprintData, CurriculumPlanCard } from "@/lib/advisor-types"

export default function AdvisorPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [familyBlueprint, setFamilyBlueprint] = useState<FamilyBlueprintData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stateReqs, setStateReqs] = useState<any>(null)
  const [stateFilings, setStateFilings] = useState<any[]>([])
  const [complianceData, setComplianceData] = useState<any>(null)
  const [approvedObjectives, setApprovedObjectives] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [selectedRec, setSelectedRec] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("chat")

  const loadData = useCallback(async () => {
    if (!user?.uid) return
    try {
      const [childrenData, blueprintData] = await Promise.all([
        getChildren(user.uid),
        getFamilyBlueprint(user.uid),
      ])

      if (childrenData && childrenData.length > 0) {
        setChildren(
          childrenData.map((c: any) => ({
            id: c.id,
            name: c.name,
            age: c.age,
            grade: c.grade,
            learningStyle: c.learning_style,
            interests: c.interests || [],
            strengths: c.strengths || [],
            challenges: c.challenges || [],
          }))
        )
      }

      if (blueprintData) {
        setFamilyBlueprint({
          familyName: blueprintData.family_name,
          values: blueprintData.values || [],
          philosophy: blueprintData.philosophy || [],
          traitPillars: blueprintData.trait_pillars || [],
          stateAbbreviation: blueprintData.state_abbreviation,
        })

        // Load state-specific data
        if (blueprintData.state_abbreviation) {
          try {
            const [reqsRes, filingsData] = await Promise.all([
              fetch(`/api/state-requirements?state=${blueprintData.state_abbreviation}`),
              getStateFilingTypes(blueprintData.state_abbreviation),
            ])
            if (reqsRes.ok) {
              const reqs = await reqsRes.json()
              setStateReqs(reqs)
            }
            setStateFilings(filingsData)
          } catch {
            // State data not critical — continue without it
          }
        }
      }

      // Load real compliance data (hours, filings, subjects)
      try {
        const [totalHours, hoursBySubject, filings] = await Promise.all([
          getTotalHoursThisYear(),
          getHourSummary(),
          getComplianceFilings(),
        ])
        setComplianceData({
          totalHoursLogged: totalHours || 0,
          hoursBySubject: hoursBySubject || [],
          filings: filings || [],
          subjectsWithHours: (hoursBySubject || []).map((s: any) => s.subject),
        })
      } catch {
        // Compliance data not critical — AI will note it's unavailable
      }

      // Load recommendations and approved objectives
      try {
        const [recs, objectives] = await Promise.all([
          getRecommendations(user.uid),
          getApprovedObjectives(user.uid),
        ])
        setRecommendations(recs)
        setApprovedObjectives(objectives)
      } catch {
        // Recommendations table may not exist yet
      }
    } catch (error) {
      console.error("Failed to load advisor data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveRecommendation = async (card: CurriculumPlanCard) => {
    if (!user?.uid || children.length === 0) return

    const child = children.find((c) => c.name === card.childName) || children[0]
    const result = await saveRecommendation(user.uid, {
      childId: child.id,
      title: `${card.childName}'s Year Curriculum — Grade ${card.grade} (${card.schoolYear})`,
      schoolYear: card.schoolYear,
      grade: card.grade,
      tags: card.tags,
      aiNotes: card.summary,
      subjects: card.subjects.map((s, idx) => ({
        name: s.name,
        color: s.color,
        sortOrder: idx,
        objectives: s.objectives.map((o, oIdx) => ({
          title: o.title,
          description: o.description,
          sortOrder: oIdx,
        })),
      })),
    })

    if (result.success) {
      // Refresh recommendations
      try {
        const recs = await getRecommendations(user.uid)
        setRecommendations(recs)
      } catch {
        // ignore
      }
    }
  }

  const handleViewRecommendation = async (recId: string) => {
    const detail = await getRecommendationDetail(recId)
    if (detail) {
      setSelectedRec(detail)
      setActiveTab("review")
    }
  }

  const handleReviewObjective = async (objectiveId: string, status: "approved" | "rejected", notes?: string) => {
    await reviewObjective(objectiveId, { status, parentNotes: notes })
    // Refresh the recommendation detail
    if (selectedRec) {
      const detail = await getRecommendationDetail(selectedRec.id)
      setSelectedRec(detail)
    }
  }

  const handleBulkApprove = async (objectiveIds: string[]) => {
    await bulkReviewObjectives(objectiveIds, "approved")
    if (selectedRec) {
      const detail = await getRecommendationDetail(selectedRec.id)
      setSelectedRec(detail)
    }
  }

  const handleSetLessonSource = async (objectiveId: string, source: "ai" | "parent") => {
    await setObjectiveLessonSource(objectiveId, source)
    if (selectedRec) {
      const detail = await getRecommendationDetail(selectedRec.id)
      setSelectedRec(detail)
    }
  }

  const handleMarkCompleted = async (objectiveId: string) => {
    await markObjectiveCompleted(objectiveId)
    if (selectedRec) {
      const detail = await getRecommendationDetail(selectedRec.id)
      setSelectedRec(detail)
    }
  }

  const handleScheduleLessons = async (lessons: any[]) => {
    const result = await scheduleLessonsToPlanner(lessons)
    if (!result.success) {
      throw new Error(result.error || "Failed to schedule lessons")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (!isLoading && children.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 pb-8 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Set up your family first</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your children and family details so the AI advisor can create personalized curriculum plans.
              </p>
              <Link href="/family">
                <Button>
                  <Users className="h-4 w-4 mr-2" /> Go to Family Setup
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="container px-4 md:px-6 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  AI Curriculum Advisor
                </h1>
                <p className="text-sm text-muted-foreground">
                  Plan curriculum, review recommendations, and track learning progress.
                </p>
              </div>
            </div>

            <TabsList>
              <TabsTrigger value="chat" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" />
                Recommendations
                {recommendations.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
                    {recommendations.length}
                  </Badge>
                )}
              </TabsTrigger>
              {selectedRec && (
                <TabsTrigger value="review" className="gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Review
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-0">
            <AIAdvisorChat
              children={children}
              familyBlueprint={familyBlueprint}
              stateRequirements={stateReqs}
              stateFilingTypes={stateFilings}
              complianceData={complianceData}
              approvedObjectives={approvedObjectives}
              onSaveRecommendation={handleSaveRecommendation}
              onScheduleLessons={handleScheduleLessons}
            />
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-0">
            <div className="container px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-4">
              {recommendations.length === 0 ? (
                <Card>
                  <CardContent className="pt-8 pb-8 text-center">
                    <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-1">No recommendations yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Chat with the AI advisor to generate a year curriculum for your children.
                      Once generated, you can save and review it here.
                    </p>
                    <Button onClick={() => setActiveTab("chat")}>
                      <Sparkles className="h-4 w-4 mr-2" /> Start Chat
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                recommendations.map((rec: any) => (
                  <Card key={rec.id} className="hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleViewRecommendation(rec.id)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{rec.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {rec.child_name} · {rec.school_year || "Current Year"}
                          </p>
                          {rec.tags && rec.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {rec.tags.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            rec.status === "approved"
                              ? "default"
                              : rec.status === "reviewed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {rec.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="mt-0">
            <div className="container px-4 md:px-6 py-6 max-w-4xl mx-auto">
              {selectedRec ? (
                <RecommendationReview
                  recommendation={selectedRec}
                  onReviewObjective={handleReviewObjective}
                  onBulkApprove={handleBulkApprove}
                  onSetLessonSource={handleSetLessonSource}
                  onGenerateLesson={(objId, obj, subject) => {
                    // Navigate to planner with pre-filled data
                    const child = children.find((c) => c.name === selectedRec.child_name) || children[0]
                    window.location.href = `/planner?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(obj.title)}&child=${encodeURIComponent(child?.name || "")}&grade=${encodeURIComponent(selectedRec.grade || "")}`
                  }}
                  onMarkCompleted={handleMarkCompleted}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Select a recommendation to review.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
