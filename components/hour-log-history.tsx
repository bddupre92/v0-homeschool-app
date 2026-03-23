"use client"

import { useEffect, useState, useCallback } from "react"
import { getHourLogs, getChildren, deleteHourLog } from "@/app/actions/family-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Clock, Trash2, Filter } from "lucide-react"

interface Child {
  id: string
  name: string
}

interface HourLog {
  id: string
  child_id: string
  child_name: string
  subject: string
  hours: number
  date: string
  notes?: string
}

type SortDirection = "asc" | "desc"

export function HourLogHistory() {
  const [logs, setLogs] = useState<HourLog[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Filters
  const [childFilter, setChildFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [childrenData, logsData] = await Promise.all([
        getChildren(),
        getHourLogs({
          childId: childFilter !== "all" ? childFilter : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ])
      setChildren(childrenData as Child[])
      setLogs(logsData as HourLog[])
    } catch (error) {
      console.error("Failed to load hour logs:", error)
    } finally {
      setLoading(false)
    }
  }, [childFilter, startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortDirection === "desc" ? dateB - dateA : dateA - dateB
  })

  const totalHours = logs.reduce((sum, log) => sum + parseFloat(String(log.hours)), 0)

  async function handleDelete(logId: string) {
    if (!confirm("Are you sure you want to delete this hour log entry?")) return
    setDeleting(logId)
    try {
      const result = await deleteHourLog(logId)
      if (result.success) {
        setLogs((prev) => prev.filter((l) => l.id !== logId))
      }
    } catch (error) {
      console.error("Failed to delete hour log:", error)
    } finally {
      setDeleting(null)
    }
  }

  function toggleSort() {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
  }

  function clearFilters() {
    setChildFilter("all")
    setStartDate("")
    setEndDate("")
  }

  const hasActiveFilters = childFilter !== "all" || startDate || endDate

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hour Log History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="min-w-[160px]">
            <label className="text-sm font-medium mb-1 block">
              <Filter className="h-3 w-3 inline mr-1" />
              Child
            </label>
            <Select value={childFilter} onValueChange={setChildFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All children" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading hour logs...</p>
          </div>
        ) : sortedLogs.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={toggleSort}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Date {sortDirection === "desc" ? "↓" : "↑"}
                    </button>
                  </TableHead>
                  <TableHead>Child</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.child_name}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.subject}</TableCell>
                    <TableCell className="text-right">
                      {parseFloat(String(log.hours)).toFixed(1)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {log.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(log.id)}
                        disabled={deleting === log.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Total ({sortedLogs.length} entries)
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {totalHours.toFixed(1)}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hour logs found.</p>
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
