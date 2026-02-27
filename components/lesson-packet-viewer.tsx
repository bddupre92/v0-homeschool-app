"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Package,
  FlaskConical,
  MapPin,
  Puzzle,
  Printer,
} from "lucide-react"
import type { LessonPacket } from "@/lib/types"
import LessonPacketPrintView from "./lesson-packet-print-view"

interface LessonPacketViewerProps {
  packet: LessonPacket
}

export default function LessonPacketViewer({ packet }: LessonPacketViewerProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("student-lesson")

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* Screen view */}
      <div className="space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{packet.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{packet.subject}</Badge>
              <Badge variant="outline">{packet.grade}</Badge>
              <span className="text-sm text-muted-foreground">for {packet.childName}</span>
            </div>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Packet
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto">
            <TabsTrigger value="student-lesson" className="flex items-center gap-1 text-xs">
              <BookOpen className="h-3 w-3" />
              <span className="hidden sm:inline">Lesson</span>
            </TabsTrigger>
            <TabsTrigger value="worksheet" className="flex items-center gap-1 text-xs">
              <ClipboardList className="h-3 w-3" />
              <span className="hidden sm:inline">Worksheet</span>
            </TabsTrigger>
            <TabsTrigger value="teacher-guide" className="flex items-center gap-1 text-xs">
              <GraduationCap className="h-3 w-3" />
              <span className="hidden sm:inline">Guide</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-1 text-xs">
              <Package className="h-3 w-3" />
              <span className="hidden sm:inline">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="experiment" className="flex items-center gap-1 text-xs">
              <FlaskConical className="h-3 w-3" />
              <span className="hidden sm:inline">Experiment</span>
            </TabsTrigger>
            <TabsTrigger value="exploration" className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Explore</span>
            </TabsTrigger>
            <TabsTrigger value="extensions" className="flex items-center gap-1 text-xs">
              <Puzzle className="h-3 w-3" />
              <span className="hidden sm:inline">Extensions</span>
            </TabsTrigger>
          </TabsList>

          {/* Student Lesson */}
          <TabsContent value="student-lesson">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  {packet.studentLesson?.title || "Student Lesson"}
                </CardTitle>
                <CardDescription>{packet.studentLesson?.objective}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {packet.studentLesson?.vocabulary?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Vocabulary</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {packet.studentLesson.vocabulary.map((word, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg">
                          <span className="font-medium">{word.term}</span>
                          <span className="text-muted-foreground"> — {word.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-3">Reading</h4>
                  <div className="prose prose-sm max-w-none">
                    {packet.studentLesson?.readingContent?.split("\n").map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {packet.studentLesson?.keyConcepts?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Concepts</h4>
                    <ul className="space-y-2">
                      {packet.studentLesson.keyConcepts.map((concept, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {packet.studentLesson?.summary && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold mb-1">Summary</h4>
                    <p className="text-sm">{packet.studentLesson.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Worksheet */}
          <TabsContent value="worksheet">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-green-600" />
                  {packet.worksheet?.title || "Worksheet"}
                </CardTitle>
                <CardDescription>{packet.worksheet?.instructions}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {packet.worksheet?.sections?.map((section, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{section.sectionTitle}</h4>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {section.type?.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{section.instructions}</p>
                    <div className="space-y-3 pl-4">
                      {section.items?.map((item, j) => (
                        <div key={j} className="p-3 border rounded-lg">
                          <p className="text-sm">{j + 1}. {item}</p>
                          {(section.type === "short_answer" || section.type === "writing_prompt") && (
                            <div className="mt-2 border-b border-dashed border-muted-foreground/30 pb-8" />
                          )}
                        </div>
                      ))}
                    </div>
                    {i < (packet.worksheet?.sections?.length || 0) - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teacher Guide */}
          <TabsContent value="teacher-guide">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Teacher / Parent Guide
                </CardTitle>
                <CardDescription>
                  Estimated time: {packet.teacherGuide?.timeEstimate || "45-60 minutes"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {packet.teacherGuide?.overview && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p className="text-sm">{packet.teacherGuide.overview}</p>
                  </div>
                )}

                {packet.teacherGuide?.preparationSteps?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Before the Lesson</h4>
                    <ul className="space-y-2">
                      {packet.teacherGuide.preparationSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {packet.teacherGuide?.teachingInstructions?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Teaching Steps</h4>
                    <div className="space-y-4">
                      {packet.teacherGuide.teachingInstructions.map((instruction, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">
                              Step {instruction.step}: {instruction.title}
                            </h5>
                            <Badge variant="outline">{instruction.duration}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{instruction.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {packet.teacherGuide?.discussionQuestions?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Discussion Questions</h4>
                    <ul className="space-y-2">
                      {packet.teacherGuide.discussionQuestions.map((question, i) => (
                        <li key={i} className="text-sm p-2 bg-muted/50 rounded">
                          {i + 1}. {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {packet.teacherGuide?.assessmentTips?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Assessment Tips</h4>
                    <ul className="space-y-1">
                      {packet.teacherGuide.assessmentTips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">&#10003;</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {packet.teacherGuide?.commonMisconceptions?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Common Misconceptions</h4>
                    <ul className="space-y-1">
                      {packet.teacherGuide.commonMisconceptions.map((item, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">&#9888;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials List */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  Materials List
                </CardTitle>
                <CardDescription>Everything you need for this lesson</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {packet.materialsList?.required?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Required</h4>
                    <div className="space-y-2">
                      {packet.materialsList.required.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 rounded" />
                            <span className="font-medium text-sm">{item.item}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{item.quantity}</span>
                            {item.notes && <span className="text-xs">({item.notes})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {packet.materialsList?.optional?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Optional</h4>
                    <div className="space-y-2">
                      {packet.materialsList.optional.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-dashed rounded" />
                            <span className="text-sm">{item.item}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {packet.materialsList?.householdAlternatives?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Household Alternatives</h4>
                    <div className="space-y-2">
                      {packet.materialsList.householdAlternatives.map((alt, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-sm">
                          <span className="text-muted-foreground line-through">{alt.original}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium text-green-700 dark:text-green-400">{alt.alternative}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experiment */}
          <TabsContent value="experiment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-teal-600" />
                  {packet.experiment?.title || "Hands-On Activity"}
                </CardTitle>
                <CardDescription>{packet.experiment?.objective}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {packet.experiment?.safetyNotes?.length > 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-400">Safety Notes</h4>
                    <ul className="space-y-1">
                      {packet.experiment.safetyNotes.map((note, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-amber-600">&#9888;</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {packet.experiment?.steps?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Steps</h4>
                    <div className="space-y-3">
                      {packet.experiment.steps.map((step, i) => (
                        <div key={i} className="flex gap-4 p-3 border rounded-lg">
                          <span className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                            {step.step}
                          </span>
                          <div>
                            <p className="text-sm">{step.instruction}</p>
                            {step.tip && (
                              <p className="text-xs text-muted-foreground mt-1 italic">Tip: {step.tip}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {packet.experiment?.expectedResults && (
                  <div className="p-4 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
                    <h4 className="font-semibold mb-1">What Should Happen</h4>
                    <p className="text-sm">{packet.experiment.expectedResults}</p>
                  </div>
                )}

                {packet.experiment?.scienceConnection && (
                  <div>
                    <h4 className="font-semibold mb-1">Connection to the Lesson</h4>
                    <p className="text-sm text-muted-foreground">{packet.experiment.scienceConnection}</p>
                  </div>
                )}

                {packet.experiment?.cleanupInstructions && (
                  <div>
                    <h4 className="font-semibold mb-1">Cleanup</h4>
                    <p className="text-sm text-muted-foreground">{packet.experiment.cleanupInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Local Exploration */}
          <TabsContent value="exploration">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-600" />
                  Local Exploration
                </CardTitle>
                <CardDescription>Take learning beyond the home</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {packet.localExploration?.fieldTripIdeas?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Field Trip Ideas</h4>
                    <div className="grid gap-3">
                      {packet.localExploration.fieldTripIdeas.map((trip, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{trip.name}</h5>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {trip.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{trip.description}</p>
                          <p className="text-xs text-primary">
                            Learning Connection: {trip.learningConnection}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {packet.localExploration?.atHomeAlternatives?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">At-Home Alternatives</h4>
                    <ul className="space-y-2">
                      {packet.localExploration.atHomeAlternatives.map((alt, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 p-2 bg-muted/50 rounded">
                          <span className="text-primary">&#10148;</span>
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {packet.localExploration?.onlineResources?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Online Resources</h4>
                    <div className="space-y-2">
                      {packet.localExploration.onlineResources.map((resource, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm">{resource.title}</h5>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extensions */}
          <TabsContent value="extensions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5 text-indigo-600" />
                  Extension Activities
                </CardTitle>
                <CardDescription>Differentiated activities for every learner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {packet.extensions?.struggling?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold">Extra Support</h4>
                      <Badge variant="outline" className="text-amber-600 border-amber-300">Scaffolded</Badge>
                    </div>
                    <div className="space-y-2">
                      {packet.extensions.struggling.map((ext, i) => (
                        <div key={i} className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                          <h5 className="font-medium text-sm">{ext.activity}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{ext.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {packet.extensions?.onTrack?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold">Reinforcement</h4>
                      <Badge variant="outline" className="text-green-600 border-green-300">On Track</Badge>
                    </div>
                    <div className="space-y-2">
                      {packet.extensions.onTrack.map((ext, i) => (
                        <div key={i} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <h5 className="font-medium text-sm">{ext.activity}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{ext.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {packet.extensions?.advanced?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold">Challenge</h4>
                      <Badge variant="outline" className="text-blue-600 border-blue-300">Advanced</Badge>
                    </div>
                    <div className="space-y-2">
                      {packet.extensions.advanced.map((ext, i) => (
                        <div key={i} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <h5 className="font-medium text-sm">{ext.activity}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{ext.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Print view - hidden on screen, shown when printing */}
      <div className="hidden print:block">
        <LessonPacketPrintView packet={packet} />
      </div>
    </>
  )
}
