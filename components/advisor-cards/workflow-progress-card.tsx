"use client"

import { Check, Circle, Loader2, Clock, CalendarCheck, SkipForward } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { WorkflowPlan, WorkflowTask } from "@/lib/advisor-types"

const STATUS_CONFIG: Record<WorkflowTask["status"], { icon: typeof Check; label: string; color: string }> = {
  pending: { icon: Circle, label: "Waiting", color: "text-muted-foreground" },
  building: { icon: Loader2, label: "Building...", color: "text-blue-500" },
  awaiting_approval: { icon: Clock, label: "Review", color: "text-amber-500" },
  approved: { icon: Check, label: "Approved", color: "text-green-500" },
  scheduled: { icon: CalendarCheck, label: "Scheduled", color: "text-green-600" },
  skipped: { icon: SkipForward, label: "Skipped", color: "text-muted-foreground" },
}

interface WorkflowProgressCardProps {
  plan: WorkflowPlan
  onApprove?: (taskId: string) => void
  onSkip?: (taskId: string) => void
  onSchedule?: (taskId: string) => void
}

export function WorkflowProgressCard({ plan, onApprove, onSkip, onSchedule }: WorkflowProgressCardProps) {
  const completedCount = plan.tasks.filter(
    (t) => t.status === "approved" || t.status === "scheduled" || t.status === "skipped"
  ).length
  const totalCount = plan.tasks.length

  return (
    <Card className="border-purple-500/20 overflow-hidden">
      <CardHeader className="pb-2 bg-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {plan.title}
          </div>
          <Badge variant="outline" className="text-xs">
            {completedCount}/{totalCount} complete
          </Badge>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-3 space-y-1.5">
        {plan.tasks.map((task) => {
          const config = STATUS_CONFIG[task.status]
          const Icon = config.icon
          const isCurrent = task.status === "building" || task.status === "awaiting_approval"

          return (
            <div
              key={task.id}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors ${
                isCurrent ? "bg-muted/50" : ""
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${config.color} ${
                  task.status === "building" ? "animate-spin" : ""
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {task.childName} — {task.subject}
                </p>
                {task.lessonCount !== undefined && task.lessonCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {task.lessonCount} {task.lessonCount === 1 ? "lesson" : "lessons"}
                  </p>
                )}
              </div>
              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>

              {/* Action buttons for awaiting_approval tasks */}
              {task.status === "awaiting_approval" && (
                <div className="flex items-center gap-1 shrink-0">
                  {onApprove && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onApprove(task.id)}
                    >
                      <Check className="h-3 w-3 mr-0.5" /> Approve
                    </Button>
                  )}
                  {onSkip && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs text-muted-foreground hover:bg-muted"
                      onClick={() => onSkip(task.id)}
                    >
                      Skip
                    </Button>
                  )}
                </div>
              )}

              {/* Schedule button for approved tasks */}
              {task.status === "approved" && onSchedule && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0"
                  onClick={() => onSchedule(task.id)}
                >
                  <CalendarCheck className="h-3 w-3 mr-0.5" /> Schedule
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
