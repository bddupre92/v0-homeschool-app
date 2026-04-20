"use client"

/**
 * Log hours — Flow 01 from the AtoZ Family design handoff.
 * Chip-based pickers for kid, subject, and duration. Smart defaults
 * (most-recent kid, 30 min) so the common case is four taps to save.
 * Also accepts natural-language input ("Emma did 40 min of math…")
 * via the "Type it" mode at the top.
 */

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Chip, KidChip } from "@/components/primitives"
import { Sparkles } from "lucide-react"
import { parseQuickLog, type ParsedLogEntry } from "@/lib/quick-log-parser"
import type { Kid } from "@/lib/atoz-store"

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
  const [nlExpanded, setNlExpanded] = useState(false)
  const [nlText, setNlText] = useState("")

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
    setNlExpanded(false)
    setNlText("")
  }, [open, defaultKidId, firstKidId, defaultSubject, defaultMinutes])

  const parsed = useMemo(() => {
    if (!nlText.trim()) return null
    return parseQuickLog(nlText, kids as Kid[])
  }, [nlText, kids])

  const commitParsed = () => {
    if (!parsed) return
    for (const entry of parsed.entries) {
      const kidId = entry.kidId ?? childId
      if (!kidId || !entry.subject || entry.minutes <= 0) continue
      onSubmit({
        childId: kidId,
        subject: entry.subject,
        hours: entry.minutes / 60,
        date,
        notes: entry.notes,
      })
    }
    onOpenChange(false)
  }

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
          {/* QUICK-TYPE (NL) */}
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--linen)]/40">
            <button
              type="button"
              onClick={() => setNlExpanded((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left"
              aria-expanded={nlExpanded}
            >
              <Sparkles size={14} className="text-[var(--sage-dd)]" aria-hidden="true" />
              <span className="font-medium text-[var(--ink-2)]">Type it out</span>
              <span className="text-xs text-[var(--ink-3)] ml-auto">
                {nlExpanded ? "Tap to collapse" : 'e.g. "Emma did 40 min of math"'}
              </span>
            </button>
            {nlExpanded && (
              <div className="px-4 pb-4 space-y-2">
                <Textarea
                  value={nlText}
                  onChange={(e) => setNlText(e.target.value.slice(0, 500))}
                  rows={2}
                  placeholder={`"Emma did 40 min of math and we read Charlotte's Web for 20"`}
                  className="resize-none"
                />
                {parsed && parsed.entries.length > 0 && (
                  <div className="space-y-2">
                    <div className="atoz-eyebrow">We heard</div>
                    <ul className="space-y-1 text-sm text-[var(--ink-2)]">
                      {parsed.entries.map((e, i) => (
                        <li key={i} className="flex items-baseline gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage-d)] flex-shrink-0" />
                          <span>
                            <strong>{e.kidName ?? "Someone"}</strong> · {e.subject} ·{" "}
                            {e.minutes < 60 ? `${e.minutes} min` : `${(e.minutes / 60).toFixed(1).replace(/\.0$/, "")} hr`}
                            {e.notes ? ` · ${e.notes}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {!parsed.hasUsableEntry && (
                      <p className="text-xs text-[var(--ink-3)]">
                        Couldn't tell who did what. Try naming the kid.
                      </p>
                    )}
                    <Button
                      size="sm"
                      disabled={!parsed.hasUsableEntry}
                      onClick={commitParsed}
                      className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
                    >
                      Log {parsed.entries.length === 1 ? "this" : `all ${parsed.entries.length}`}
                    </Button>
                  </div>
                )}
                {parsed && parsed.entries.length === 0 && (
                  <p className="text-xs text-[var(--ink-3)]">
                    Needs a kid name, a subject, and a duration. Try: "Emma read for 20 min."
                  </p>
                )}
              </div>
            )}
          </div>

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
