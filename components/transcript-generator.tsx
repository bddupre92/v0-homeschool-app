"use client"

import { useEffect, useState, useRef } from "react"
import { getChildren, getHourSummary, getFamilyBlueprint } from "@/app/actions/family-actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Printer, FileText, GraduationCap } from "lucide-react"

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
  last_logged: string
}

function getCurrentSchoolYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  // School year typically starts in August/September
  if (month >= 7) {
    return `${year}-${year + 1}`
  }
  return `${year - 1}-${year}`
}

function getSchoolYearOptions(): string[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const options: string[] = []
  for (let i = 0; i < 5; i++) {
    const startYear = currentYear - i
    options.push(`${startYear}-${startYear + 1}`)
  }
  return options
}

export function TranscriptGenerator() {
  const [open, setOpen] = useState(false)
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentSchoolYear())
  const [hourSummary, setHourSummary] = useState<HourSummaryRow[]>([])
  const [familyName, setFamilyName] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    async function fetchData() {
      setLoading(true)
      try {
        const [childrenData, blueprint] = await Promise.all([
          getChildren(),
          getFamilyBlueprint(),
        ])
        setChildren(childrenData as Child[])
        setFamilyName(blueprint?.family_name || "")
        if (childrenData.length > 0 && !selectedChildId) {
          setSelectedChildId(childrenData[0].id)
        }
      } catch (error) {
        console.error("Failed to load transcript data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [open])

  useEffect(() => {
    if (!selectedChildId || !open) return
    async function fetchHours() {
      setLoading(true)
      try {
        const summary = await getHourSummary(selectedChildId)
        setHourSummary(summary as HourSummaryRow[])
      } catch (error) {
        console.error("Failed to load hour summary:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHours()
  }, [selectedChildId, open])

  const selectedChild = children.find((c) => c.id === selectedChildId)
  const totalHours = hourSummary.reduce(
    (sum, row) => sum + parseFloat(String(row.total_hours)),
    0
  )
  const totalSessions = hourSummary.reduce(
    (sum, row) => sum + (row.session_count || 0),
    0
  )

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
          .transcript-print-area,
          .transcript-print-area * {
            visibility: visible !important;
          }
          .transcript-print-area {
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
            <FileText className="h-4 w-4" />
            Generate Transcript
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="no-print">
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Transcript Generator
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 no-print">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Student</label>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">School Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {getSchoolYearOptions().map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedChild && !loading && (
            <div ref={transcriptRef} className="transcript-print-area">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold">Official Homeschool Transcript</h1>
                    {familyName && (
                      <p className="text-lg text-muted-foreground">{familyName} Family</p>
                    )}
                    <p className="text-lg font-semibold">{selectedChild.name}</p>
                  </div>

                  <Separator />

                  {/* Student Info */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Student:</span>{" "}
                      {selectedChild.name}
                    </div>
                    {selectedChild.grade && (
                      <div>
                        <span className="font-medium">Grade:</span>{" "}
                        <Badge variant="secondary">{selectedChild.grade}</Badge>
                      </div>
                    )}
                    {selectedChild.age && (
                      <div>
                        <span className="font-medium">Age:</span> {selectedChild.age}
                      </div>
                    )}
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Academic Year:</span>{" "}
                    <Badge variant="outline">{selectedYear}</Badge>
                  </div>

                  <Separator />

                  {/* Subjects Table */}
                  {hourSummary.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-right">Total Hours</TableHead>
                          <TableHead className="text-right">Sessions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hourSummary.map((row) => (
                          <TableRow key={row.subject}>
                            <TableCell className="font-medium">{row.subject}</TableCell>
                            <TableCell className="text-right">
                              {parseFloat(String(row.total_hours)).toFixed(1)}
                            </TableCell>
                            <TableCell className="text-right">{row.session_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell className="font-bold">Total</TableCell>
                          <TableCell className="text-right font-bold">
                            {totalHours.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {totalSessions}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No hours logged for this student yet.
                    </p>
                  )}

                  <Separator />

                  {/* Footer */}
                  <div className="text-center text-xs text-muted-foreground space-y-1">
                    <p>Generated by A to Z Homeschool</p>
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading transcript data...</p>
            </div>
          )}

          {selectedChild && !loading && (
            <div className="flex justify-end no-print">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Transcript
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
