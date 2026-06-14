"use client"

/**
 * Community discovery preferences — what families want in a co-op match.
 *
 * Auto-saves on change (debounced 500ms) so the form feels like the
 * Settings page rather than a wizard. The values back the discoverGroups
 * server action on /community.
 */

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import Navigation from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Chip } from "@/components/primitives"
import {
  getUserPreferences,
  saveUserPreferences,
} from "@/app/actions/group-discovery-actions"
import { useToast } from "@/hooks/use-toast"
import { isValidZip } from "@/lib/zipcodes"
import { AnalyticsEvents, trackEvent } from "@/lib/analytics"

const DISTANCES = [10, 25, 50]
const PHILOSOPHIES = [
  "classical",
  "charlotte_mason",
  "montessori",
  "reggio",
  "waldorf",
  "unschooling",
  "eclectic",
]
const AGE_GROUPS = ["under-5", "5-7", "8-10", "11-13", "14-17"]
const SUBJECTS = [
  "Mathematics",
  "Language Arts",
  "Science",
  "History",
  "Art",
  "Music",
  "Physical Education",
  "Foreign Language",
]
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function humanize(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function CommunityPreferencesPage() {
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const [savedPill, setSavedPill] = useState(false)

  const [zipCode, setZipCode] = useState("")
  const [maxDistanceMiles, setMaxDistanceMiles] = useState<number>(25)
  const [preferredPhilosophy, setPreferredPhilosophy] = useState<string | null>(null)
  const [childAgeGroups, setChildAgeGroups] = useState<string[]>([])
  const [wantedSubjects, setWantedSubjects] = useState<string[]>([])
  const [preferredDay, setPreferredDay] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const hydratedRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initial hydrate
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const result = await getUserPreferences()
      if (cancelled) return
      const p = result.prefs as any
      if (p) {
        setZipCode(p.zip_code ?? "")
        setMaxDistanceMiles(p.max_distance_miles ?? 25)
        setPreferredPhilosophy(p.preferred_philosophy ?? null)
        setChildAgeGroups(p.child_age_groups ?? [])
        setWantedSubjects(p.wanted_subjects ?? [])
        setPreferredDay(p.preferred_day ?? null)
      }
      setHydrated(true)
      hydratedRef.current = true
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Auto-save on any change
  useEffect(() => {
    if (!hydratedRef.current) return
    if (zipCode && !isValidZip(zipCode)) return // wait for valid ZIP
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await saveUserPreferences({
          zipCode: zipCode || null,
          maxDistanceMiles,
          preferredPhilosophy,
          childAgeGroups,
          wantedSubjects,
          preferredDay,
        })
        if (result.success) {
          trackEvent(AnalyticsEvents.COMMUNITY_PREFERENCES_SAVED, {
            zip_prefix3: zipCode.slice(0, 3) || null,
            max_distance_miles: maxDistanceMiles,
            philosophy: preferredPhilosophy ?? null,
            age_count: childAgeGroups.length,
            subject_count: wantedSubjects.length,
          })
          setSavedPill(true)
          setTimeout(() => setSavedPill(false), 1800)
        } else {
          toast({ title: "Could not save", description: result.error })
        }
      })
    }, 500)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [
    zipCode,
    maxDistanceMiles,
    preferredPhilosophy,
    childAgeGroups,
    wantedSubjects,
    preferredDay,
    toast,
  ])

  const toggle = (arr: string[], value: string, setter: (next: string[]) => void) =>
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value])

  const zipInvalid = zipCode.length > 0 && !isValidZip(zipCode)

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page max-w-[680px]">
        <Link
          href="/community"
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-3)] hover:text-[var(--ink)] mb-4"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to Community
        </Link>
        <header className="mb-8">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div>
              <div className="atoz-eyebrow">Community · Preferences</div>
              <h1 className="font-display text-4xl font-light tracking-tighter leading-[1.05] mt-2">
                What you're looking for.
              </h1>
            </div>
            <SavedPill visible={savedPill || pending} />
          </div>
          <p className="text-[var(--ink-2)] mt-2">
            Changes save automatically. We use these to rank co-ops nearby — never to share with
            other families.
          </p>
        </header>

        <div className="space-y-8 opacity-100 transition-opacity" style={{ opacity: hydrated ? 1 : 0.4 }}>
          <Section label="Your ZIP code">
            <Input
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="55105"
              inputMode="numeric"
              maxLength={5}
              aria-invalid={zipInvalid ? true : undefined}
            />
            {zipInvalid && (
              <p className="text-xs text-[var(--terracotta-d)] mt-1">Use a 5-digit US ZIP.</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Used to compute distance only. We never display the ZIP elsewhere.
            </p>
          </Section>

          <Section label="Max distance">
            <div className="flex flex-wrap gap-2">
              {DISTANCES.map((d) => (
                <Chip
                  key={d}
                  active={maxDistanceMiles === d}
                  onClick={() => setMaxDistanceMiles(d)}
                >
                  {d} mi
                </Chip>
              ))}
            </div>
          </Section>

          <Section label="Philosophy (optional)">
            <div className="flex flex-wrap gap-2">
              {PHILOSOPHIES.map((p) => (
                <Chip
                  key={p}
                  active={preferredPhilosophy === p}
                  onClick={() => setPreferredPhilosophy((prev) => (prev === p ? null : p))}
                >
                  {humanize(p)}
                </Chip>
              ))}
            </div>
          </Section>

          <Section label="Your kids' age groups">
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((a) => (
                <Chip
                  key={a}
                  active={childAgeGroups.includes(a)}
                  onClick={() => toggle(childAgeGroups, a, setChildAgeGroups)}
                >
                  {a}
                </Chip>
              ))}
            </div>
          </Section>

          <Section label="Subjects you're looking for">
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <Chip
                  key={s}
                  active={wantedSubjects.includes(s)}
                  onClick={() => toggle(wantedSubjects, s, setWantedSubjects)}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </Section>

          <Section label="Preferred meeting day (optional)">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <Chip
                  key={d}
                  active={preferredDay === d}
                  onClick={() => setPreferredDay((prev) => (prev === d ? null : d))}
                >
                  {d}
                </Chip>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="font-medium">{label}</Label>
      {children}
    </div>
  )
}

function SavedPill({ visible }: { visible: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-[var(--sage-dd)] transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-live="polite"
    >
      <Check className="h-3 w-3" /> Saved
    </span>
  )
}
