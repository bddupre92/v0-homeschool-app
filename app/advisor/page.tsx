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
import { getChildren, getFamilyBlueprint } from "@/app/actions/family-actions"
import {
  saveRecommendation,
  getRecommendations,
  getRecommendationDetail,
  reviewObjective,
  bulkReviewObjectives,
  setObjectiveLessonSource,
  markObjectiveCompleted,
  getStateFilingTypes,
} from "@/app/actions/advisor-actions"
import { Sparkles, ClipboardList, BookOpen } from "lucide-react"
import Link from "next/link"
import type { ChildProfile, FamilyBlueprintData, CurriculumPlanCard } from "@/lib/advisor-types"

// Demo fallback data when DB is not yet set up
const DEMO_CHILDREN: ChildProfile[] = [
  {
    id: "1",
    name: "Emma",
    age: 8,
    grade: "3rd",
    learningStyle: "Visual & Hands-On",
    interests: ["animals", "art", "nature"],
    strengths: ["reading", "creativity"],
    challenges: ["math facts", "focus"],
  },
  {
    id: "2",
    name: "Liam",
    age: 6,
    grade: "1st",
    learningStyle: "Kinesthetic",
    interests: ["dinosaurs", "building", "sports"],
    strengths: ["math", "physical activity"],
    challenges: ["reading", "writing"],
  },
]

const DEMO_BLUEPRINT: FamilyBlueprintData = {
  familyName: "The Dupre Family",
  values: ["Curiosity", "Perseverance", "Kindness"],
  philosophy: ["Charlotte Mason"],
  traitPillars: [
    { name: "Curiosity", description: "Fostering a love of learning and exploration" },
    { name: "Perseverance", description: "Building grit and resilience through challenges" },
  ],
  stateAbbreviation: "OR",
}

export default function AdvisorPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<ChildProfile[]>(DEMO_CHILDREN)
  const [familyBlueprint, setFamilyBlueprint] = useState<FamilyBlueprintData | null>(DEMO_BLUEPRINT)
  const [stateReqs, setStateReqs] = useState<any>(null)
  const [stateFilings, setStateFilings] = useState<any[]>([])
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

      // Load recommendations
      try {
        const recs = await getRecommendations(user.uid)
        setRecommendations(recs)
      } catch {
        // Recommendations table may not exist yet
      }
    } catch (error) {
      console.error("Failed to load advisor data:", error)
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
              onSaveRecommendation={handleSaveRecommendation}
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
