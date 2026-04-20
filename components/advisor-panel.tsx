"use client"

/**
 * Advisor panel — contextual suggestions for the lesson currently
 * being authored or taught. NOT a global chat widget. Opens as a
 * side drawer from /teach when the user explicitly asks for help.
 *
 * Gated by AdvisorPrefs.enabled in atoz-store and ANTHROPIC_API_KEY
 * on the server. Silent when either is missing.
 */

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import type { Kid, Lesson, PortfolioItem } from "@/lib/atoz-store"
import { listPortfolio } from "@/lib/atoz-store"

interface SuggestResponse {
  summary: string
  steps: string[]
  warnings?: string[]
}

export default function AdvisorPanel({
  open,
  onOpenChange,
  lesson,
  kid,
  onApplyStep,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  lesson: Lesson | null
  kid?: Kid
  /** Called when the user taps "Add to plan" on a suggested step. */
  onApplyStep?: (text: string) => void
}) {
  const [context, setContext] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<SuggestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setResponse(null)
      setError(null)
    }
  }, [open])

  const requestSuggestions = async () => {
    if (!lesson) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const recentSubjects = recentSubjectsThisWeek()
      const res = await fetch("/api/advisor/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lesson: {
            title: lesson.title,
            subject: lesson.subject,
            goal: lesson.goal,
            durationMin: lesson.durationMin,
            materials: lesson.materials,
            planSteps: lesson.planSteps.map((s) => ({ id: s.id, text: s.text })),
          },
          kid: kid ? { name: kid.name, age: kid.age } : undefined,
          recentSubjects,
          context: context.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error ?? "Advisor is unavailable right now.")
        return
      }
      setResponse(json as SuggestResponse)
    } catch (err: any) {
      setError(err?.message ?? "Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles size={16} aria-hidden="true" /> Advisor
          </SheetTitle>
          <SheetDescription>
            Grounded in this lesson only. Suggestions are starting points — you know your learner.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="advisor-ctx" className="text-sm font-medium">
              Anything we should know?
            </label>
            <Textarea
              id="advisor-ctx"
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, 400))}
              rows={3}
              placeholder="Optional — e.g. 'last week we got stuck on fractions, she wants to bake today'"
              className="resize-none"
            />
          </div>

          <Button
            onClick={requestSuggestions}
            disabled={loading || !lesson}
            className="w-full bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-1 animate-spin" aria-hidden="true" />
                Thinking…
              </>
            ) : (
              <>
                <Sparkles size={14} className="mr-1" aria-hidden="true" />
                Suggest shape
              </>
            )}
          </Button>

          {error && (
            <div className="rounded-lg border border-[var(--terracotta)] bg-[var(--terracotta-ll)] text-[var(--terracotta-d)] p-3 text-sm flex gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>{error}</div>
            </div>
          )}

          {response && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--ink-2)]">{response.summary}</p>
              <ul className="space-y-2">
                {response.steps.map((step, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-[var(--rule)] bg-white p-3 text-sm flex items-start gap-2"
                  >
                    <span className="flex-1">{step}</span>
                    {onApplyStep && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onApplyStep(step)}
                        className="h-auto text-xs py-1 px-2"
                      >
                        Add
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              {response.warnings && response.warnings.length > 0 && (
                <div className="rounded-lg border border-[var(--honey-l)] bg-[var(--honey-ll)] text-[var(--honey-d)] p-3 text-xs space-y-1">
                  <div className="font-medium">Worth noting</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {response.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-[var(--ink-4)] pt-3 border-t border-[var(--rule)]">
          The advisor sees only this lesson, the learner's name and age, and the subjects you've
          been teaching this week. Nothing is sent outside your configured AI provider.
        </p>
      </SheetContent>
    </Sheet>
  )
}

function recentSubjectsThisWeek(): string[] {
  if (typeof window === "undefined") return []
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const items = listPortfolio() as PortfolioItem[]
  const set = new Set<string>()
  for (const item of items) {
    if (new Date(item.date) >= weekStart && item.subject) set.add(item.subject)
  }
  return Array.from(set).slice(0, 8)
}
