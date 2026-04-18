"use client"

/**
 * Flow 02 Step 2 — Schedule a lesson onto Today/Tomorrow/This week/Pick a date.
 * Drafts stay hidden from kids; scheduling converts to status=scheduled.
 */

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type Lesson, upsertLesson } from "@/lib/atoz-store"
import { Check } from "lucide-react"

interface LessonScheduleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: Lesson | null
  onScheduled?: (lesson: Lesson) => void
}

type Pick = "today" | "tomorrow" | "week" | "custom"

function formatSlot(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function nextRoundedSlot(offsetDays = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return d
}

export default function LessonScheduleSheet({
  open,
  onOpenChange,
  lesson,
  onScheduled,
}: LessonScheduleSheetProps) {
  const [pick, setPick] = useState<Pick>("today")
  const [customIso, setCustomIso] = useState<string>("")

  const slots = useMemo(
    () => ({
      today: nextRoundedSlot(0),
      tomorrow: nextRoundedSlot(1),
    }),
    [],
  )

  if (!lesson) return null

  const handleConfirm = () => {
    let scheduledFor: string | undefined
    if (pick === "today") scheduledFor = slots.today.toISOString()
    else if (pick === "tomorrow") scheduledFor = slots.tomorrow.toISOString()
    else if (pick === "week") {
      const d = nextRoundedSlot(2)
      d.setHours(10, 0, 0, 0)
      scheduledFor = d.toISOString()
    } else if (pick === "custom") {
      if (!customIso) return
      scheduledFor = new Date(customIso).toISOString()
    }

    const saved = upsertLesson({
      ...lesson,
      status: "scheduled",
      scheduledFor,
    })
    onScheduled?.(saved)
    onOpenChange(false)
  }

  const handleSaveDraft = () => {
    const saved = upsertLesson({ ...lesson, status: "draft", scheduledFor: undefined })
    onScheduled?.(saved)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] rounded-2xl bg-white p-0 gap-0 border-[var(--rule)]"
        aria-describedby={undefined}
      >
        <DialogHeader className="px-8 pt-8 pb-2 text-left space-y-1">
          <DialogTitle className="font-display text-2xl font-normal tracking-tight text-[var(--ink)]">
            When?
          </DialogTitle>
          <p className="text-sm text-[var(--ink-3)]">
            Pick a time for <strong className="text-[var(--ink)]">{lesson.title || "this lesson"}</strong>.
          </p>
        </DialogHeader>

        <div className="px-8 pb-6 space-y-2">
          <SlotRow
            active={pick === "today"}
            onClick={() => setPick("today")}
            title={`Today · ${slots.today.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`}
            sub="Suggested slot"
            featured
          />
          <SlotRow
            active={pick === "tomorrow"}
            onClick={() => setPick("tomorrow")}
            title={`Tomorrow · ${slots.tomorrow.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`}
            sub="Same time"
          />
          <SlotRow
            active={pick === "week"}
            onClick={() => setPick("week")}
            title="Sometime this week"
            sub="We'll suggest a good slot"
          />
          <SlotRow
            active={pick === "custom"}
            onClick={() => setPick("custom")}
            title="Pick a date"
            sub="Open a date picker"
          />
          {pick === "custom" && (
            <div className="pt-2">
              <Input
                type="datetime-local"
                value={customIso}
                onChange={(e) => setCustomIso(e.target.value)}
              />
            </div>
          )}
          {pick !== "custom" && pick !== "week" && (
            <p className="pt-1 text-xs text-[var(--ink-3)]">
              Will schedule for <strong>{formatSlot(slots[pick])}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-8 py-5 border-t border-[var(--rule)] bg-[var(--linen)]/40 rounded-b-2xl">
          <Button variant="ghost" onClick={handleSaveDraft}>
            Save as draft instead
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={pick === "custom" && !customIso}
            className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
          >
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SlotRow({
  active,
  onClick,
  title,
  sub,
  featured,
}: {
  active: boolean
  onClick: () => void
  title: string
  sub?: string
  featured?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition",
        active
          ? "border-[var(--sage-dd)] bg-[var(--sage-ll)]"
          : featured
            ? "border-[var(--sage-l)] bg-[var(--sage-ll)]/50 hover:bg-[var(--sage-ll)]"
            : "border-[var(--rule)] bg-white hover:bg-[var(--linen-2)]/50",
      ].join(" ")}
    >
      <div>
        <div className="font-display text-base font-medium text-[var(--ink)]">{title}</div>
        {sub && <div className="text-xs text-[var(--ink-3)] mt-0.5">{sub}</div>}
      </div>
      <span
        className={[
          "w-5 h-5 rounded-full border flex items-center justify-center",
          active
            ? "bg-[var(--sage-dd)] border-[var(--sage-dd)] text-white"
            : "border-[var(--rule-2)]",
        ].join(" ")}
        aria-hidden="true"
      >
        {active && <Check size={12} strokeWidth={3} />}
      </span>
    </button>
  )
}
