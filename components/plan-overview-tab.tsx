"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, BookOpen } from "lucide-react"
import type { DemoChild, HourSummary } from "@/lib/plan-data"

interface PlanOverviewTabProps {
  children: DemoChild[]
  hourSummary: HourSummary[]
  totalHours: number
  totalLessons: number
}

export default function PlanOverviewTab({ children, hourSummary, totalHours, totalLessons }: PlanOverviewTabProps) {
  return (
    <div className="space-y-6">
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
              <p className="text-2xl font-bold">{children.length}</p>
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
            Today&apos;s Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No lessons scheduled for today. Head to the Planner to add some!
          </p>
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
            {[...hourSummary].sort((a, b) => b.total_hours - a.total_hours).map((item, idx) => {
              const maxHours = Math.max(...hourSummary.map((h) => h.total_hours))
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
    </div>
  )
}
