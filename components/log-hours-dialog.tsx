"use client"

/**
 * Log hours — Flow 01 from the AtoZ Family design handoff.
 * Chip-based pickers for kid, subject, and duration. Smart defaults
 * (most-recent kid, 30 min) so the common case is four taps to save.
 */

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Chip, KidChip } from "@/components/primitives"

const COMMON_SUBJECTS = [
  "Mathematics",
  "Language Arts",
  "Science",
  "Social Studies",
  "History",
  "Art",
  "Music",
  "Physical Education",
  "Reading",
  "Nature",
  "Health",
  "Life Skills",
  "Technology",
  "Foreign Language",
] as const

const QUICK_DURATIONS_MIN = [15, 30, 45, 60, 90] as const

// Sage, terracotta, honey, a soft teal, a muted plum. Keeps calm.
const KID_PALETTE = [
  "#d46e4d", // terracotta
  "#7d9e7d", // sage
  "#df8a27", // honey
  "#4a90a4", // teal
  "#8a6aa1", // plum
]

interface Child {
  id: string
  name: string
  color?: string
}

interface LogHoursDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: Child[]
  defaultKidId?: string
  defaultSubject?: string
  defaultMinutes?: number
  onSubmit: (data: {
    childId: string
    subject: string
    hours: number
    date: string
    notes?: string
  }) => void
}

function colorForKid(kid: Child, index: number): string {
  return kid.color ?? KID_PALETTE[index % KID_PALETTE.length]
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = min / 60
  return h % 1 === 0 ? `${h} hr` : `${h.toFixed(2).replace(/\.?0+$/, "")} hr`
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0]
}

export default function LogHoursDialog({
  open,
  onOpenChange,
  children: kids,
  defaultKidId,
  defaultSubject,
  defaultMinutes = 30,
  onSubmit,
}: LogHoursDialogProps) {
  const firstKidId = kids[0]?.id ?? ""

  const [childId, setChildId] = useState(defaultKidId ?? firstKidId)
  const [subject, setSubject] = useState(defaultSubject ?? "")
  const [minutes, setMinutes] = useState<number>(defaultMinutes)
  const [customMinutes, setCustomMinutes] = useState<string>("")
  const [showCustom, setShowCustom] = useState(false)
  const [date, setDate] = useState(todayIso())
  const [notes, setNotes] = useState("")

  // Reset form each time the dialog opens so smart defaults re-apply.
  useEffect(() => {
    if (!open) return
    setChildId(defaultKidId ?? firstKidId)
    setSubject(defaultSubject ?? "")
    setMinutes(defaultMinutes)
    setCustomMinutes("")
    setShowCustom(false)
    setDate(todayIso())
    setNotes("")
  }, [open, defaultKidId, firstKidId, defaultSubject, defaultMinutes])

  const effectiveMinutes = useMemo(() => {
    if (!showCustom) return minutes
    const parsed = Number.parseInt(customMinutes, 10)
    if (Number.isNaN(parsed)) return 0
    return Math.min(480, Math.max(1, parsed))
  }, [showCustom, customMinutes, minutes])

  const canSubmit = Boolean(childId && subject && effectiveMinutes > 0)

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      childId,
      subject,
      hours: effectiveMinutes / 60,
      date,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  const saveLabel = canSubmit
    ? `Save · ${formatDuration(effectiveMinutes)} of ${subject}`
    : "Save"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[520px] rounded-2xl bg-white p-0 gap-0 border-[var(--rule)]"
        aria-describedby={undefined}
      >
        <DialogHeader className="px-8 pt-8 pb-2 text-left space-y-1">
          <DialogTitle className="font-display text-3xl font-normal tracking-tight text-[var(--ink)]">
            Log learning
          </DialogTitle>
          <p className="text-sm text-[var(--ink-3)]">Tap any field to change it.</p>
        </DialogHeader>

        <div className="px-8 pb-6 space-y-5">
          {/* WHO */}
          <fieldset className="space-y-2">
            <legend className="atoz-eyebrow">Who</legend>
            <div className="flex flex-wrap gap-2">
              {kids.map((kid, i) => (
                <KidChip
                  key={kid.id}
                  name={kid.name}
                  color={colorForKid(kid, i)}
                  active={childId === kid.id}
                  onClick={() => setChildId(kid.id)}
                />
              ))}
              {kids.length === 0 && (
                <p className="text-sm text-[var(--ink-3)]">Add a child in Family to start logging.</p>
              )}
            </div>
          </fieldset>

          {/* SUBJECT */}
          <fieldset className="space-y-2">
            <legend className="atoz-eyebrow">Subject</legend>
            <div className="flex flex-wrap gap-2">
              {COMMON_SUBJECTS.map((s) => (
                <Chip
                  key={s}
                  active={subject === s}
                  tone={subject === s ? "terracotta" : "sage"}
                  onClick={() => setSubject(s)}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </fieldset>

          {/* DURATION */}
          <fieldset className="space-y-2">
            <legend className="atoz-eyebrow">Duration</legend>
            <div className="flex flex-wrap gap-2 items-center">
              {QUICK_DURATIONS_MIN.map((m) => (
                <Chip
                  key={m}
                  active={!showCustom && minutes === m}
                  onClick={() => {
                    setShowCustom(false)
                    setMinutes(m)
                  }}
                >
                  {formatDuration(m)}
                </Chip>
              ))}
              <Chip active={showCustom} onClick={() => setShowCustom(true)}>
                Custom
              </Chip>
              {showCustom && (
                <label className="flex items-center gap-2 ml-1">
                  <Input
                    type="number"
                    min={1}
                    max={480}
                    step={5}
                    inputMode="numeric"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="e.g. 25"
                    className="h-9 w-24"
                    aria-label="Custom duration in minutes"
                    autoFocus
                  />
                  <span className="text-sm text-[var(--ink-3)]">min</span>
                </label>
              )}
            </div>
          </fieldset>

          {/* NOTE + DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
            <div className="space-y-2">
              <label htmlFor="log-note" className="atoz-eyebrow block">
                What you did <span className="text-[var(--ink-4)] normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <Input
                id="log-note"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                placeholder="Paper pizzas, fractions…"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="log-date" className="atoz-eyebrow block">
                Date
              </label>
              <Input
                id="log-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={todayIso()}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-8 py-5 border-t border-[var(--rule)] bg-[var(--linen)]/40 rounded-b-2xl">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
          >
            {saveLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
