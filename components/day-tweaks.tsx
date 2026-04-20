"use client"

/**
 * Day tweaks — lightweight drawer on /today for per-day adjustments.
 * Mark today as a quiet day, or hide specific subjects just for
 * today. Persists to atoz-store keyed by date so yesterday's tweaks
 * don't bleed into tomorrow.
 */

import { useEffect, useState } from "react"
import { Settings2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getDayTweaks, setDayTweaks, type DayTweaks } from "@/lib/atoz-store"

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function DayTweaks({
  dateKey,
  subjects,
  onChange,
}: {
  dateKey: string
  subjects: string[]
  onChange?: (next: DayTweaks) => void
}) {
  const [open, setOpen] = useState(false)
  const [tweaks, setTweaks] = useState<DayTweaks>({})

  useEffect(() => {
    setTweaks(getDayTweaks(dateKey))
  }, [dateKey])

  const update = (patch: DayTweaks) => {
    const next = { ...tweaks, ...patch }
    setTweaks(next)
    setDayTweaks(dateKey, next)
    onChange?.(next)
  }

  const toggleSubject = (subject: string, skipped: boolean) => {
    const current = new Set(tweaks.skipSubjects ?? [])
    if (skipped) current.add(subject)
    else current.delete(subject)
    update({ skipSubjects: Array.from(current) })
  }

  const reset = () => {
    setTweaks({})
    setDayTweaks(dateKey, {})
    onChange?.({})
  }

  const activeCount =
    (tweaks.quietDay ? 1 : 0) + (tweaks.skipSubjects?.length ?? 0)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-[var(--rule)] relative"
        >
          <Settings2 size={14} className="mr-1" aria-hidden="true" />
          Tweaks
          {activeCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-[var(--sage-dd)] text-white text-[10px] w-4 h-4">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Today's tweaks</SheetTitle>
          <SheetDescription>
            Quiet adjustments for today only. Tomorrow starts fresh.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Label htmlFor="quiet-day" className="text-sm font-medium">
                Quiet day
              </Label>
              <p className="text-xs text-[var(--ink-3)] mt-1">
                Hide today's lessons. Rest is learning too.
              </p>
            </div>
            <Switch
              id="quiet-day"
              checked={tweaks.quietDay === true}
              onCheckedChange={(v) => update({ quietDay: v })}
            />
          </div>

          {subjects.length > 0 && (
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium">Skip subjects today</div>
                <p className="text-xs text-[var(--ink-3)] mt-1">
                  Hide lessons for selected subjects. Still counts as a day off for those.
                </p>
              </div>
              <div className="space-y-2">
                {subjects.map((subject) => {
                  const skipped = tweaks.skipSubjects?.includes(subject) ?? false
                  return (
                    <div key={subject} className="flex items-center gap-2">
                      <Checkbox
                        id={`skip-${subject}`}
                        checked={skipped}
                        onCheckedChange={(v) => toggleSubject(subject, v === true)}
                      />
                      <Label
                        htmlFor={`skip-${subject}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {subject}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[var(--rule)]">
            <Button variant="ghost" size="sm" onClick={reset} disabled={activeCount === 0}>
              Reset today
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
