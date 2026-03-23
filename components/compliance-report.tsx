"use client"

import { useEffect, useState } from "react"
import {
  getComplianceFilings,
  getHourSummary,
  getTotalHoursThisYear,
  getFamilyBlueprint,
  getChildren,
} from "@/app/actions/family-actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Printer, Shield, CheckCircle2, AlertCircle } from "lucide-react"

interface Child {
  id: string
  name: string
  age?: number
  grade?: string
}

interface HourSummaryRow {
  subject: string
  total_hours: string | number
  session_count: number
}

interface Filing {
  id: string
  filing_type: string
  status: string
  due_date?: string
  filed_date?: string
  state_abbreviation: string
  notes?: string
}

interface StateRequirements {
  state: string
  stateName: string
  requiredSubjects: string[]
  requiredHours?: number
  filingRequirements?: string[]
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
}

function getStatusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
    case "filed":
      return "default"
    case "pending":
      return "secondary"
    case "overdue":
      return "destructive"
    default:
      return "outline"
  }
}

export function ComplianceReport() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [children, setChildren] = useState<Child[]>([])
  const [hourSummary, setHourSummary] = useState<HourSummaryRow[]>([])
  const [totalHours, setTotalHours] = useState<number>(0)
  const [filings, setFilings] = useState<Filing[]>([])
  const [familyName, setFamilyName] = useState<string>("")
  const [stateAbbr, setStateAbbr] = useState<string>("")
  const [stateRequirements, setStateRequirements] = useState<StateRequirements | null>(null)

  useEffect(() => {
    if (!open) return
    async function fetchData() {
      setLoading(true)
      try {
        const [filingsData, summary, hours, blueprint, childrenData] = await Promise.all([
          getComplianceFilings(),
          getHourSummary(),
          getTotalHoursThisYear(),
          getFamilyBlueprint(),
          getChildren(),
        ])

        setFilings(filingsData as Filing[])
        setHourSummary(summary as HourSummaryRow[])
        setTotalHours(hours)
        setFamilyName(blueprint?.family_name || "")
        setChildren(childrenData as Child[])

        const state = blueprint?.state_abbreviation || ""
        setStateAbbr(state)

        if (state) {
          try {
            const res = await fetch(`/api/state-requirements?state=${state}`)
            if (res.ok) {
              const data = await res.json()
              setStateRequirements(data)
            }
          } catch {
            // State requirements API may not be available
          }
        }
      } catch (error) {
        console.error("Failed to load compliance data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [open])

  const coveredSubjects = hourSummary.map((h) => h.subject.toLowerCase())
  const requiredSubjects = stateRequirements?.requiredSubjects || []
  const requiredHours = stateRequirements?.requiredHours || 0
  const hoursProgress = requiredHours > 0 ? Math.min((totalHours / requiredHours) * 100, 100) : 0

  function handlePrint() {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .compliance-print-area,
          .compliance-print-area * {
            visibility: visible !important;
          }
          .compliance-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 2rem !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Compliance Report
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="no-print">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Report
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading compliance data...</p>
            </div>
          )}

          {!loading && (
            <div className="compliance-print-area space-y-6">
              {/* Header */}
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold">Homeschool Compliance Report</h1>
                {stateAbbr && (
                  <p className="text-lg text-muted-foreground">
                    {STATE_NAMES[stateAbbr] || stateAbbr}
                  </p>
                )}
              </div>

              <Separator />

              {/* Family Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Family Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {familyName && (
                    <div>
                      <span className="font-medium">Family Name:</span> {familyName}
                    </div>
                  )}
                  {stateAbbr && (
                    <div>
                      <span className="font-medium">State:</span>{" "}
                      {STATE_NAMES[stateAbbr] || stateAbbr}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Report Date:</span>{" "}
                    {new Date().toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>

              {/* Hours Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hours Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Hours This Year</span>
                    <Badge variant="secondary" className="text-lg px-3">
                      {totalHours.toFixed(1)}
                    </Badge>
                  </div>
                  {requiredHours > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress toward {requiredHours} required hours</span>
                        <span>{hoursProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={hoursProgress} />
                    </div>
                  )}

                  {hourSummary.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-right">Hours</TableHead>
                          <TableHead className="text-right">Sessions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hourSummary.map((row) => (
                          <TableRow key={row.subject}>
                            <TableCell>{row.subject}</TableCell>
                            <TableCell className="text-right">
                              {parseFloat(String(row.total_hours)).toFixed(1)}
                            </TableCell>
                            <TableCell className="text-right">{row.session_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Required Subjects */}
              {requiredSubjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Required Subjects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {requiredSubjects.map((subject) => {
                        const isCovered = coveredSubjects.some(
                          (s) => s.includes(subject.toLowerCase()) || subject.toLowerCase().includes(s)
                        )
                        return (
                          <div
                            key={subject}
                            className="flex items-center gap-2 text-sm p-2 rounded-md border"
                          >
                            {isCovered ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                            )}
                            <span>{subject}</span>
                            {isCovered ? (
                              <Badge variant="default" className="ml-auto text-xs">
                                Covered
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="ml-auto text-xs">
                                Not Logged
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Filing Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Filing Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {filings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Filing Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Filed Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filings.map((filing) => (
                          <TableRow key={filing.id}>
                            <TableCell className="font-medium">{filing.filing_type}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(filing.status)}>
                                {filing.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {filing.due_date
                                ? new Date(filing.due_date).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              {filing.filed_date
                                ? new Date(filing.filed_date).toLocaleDateString()
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No compliance filings recorded.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Children Enrolled */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Children Enrolled</CardTitle>
                </CardHeader>
                <CardContent>
                  {children.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {children.map((child) => (
                        <div key={child.id} className="flex items-center gap-2 text-sm p-2 rounded-md border">
                          <span className="font-medium">{child.name}</span>
                          {child.grade && <Badge variant="secondary">{child.grade}</Badge>}
                          {child.age && (
                            <span className="text-muted-foreground ml-auto">Age {child.age}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No children enrolled.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>Generated by A to Z Homeschool</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {!loading && (
            <div className="flex justify-end no-print">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
