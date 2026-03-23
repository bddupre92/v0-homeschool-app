"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle, Clock, FileText, Plus, Shield } from "lucide-react"

interface StateRequirements {
  state_abbreviation: string
  state_name: string
  subjects_required: string[]
  hours_per_year: number | null
  attendance_rules: string | null
  assessment_requirements: string | null
  record_keeping_requirements: string | null
}

interface HourSummary {
  subject: string
  total_hours: number
  session_count: number
  last_logged: string
}

interface ComplianceFiling {
  id: string
  filing_type: string
  status: string
  due_date: string | null
  filed_date: string | null
}

interface StateFilingType {
  id: string
  filing_name: string
  description?: string
  frequency?: string
  typical_due_description?: string
  is_required?: boolean
  notes?: string
}

interface ComplianceDashboardProps {
  stateAbbreviation?: string
  hourSummary?: HourSummary[]
  totalHours?: number
  filings?: ComplianceFiling[]
  stateFilingTypes?: StateFilingType[]
  onLogHours?: () => void
  onAddFiling?: (filing: { filingType: string; dueDate?: string }) => void
}

export default function ComplianceDashboard({
  stateAbbreviation,
  hourSummary = [],
  totalHours = 0,
  filings = [],
  stateFilingTypes = [],
  onLogHours,
  onAddFiling,
}: ComplianceDashboardProps) {
  const [stateReqs, setStateReqs] = useState<StateRequirements | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFilingDialog, setShowFilingDialog] = useState(false)
  const [newFilingType, setNewFilingType] = useState("")
  const [newFilingDate, setNewFilingDate] = useState("")

  useEffect(() => {
    if (stateAbbreviation) {
      setLoading(true)
      fetch(`/api/state-requirements?state=${stateAbbreviation}`)
        .then(r => r.json())
        .then(data => {
          if (!data.error) setStateReqs(data)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [stateAbbreviation])

  if (!stateAbbreviation) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Set Your State</h3>
          <p className="text-muted-foreground mb-4">
            Go to Family Setup to select your home state. We'll automatically track your compliance requirements.
          </p>
          <Button variant="outline" asChild>
            <a href="/family">Set Up Family Profile</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const requiredHours = stateReqs?.hours_per_year || 0
  const hoursProgress = requiredHours > 0 ? Math.min((totalHours / requiredHours) * 100, 100) : 0
  const requiredSubjects = stateReqs?.subjects_required || []
  const coveredSubjects = hourSummary.map(h => h.subject.toLowerCase())
  const subjectsCovered = requiredSubjects.filter(s =>
    coveredSubjects.some(cs => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
  ).length

  const filingsByStatus = {
    filed: filings.filter(f => f.status === "filed"),
    pending: filings.filter(f => f.status === "pending"),
    overdue: filings.filter(f => f.status === "pending" && f.due_date && new Date(f.due_date) < new Date()),
  }

  const handleAddFiling = () => {
    if (newFilingType && onAddFiling) {
      onAddFiling({ filingType: newFilingType, dueDate: newFilingDate || undefined })
      setNewFilingType("")
      setNewFilingDate("")
      setShowFilingDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* State Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Compliance Planning</CardTitle>
                <CardDescription>{stateReqs?.state_name || stateAbbreviation}</CardDescription>
              </div>
            </div>
            <Badge variant={hoursProgress >= 100 && subjectsCovered >= requiredSubjects.length ? "default" : "secondary"}>
              {hoursProgress >= 100 && subjectsCovered >= requiredSubjects.length ? "On Track" : "In Progress"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hours Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hours & Days Planning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Total Hours</span>
                <span className="font-semibold">
                  {totalHours} of {requiredHours > 0 ? `${requiredHours} required` : "N/A"}
                </span>
              </div>
              {requiredHours > 0 && (
                <Progress value={hoursProgress} className="h-3" />
              )}
            </div>

            {requiredHours > 0 && (
              <>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Hours logged</span>
                    <span>{totalHours}h logged</span>
                  </div>
                  {totalHours < requiredHours && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span className="text-xs">
                        {Math.ceil((requiredHours - totalHours) / 36)} hrs/week needed to stay on pace
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            <Button size="sm" className="w-full" onClick={onLogHours}>
              <Plus className="h-4 w-4 mr-2" />
              Log Hours
            </Button>
          </CardContent>
        </Card>

        {/* Required Subjects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Required Subjects</CardTitle>
              <span className="text-sm text-muted-foreground">
                {subjectsCovered} of {requiredSubjects.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {requiredSubjects.length > 0 ? (
              <div className="space-y-2">
                {requiredSubjects.map((subject, idx) => {
                  const matched = coveredSubjects.some(cs =>
                    cs.includes(subject.toLowerCase()) || subject.toLowerCase().includes(cs)
                  )
                  const subjectHours = hourSummary.find(h =>
                    h.subject.toLowerCase().includes(subject.toLowerCase()) ||
                    subject.toLowerCase().includes(h.subject.toLowerCase())
                  )
                  return (
                    <div key={idx} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        {matched ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className={`text-sm ${matched ? "" : "text-muted-foreground"}`}>{subject}</span>
                      </div>
                      {subjectHours && (
                        <span className="text-xs text-muted-foreground">
                          {subjectHours.total_hours}h logged
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific subject requirements for this state.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filings & Deadlines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Filings & Deadlines
            </CardTitle>
            <Dialog open={showFilingDialog} onOpenChange={setShowFilingDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Compliance Filing</DialogTitle>
                  <DialogDescription>Track a filing or deadline for your state.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Filing Type</Label>
                    <Input
                      placeholder="e.g., Letter of Intent, Quarterly Report"
                      value={newFilingType}
                      onChange={(e) => setNewFilingType(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date (optional)</Label>
                    <Input
                      type="date"
                      value={newFilingDate}
                      onChange={(e) => setNewFilingDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddFiling} disabled={!newFilingType} className="w-full">
                    Add Filing
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filings.length > 0 ? (
            <div className="space-y-2">
              {filings.map((filing, idx) => (
                <div key={filing.id || idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {filing.status === "filed" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : filing.due_date && new Date(filing.due_date) < new Date() ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{filing.filing_type}</p>
                      {filing.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(filing.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={filing.status === "filed" ? "default" : "secondary"}>
                    {filing.status === "filed" ? "Filed" : filing.due_date && new Date(filing.due_date) < new Date() ? "Overdue" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No filings tracked yet.</p>
              <p className="text-xs mt-1">
                {stateReqs?.record_keeping_requirements
                  ? `Your state requires: ${stateReqs.record_keeping_requirements.substring(0, 100)}...`
                  : "Add your state's required filings to stay on track."
                }
              </p>
            </div>
          )}

          {/* State Requirements Info */}
          {(stateReqs?.assessment_requirements || stateReqs?.attendance_rules) && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                {stateReqs.attendance_rules && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Attendance Rules</p>
                    <p className="text-sm mt-1">{stateReqs.attendance_rules}</p>
                  </div>
                )}
                {stateReqs.assessment_requirements && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assessment Requirements</p>
                    <p className="text-sm mt-1">{stateReqs.assessment_requirements}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* State-Specific Filing Requirements */}
      {stateFilingTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {stateReqs?.state_name || stateAbbreviation} Filing Requirements
            </CardTitle>
            <CardDescription>
              Required filings and deadlines for your state. Add these to your tracking above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stateFilingTypes.map((filing) => {
                const isTracked = filings.some(
                  (f) => f.filing_type.toLowerCase() === filing.filing_name.toLowerCase()
                )
                return (
                  <div
                    key={filing.id}
                    className="border rounded-lg p-3 space-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{filing.filing_name}</span>
                        {filing.is_required && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Required
                          </Badge>
                        )}
                        {filing.frequency && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                            {filing.frequency}
                          </Badge>
                        )}
                      </div>
                      {isTracked ? (
                        <Badge variant="secondary" className="text-xs">Tracking</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => onAddFiling?.({ filingType: filing.filing_name })}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Track
                        </Button>
                      )}
                    </div>
                    {filing.description && (
                      <p className="text-xs text-muted-foreground">{filing.description}</p>
                    )}
                    {filing.typical_due_description && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {filing.typical_due_description}
                      </p>
                    )}
                    {filing.notes && (
                      <p className="text-xs text-muted-foreground italic">{filing.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
