"use client"

import { useState, useEffect, useCallback } from "react"
import Navigation from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import ComplianceDashboard from "@/components/compliance-dashboard"
import LogHoursDialog from "@/components/log-hours-dialog"
import PlanOverviewTab from "@/components/plan-overview-tab"
import PlanChildrenTab from "@/components/plan-children-tab"
import { TranscriptGenerator } from "@/components/transcript-generator"
import { ComplianceReport } from "@/components/compliance-report"
import { HourLogHistory } from "@/components/hour-log-history"
import { useAuth } from "@/contexts/auth-context"
import { Clock, Sparkles, Bot, Loader2, FileText, History } from "lucide-react"
import Link from "next/link"
import {
  getChildren,
  getHourSummary,
  getTotalHoursThisYear,
  getComplianceFilings,
  getFamilyBlueprint,
  logHours,
  deleteHourLog,
  saveComplianceFiling,
} from "@/app/actions/family-actions"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function PlanPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showLogHours, setShowLogHours] = useState(false)
  const [showHourHistory, setShowHourHistory] = useState(false)
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
      const child = children.find((c) => c.id === data.childId)
      const kidName = child?.name ?? "learner"
      const minutes = Math.round(data.hours * 60)
      const durationLabel =
        minutes < 60 ? `${minutes} min` : `${(minutes / 60).toFixed(2).replace(/\.?0+$/, "")} hr`
      const loggedId: string | undefined = result.data?.id

      toast({
        title: "Logged",
        description: `${durationLabel} of ${data.subject} for ${kidName}.`,
        duration: 5000,
        action: loggedId ? (
          <ToastAction
            altText="Undo log"
            onClick={async () => {
              const undo = await deleteHourLog(loggedId)
              if (undo.success) {
                toast({ title: "Undone", description: "Log removed.", duration: 2500 })
                loadData()
              }
            }}
          >
            Undo
          </ToastAction>
        ) : undefined,
      })
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
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowLogHours(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Log Hours
            </Button>
            <Button variant="outline" onClick={() => setShowHourHistory(true)}>
              <History className="h-4 w-4 mr-2" />
              Hour History
            </Button>
            <TranscriptGenerator />
            <ComplianceReport />
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

        {showHourHistory && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Hour Log History</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHourHistory(false)}>Close</Button>
              </div>
              <div className="p-4">
                <HourLogHistory />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
