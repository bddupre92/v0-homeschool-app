"use client"

import { useState, useEffect, useCallback } from "react"
import Navigation from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import ComplianceDashboard from "@/components/compliance-dashboard"
import LogHoursDialog from "@/components/log-hours-dialog"
import PlanOverviewTab from "@/components/plan-overview-tab"
import PlanChildrenTab from "@/components/plan-children-tab"
import { useAuth } from "@/contexts/auth-context"
import { Clock, Sparkles, Bot, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  getChildren,
  getHourSummary,
  getTotalHoursThisYear,
  getComplianceFilings,
  getFamilyBlueprint,
  logHours,
  saveComplianceFiling,
} from "@/app/actions/family-actions"
import { useToast } from "@/hooks/use-toast"

export default function PlanPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showLogHours, setShowLogHours] = useState(false)
  const [loading, setLoading] = useState(true)

  // Real data state
  const [children, setChildren] = useState<any[]>([])
  const [hourSummary, setHourSummary] = useState<any[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [filings, setFilings] = useState<any[]>([])
  const [stateAbbr, setStateAbbr] = useState<string | undefined>()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [childrenData, hourData, totalHoursData, filingsData, blueprint] = await Promise.all([
        getChildren(),
        getHourSummary(),
        getTotalHoursThisYear(),
        getComplianceFilings(),
        getFamilyBlueprint(),
      ])
      setChildren(childrenData)
      setHourSummary(hourData)
      setTotalHours(totalHoursData)
      setFilings(filingsData)
      setStateAbbr(blueprint?.state_abbreviation || undefined)
    } catch (error) {
      console.error("Failed to load plan data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalLessons = hourSummary.reduce((sum: number, h: any) => sum + (h.session_count || 0), 0)

  const handleLogHours = async (data: {
    childId: string
    subject: string
    hours: number
    date: string
    notes?: string
  }) => {
    const result = await logHours(data)
    if (result.success) {
      toast({ title: "Hours logged", description: `${data.hours}h of ${data.subject} recorded.` })
      loadData()
    } else {
      toast({ title: "Error", description: "Failed to log hours. Please try again.", variant: "destructive" })
    }
  }

  const handleAddFiling = async (filing: { filingType: string; dueDate?: string }) => {
    if (!stateAbbr) {
      toast({
        title: "State not set",
        description: "Please set your state in Family Setup first.",
        variant: "destructive",
      })
      return
    }
    const result = await saveComplianceFiling({
      stateAbbreviation: stateAbbr,
      filingType: filing.filingType,
      dueDate: filing.dueDate,
    })
    if (result.success) {
      toast({ title: "Filing added", description: `${filing.filingType} has been added to your tracking.` })
      loadData()
    } else {
      toast({ title: "Error", description: "Failed to add filing. Please try again.", variant: "destructive" })
    }
  }

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="children">Children</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <PlanOverviewTab
                children={children.map((c) => ({
                  id: c.id,
                  name: c.name,
                  age: c.age || 0,
                  grade: c.grade || "",
                  learningStyle: c.learning_style || "",
                }))}
                hourSummary={hourSummary.map((h) => ({
                  subject: h.subject,
                  total_hours: parseFloat(h.total_hours) || 0,
                  session_count: parseInt(h.session_count) || 0,
                  last_logged: h.last_logged || "",
                }))}
                totalHours={totalHours}
                totalLessons={totalLessons}
              />
            </TabsContent>

            <TabsContent value="compliance">
              <ComplianceDashboard
                stateAbbreviation={stateAbbr}
                hourSummary={hourSummary.map((h) => ({
                  subject: h.subject,
                  total_hours: parseFloat(h.total_hours) || 0,
                  session_count: parseInt(h.session_count) || 0,
                  last_logged: h.last_logged || "",
                }))}
                totalHours={totalHours}
                filings={filings.map((f) => ({
                  id: f.id,
                  filing_type: f.filing_type,
                  status: f.status,
                  due_date: f.due_date,
                  filed_date: f.filed_date,
                }))}
                onLogHours={() => setShowLogHours(true)}
                onAddFiling={handleAddFiling}
                onRefresh={loadData}
              />
            </TabsContent>

            <TabsContent value="children" className="space-y-6">
              <PlanChildrenTab
                children={children.map((c) => ({
                  id: c.id,
                  name: c.name,
                  age: c.age || 0,
                  grade: c.grade || "",
                  learningStyle: c.learning_style || "",
                }))}
                totalHours={totalHours}
                totalLessons={totalLessons}
                subjectCount={hourSummary.length}
              />
            </TabsContent>
          </Tabs>
        )}

        <LogHoursDialog
          open={showLogHours}
          onOpenChange={setShowLogHours}
          children={children.map((c) => ({ id: c.id, name: c.name }))}
          onSubmit={handleLogHours}
        />
      </main>
    </div>
  )
}
