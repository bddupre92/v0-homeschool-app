"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import ComplianceDashboard from "@/components/compliance-dashboard"
import LogHoursDialog from "@/components/log-hours-dialog"
import PlanOverviewTab from "@/components/plan-overview-tab"
import PlanChildrenTab from "@/components/plan-children-tab"
import { useAuth } from "@/contexts/auth-context"
import { Clock, Sparkles, Bot } from "lucide-react"
import Link from "next/link"
import { DEMO_CHILDREN, DEMO_HOUR_SUMMARY, DEMO_FILINGS } from "@/lib/plan-data"

export default function PlanPage() {
  const { user } = useAuth()
  const [showLogHours, setShowLogHours] = useState(false)

  const stateAbbr = "WI"
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

          <TabsContent value="overview" className="space-y-6">
            <PlanOverviewTab
              children={DEMO_CHILDREN}
              hourSummary={DEMO_HOUR_SUMMARY}
              totalHours={totalHours}
              totalLessons={totalLessons}
            />
          </TabsContent>

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

          <TabsContent value="children" className="space-y-6">
            <PlanChildrenTab
              children={DEMO_CHILDREN}
              totalHours={totalHours}
              totalLessons={totalLessons}
              subjectCount={DEMO_HOUR_SUMMARY.length}
            />
          </TabsContent>
        </Tabs>

        <LogHoursDialog
          open={showLogHours}
          onOpenChange={setShowLogHours}
          children={DEMO_CHILDREN.map((c) => ({ id: c.id, name: c.name }))}
          onSubmit={(data) => {
            console.log("Log hours:", data)
          }}
        />
      </main>
    </div>
  )
}
