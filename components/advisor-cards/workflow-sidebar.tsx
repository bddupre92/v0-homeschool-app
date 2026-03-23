"use client"

import { Check, Circle, Loader2, Clock, CalendarCheck, SkipForward, X, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { WorkflowPlan, WorkflowTask } from "@/lib/advisor-types"

const STATUS_CONFIG: Record<WorkflowTask["status"], { icon: typeof Check; label: string; color: string; bg: string }> = {
  pending: { icon: Circle, label: "Waiting", color: "text-muted-foreground", bg: "" },
  building: { icon: Loader2, label: "Building...", color: "text-blue-500", bg: "bg-blue-500/5" },
  awaiting_approval: { icon: Clock, label: "Needs Review", color: "text-amber-500", bg: "bg-amber-500/5" },
  approved: { icon: Check, label: "Approved", color: "text-green-500", bg: "bg-green-500/5" },
  scheduled: { icon: CalendarCheck, label: "Scheduled", color: "text-green-600", bg: "bg-green-500/5" },
  skipped: { icon: SkipForward, label: "Skipped", color: "text-muted-foreground", bg: "" },
}

interface WorkflowSidebarProps {
  plan: WorkflowPlan
  onClose: () => void
  onApprove?: (taskId: string) => void
  onSkip?: (taskId: string) => void
  onSchedule?: (taskId: string) => void
}

export function WorkflowSidebar({ plan, onClose, onApprove, onSkip, onSchedule }: WorkflowSidebarProps) {
  const completedCount = plan.tasks.filter(
    (t) => t.status === "approved" || t.status === "scheduled" || t.status === "skipped"
  ).length
  const totalCount = plan.tasks.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Group tasks by child
  const tasksByChild: Record<string, WorkflowTask[]> = {}
  for (const task of plan.tasks) {
    if (!tasksByChild[task.childName]) {
      tasksByChild[task.childName] = []
    }
    tasksByChild[task.childName].push(task)
  }

  return (
    <div className="w-72 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-semibold">Build Progress</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-b shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">{plan.title}</span>
          <span className="text-xs font-medium">{percentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-muted-foreground">
            {completedCount} of {totalCount} tasks
          </span>
          {completedCount === totalCount && totalCount > 0 && (
            <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              All done!
            </Badge>
          )}
        </div>
      </div>

      {/* Task list by child */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-3 space-y-4">
          {Object.entries(tasksByChild).map(([childName, tasks]) => (
            <div key={childName}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {childName}
              </h4>
              <div className="space-y-1">
                {tasks.map((task) => {
                  const config = STATUS_CONFIG[task.status]
                  const Icon = config.icon
                  const isCurrent = task.status === "building" || task.status === "awaiting_approval"

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-2 p-2 rounded-md ${config.bg} ${
                        isCurrent ? "ring-1 ring-inset ring-current/10" : ""
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${config.color} ${
                          task.status === "building" ? "animate-spin" : ""
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{task.subject}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[10px] ${config.color}`}>{config.label}</span>
                          {task.lessonCount !== undefined && task.lessonCount > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              · {task.lessonCount} lessons
                            </span>
                          )}
                        </div>

                        {/* Inline actions */}
                        {task.status === "awaiting_approval" && (
                          <div className="flex items-center gap-1 mt-1">
                            {onApprove && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] text-green-600 border-green-200"
                                onClick={() => onApprove(task.id)}
                              >
                                Approve
                              </Button>
                            )}
                            {onSkip && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 px-1.5 text-[10px]"
                                onClick={() => onSkip(task.id)}
                              >
                                Skip
                              </Button>
                            )}
                          </div>
                        )}
                        {task.status === "approved" && onSchedule && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-5 px-1.5 text-[10px] text-blue-600 border-blue-200 mt-1"
                            onClick={() => onSchedule(task.id)}
                          >
                            Schedule
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
