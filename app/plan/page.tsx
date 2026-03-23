"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import ComplianceDashboard from "@/components/compliance-dashboard"
import LogHoursDialog from "@/components/log-hours-dialog"
import { useAuth } from "@/contexts/auth-context"
import {
  BarChart3, BookOpen, Calendar, Clock, GraduationCap,
  Shield, Target, TrendingUp, Sparkles, Bot
} from "lucide-react"
import Link from "next/link"

// Demo data for MVP display - in production these come from server actions
const DEMO_CHILDREN = [
  { id: "1", name: "Emma", age: 8, grade: "3rd", learningStyle: "Visual & Hands-On" },
  { id: "2", name: "Liam", age: 6, grade: "1st", learningStyle: "Kinesthetic" },
]

const DEMO_HOUR_SUMMARY = [
  { subject: "Reading", total_hours: 29.5, session_count: 28, last_logged: "2026-03-22" },
  { subject: "Language Arts", total_hours: 33, session_count: 25, last_logged: "2026-03-22" },
  { subject: "Mathematics", total_hours: 57.5, session_count: 40, last_logged: "2026-03-21" },
  { subject: "Social Studies", total_hours: 14.5, session_count: 12, last_logged: "2026-03-20" },
  { subject: "Science", total_hours: 63.5, session_count: 35, last_logged: "2026-03-22" },
  { subject: "Health", total_hours: 2.5, session_count: 5, last_logged: "2026-03-15" },
  { subject: "Physical Education", total_hours: 54.5, session_count: 50, last_logged: "2026-03-22" },
  { subject: "Art", total_hours: 16, session_count: 15, last_logged: "2026-03-19" },
  { subject: "Music", total_hours: 8.5, session_count: 10, last_logged: "2026-03-18" },
  { subject: "Technology", total_hours: 8.5, session_count: 8, last_logged: "2026-03-17" },
  { subject: "Life Skills", total_hours: 24, session_count: 20, last_logged: "2026-03-21" },
  { subject: "History", total_hours: 14.5, session_count: 12, last_logged: "2026-03-20" },
]

const DEMO_FILINGS = [
  { id: "1", filing_type: "Letter of Intent", status: "filed", due_date: "2025-09-01", filed_date: "2025-08-15" },
  { id: "2", filing_type: "Q1 Quarterly Report", status: "filed", due_date: "2025-12-31", filed_date: "2025-12-20" },
  { id: "3", filing_type: "Q2 Quarterly Report", status: "pending", due_date: "2026-03-31", filed_date: null },
  { id: "4", filing_type: "Annual Assessment", status: "pending", due_date: "2026-06-30", filed_date: null },
]

export default function PlanPage() {
  const { user } = useAuth()
  const [showLogHours, setShowLogHours] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string | null>(null)

  // In production, these would come from server actions
  const stateAbbr = "WI" // Would come from family blueprint
  const totalHours = DEMO_HOUR_SUMMARY.reduce((sum, h) => sum + h.total_hours, 0)
  const totalLessons = DEMO_HOUR_SUMMARY.reduce((sum, h) => sum + h.session_count, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Plan</h1>
            <p className="text-muted-foreground">Track progress, stay compliant, and plan your lessons.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowLogHours(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Log Hours
            </Button>
            <Button variant="outline" asChild>
              <Link href="/advisor">
                <Bot className="h-4 w-4 mr-2" />
                AI Advisor
              </Link>
            </Button>
            <Button asChild>
              <Link href="/planner">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Lesson
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
          </TabsList>

          {/* ─── Overview Tab ──────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{totalHours}h</p>
                    <p className="text-xs text-muted-foreground">This Year</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totalLessons}</p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">On Track</p>
                    <p className="text-xs text-muted-foreground">Compliance</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{DEMO_CHILDREN.length}</p>
                    <p className="text-xs text-muted-foreground">Children</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Today's Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm flex-1">Solar System Exploration</span>
                    <Badge variant="outline" className="text-xs">Science</Badge>
                    <span className="text-xs text-muted-foreground">Emma</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    <span className="text-sm flex-1">Fractions Through Baking</span>
                    <Badge variant="outline" className="text-xs">Math</Badge>
                    <span className="text-xs text-muted-foreground">Emma</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    <span className="text-sm flex-1">Journal: My Favorite Place</span>
                    <Badge variant="outline" className="text-xs">Language Arts</Badge>
                    <span className="text-xs text-muted-foreground">Liam</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Hours Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Subject Hours — This Year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {DEMO_HOUR_SUMMARY.sort((a, b) => b.total_hours - a.total_hours).map((item, idx) => {
                    const maxHours = Math.max(...DEMO_HOUR_SUMMARY.map(h => h.total_hours))
                    const pct = (item.total_hours / maxHours) * 100
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.subject}</span>
                          <span className="text-muted-foreground">
                            {item.total_hours}h · {item.session_count} {item.session_count === 1 ? "lesson" : "lessons"}
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Compliance Tab ────────────────────────────────────────── */}
          <TabsContent value="compliance">
            <ComplianceDashboard
              stateAbbreviation={stateAbbr}
              hourSummary={DEMO_HOUR_SUMMARY}
              totalHours={totalHours}
              filings={DEMO_FILINGS}
              onLogHours={() => setShowLogHours(true)}
              onAddFiling={(filing) => {
                console.log("Add filing:", filing)
              }}
            />
          </TabsContent>

          {/* ─── Children Tab ──────────────────────────────────────────── */}
          <TabsContent value="children" className="space-y-6">
            {DEMO_CHILDREN.map((child) => (
              <Card key={child.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <span>{child.name}</span>
                        <p className="text-sm font-normal text-muted-foreground">
                          {child.age} · Grade {child.grade} · {child.learningStyle}
                        </p>
                      </div>
                    </CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/family">Edit Profile</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold">
                        {(totalHours / DEMO_CHILDREN.length).toFixed(1)}h
                      </p>
                      <p className="text-xs text-muted-foreground">Hours This Year</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold">
                        {Math.round(totalLessons / DEMO_CHILDREN.length)}
                      </p>
                      <p className="text-xs text-muted-foreground">Lessons</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">On Track</p>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold">{DEMO_HOUR_SUMMARY.length}</p>
                      <p className="text-xs text-muted-foreground">Subjects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full border-dashed" asChild>
              <Link href="/family">
                <GraduationCap className="h-4 w-4 mr-2" />
                Manage Children Profiles
              </Link>
            </Button>
          </TabsContent>
        </Tabs>

        <LogHoursDialog
          open={showLogHours}
          onOpenChange={setShowLogHours}
          children={DEMO_CHILDREN.map(c => ({ id: c.id, name: c.name }))}
          onSubmit={(data) => {
            console.log("Log hours:", data)
          }}
        />
      </main>
    </div>
  )
}
