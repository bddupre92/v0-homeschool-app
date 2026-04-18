"use client"

import { useState } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import {
  Pill,
  Chip,
  KidDot,
  KidChip,
  ProgressRail,
  TeachTimer,
  TeachSubjectChip,
  TeachCard,
  TeachBtn,
  TeachProgress,
} from "@/components/primitives"
import LogHoursDialog from "@/components/log-hours-dialog"
import LessonAuthoringDialog from "@/components/lesson-authoring-dialog"
import InviteFlowDialog from "@/components/invite-flow-dialog"
import { ReflectionPicker } from "@/components/reflection-picker"
import type { ReflectionRating } from "@/lib/atoz-store"
import { Button } from "@/components/ui/button"
import { Pause, Camera, MessageSquare, Square } from "lucide-react"

const SEED_KIDS = [
  { id: "emma", name: "Emma", color: "#d46e4d" },
  { id: "noah", name: "Noah", color: "#7d9e7d" },
  { id: "lily", name: "Lily", color: "#df8a27" },
]

export default function DesignSystemPage() {
  const [kidSelection, setKidSelection] = useState("emma")
  const [subject, setSubject] = useState("Mathematics")
  const [duration, setDuration] = useState(30)
  const [showDialog, setShowDialog] = useState(false)
  const [showAuthor, setShowAuthor] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [reflection, setReflection] = useState<ReflectionRating | undefined>(undefined)

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page">
        <header className="mt-2 mb-14 pb-10 border-b border-[var(--rule)]">
          <div className="atoz-eyebrow">AtoZ Family · Design System</div>
          <h1 className="font-display text-6xl font-light tracking-tighter leading-[1.02] mt-4 mb-4 text-[var(--ink)]">
            Primitives &amp; tokens.
          </h1>
          <p className="text-[18px] leading-[1.55] text-[var(--ink-2)] max-w-[640px]">
            A living reference for the serene design system ported from the
            handoff pack. <span className="atoz-hand text-[var(--terracotta-d)] text-[20px] font-semibold">Use it, don&apos;t invent around it.</span>
          </p>
        </header>

        <Section title="Colour tokens" sub="Sage, terracotta, honey, linen. No blues, no neon.">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Swatch name="sage-dd" token="--sage-dd" />
            <Swatch name="sage-d" token="--sage-d" />
            <Swatch name="sage" token="--sage" />
            <Swatch name="sage-l" token="--sage-l" />
            <Swatch name="sage-ll" token="--sage-ll" />
            <Swatch name="terracotta-d" token="--terracotta-d" />
            <Swatch name="terracotta" token="--terracotta" />
            <Swatch name="terracotta-l" token="--terracotta-l" />
            <Swatch name="honey-d" token="--honey-d" />
            <Swatch name="honey" token="--honey" />
            <Swatch name="honey-l" token="--honey-l" />
            <Swatch name="linen" token="--linen" />
            <Swatch name="linen-2" token="--linen-2" />
            <Swatch name="ink" token="--ink" />
            <Swatch name="ink-2" token="--ink-2" />
            <Swatch name="ink-3" token="--ink-3" />
          </div>
        </Section>

        <Section title="Typography" sub="Fraunces for display, Inter for body, Caveat for kid quotes.">
          <div className="grid gap-4">
            <div className="atoz-mini-card">
              <div className="atoz-eyebrow mb-2">Display · Fraunces</div>
              <div className="font-display text-6xl font-light tracking-tighter leading-none">
                Good morning, Rachel.
              </div>
            </div>
            <div className="atoz-mini-card">
              <div className="atoz-eyebrow mb-2">Body · Inter</div>
              <p className="text-[15px] leading-[1.55] text-[var(--ink-2)]">
                Homeschool is a family life, not a curriculum stack. The copy is warm, specific,
                never cheery. Contractions are fine; exclamations are not.
              </p>
            </div>
            <div className="atoz-mini-card">
              <div className="atoz-eyebrow mb-2">Hand · Caveat</div>
              <p className="atoz-hand text-[22px] text-[var(--terracotta-d)]">
                &ldquo;I built a bridge and it actually held the book!&rdquo; — Noah, age 7
              </p>
            </div>
          </div>
        </Section>

        <Section title="Pill" sub="Small rounded status tag. Four variants.">
          <div className="flex flex-wrap gap-2 items-center">
            <Pill>default</Pill>
            <Pill variant="sage">sage · 83%</Pill>
            <Pill variant="honey">honey · new</Pill>
            <Pill variant="terracotta">terracotta · urgent</Pill>
          </div>
        </Section>

        <Section title="Chip" sub="Tappable filter. Outline by default; fills sage when active.">
          <div className="flex flex-wrap gap-2">
            {["Mathematics", "Science", "Language Arts", "History", "Art"].map((s) => (
              <Chip key={s} active={subject === s} onClick={() => setSubject(s)}>
                {s}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[15, 30, 45, 60, 90].map((m) => (
              <Chip key={m} active={duration === m} onClick={() => setDuration(m)}>
                {m < 60 ? `${m} min` : `${m / 60} hr`}
              </Chip>
            ))}
          </div>
          <p className="text-sm text-[var(--ink-3)] mt-4">
            Selected: <strong>{subject}</strong> · {duration} min
          </p>
        </Section>

        <Section title="Kid dot &amp; kid chip" sub="Kid colour follows through the app.">
          <div className="flex items-end gap-3">
            <KidDot name="Emma" color="#d46e4d" size="xs" />
            <KidDot name="Emma" color="#d46e4d" size="sm" />
            <KidDot name="Emma" color="#d46e4d" size="md" />
            <KidDot name="Emma" color="#d46e4d" size="lg" />
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            {SEED_KIDS.map((kid) => (
              <KidChip
                key={kid.id}
                name={kid.name}
                color={kid.color}
                active={kidSelection === kid.id}
                onClick={() => setKidSelection(kid.id)}
              />
            ))}
          </div>
        </Section>

        <Section title="Progress rail" sub="Thin linear progress. Tone follows kid or subject colour.">
          <div className="space-y-4 max-w-[420px]">
            <WeeklyRail name="Emma" hours={14.5} target={17.5} tone="terracotta" />
            <WeeklyRail name="Noah" hours={12} target={17.5} tone="sage" />
            <WeeklyRail name="Lily" hours={9.5} target={17.5} tone="honey" />
          </div>
        </Section>

        <Section title="Compliance strip" sub="Calm confirmation after a log, or the daily progress indicator when compliance is on.">
          <div className="atoz-compliance-strip max-w-[520px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <div className="flex-1">Logged · 30 min of Math for Emma</div>
            <button className="text-xs font-semibold underline underline-offset-2">Undo</button>
          </div>
        </Section>

        <Section title="Flow 01 · Log hours" sub="Four taps to save. Smart defaults. Undo within 5s.">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
            >
              Open quick-log
            </Button>
            <Button variant="outline" asChild>
              <Link href="/plan">Go to Plan (real data)</Link>
            </Button>
          </div>
          <LogHoursDialog
            open={showDialog}
            onOpenChange={setShowDialog}
            children={SEED_KIDS}
            defaultKidId="emma"
            defaultSubject="Mathematics"
            defaultMinutes={30}
            onSubmit={(data) => {
              console.log("Demo log:", data)
            }}
          />
        </Section>

        <Section title="Teach mode primitives" sub="Dark full-screen. Terracotta primary. No room chrome.">
          <div className="rounded-2xl overflow-hidden">
            <div
              className="teach-screen teach-screen--desktop"
              style={{ minHeight: "auto", padding: "32px" }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-white/60 text-sm">← Exit</span>
                <TeachSubjectChip>Math · Emma · 45 min</TeachSubjectChip>
              </div>
              <div className="text-center mb-5">
                <TeachTimer ms={12 * 60_000 + 34_000} size="lg" />
                <div className="text-xs text-white/50 mt-2">of 45:00 · 28%</div>
                <div className="flex justify-center mt-2">
                  <TeachProgress value={28} />
                </div>
              </div>
              <TeachCard className="mb-4">
                <div className="text-xs uppercase tracking-[0.14em] text-white/50 font-semibold mb-2">
                  Step 2 of 4 · current
                </div>
                <div className="text-white text-sm font-medium">
                  Roll a pair of paper pizzas and name the fraction.
                </div>
              </TeachCard>
              <div className="flex gap-2 flex-wrap">
                <TeachBtn><Pause size={12} /> Pause</TeachBtn>
                <TeachBtn><MessageSquare size={12} /> Note</TeachBtn>
                <TeachBtn><Camera size={12} /> Photo</TeachBtn>
                <TeachBtn variant="primary"><Square size={12} /> End</TeachBtn>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => setShowAuthor(true)}
              className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
            >
              Open lesson authoring
            </Button>
            <Button variant="outline" asChild>
              <Link href="/teach">Go to Teach room</Link>
            </Button>
          </div>
          <LessonAuthoringDialog
            open={showAuthor}
            onOpenChange={setShowAuthor}
            kids={SEED_KIDS}
          />
        </Section>

        <Section title="Reflection picker" sub="4-point + skip. Emojis, but no gamification.">
          <div className="atoz-mini-card">
            <div className="atoz-eyebrow mb-3">How did it go?</div>
            <ReflectionPicker value={reflection} onChange={setReflection} />
            {reflection && (
              <p className="mt-3 text-sm text-[var(--ink-3)]">
                You picked <strong>{reflection}</strong>. (Optional — skippable.)
              </p>
            )}
          </div>
        </Section>

        <Section title="Flow 03 · Invite co-teacher" sub="Role → scope → send. Magic link valid 7 days.">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowInvite(true)}
              className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
            >
              Open invite wizard
            </Button>
            <Button variant="outline" asChild>
              <Link href="/people">Go to People</Link>
            </Button>
          </div>
          <InviteFlowDialog
            open={showInvite}
            onOpenChange={setShowInvite}
            kids={SEED_KIDS}
          />
        </Section>

        <Section title="All rooms &amp; flows" sub="Direct links.">
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            <li><Link className="underline text-[var(--sage-dd)]" href="/today">Today (the calm home)</Link></li>
            <li><Link className="underline text-[var(--sage-dd)]" href="/teach">Teach (Flow 02 · lesson loop)</Link></li>
            <li><Link className="underline text-[var(--sage-dd)]" href="/library">Library (all lessons)</Link></li>
            <li><Link className="underline text-[var(--sage-dd)]" href="/people">People (Flow 03 · invite)</Link></li>
            <li><Link className="underline text-[var(--sage-dd)]" href="/plan">Plan (Flow 01 · real data)</Link></li>
            <li><Link className="underline text-[var(--sage-dd)]" href="/invite/accept?token=missing">Invite landing (error state)</Link></li>
          </ul>
        </Section>

        <footer className="mt-16 pt-8 border-t border-[var(--rule)] text-xs text-[var(--ink-4)] flex justify-between">
          <div>AtoZ Family · ported from handoff · <span className="atoz-hand text-[var(--terracotta-d)] text-base">built with care</span></div>
          <div>Read docs/CLAUDE.md before editing.</div>
        </footer>
      </main>
    </div>
  )
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="font-display text-[32px] font-normal tracking-tight mb-1">{title}</h2>
      {sub && <p className="text-[14px] text-[var(--ink-3)] mb-6">{sub}</p>}
      {children}
    </section>
  )
}

function Swatch({ name, token }: { name: string; token: string }) {
  return (
    <div className="atoz-mini-card flex items-center gap-3 !p-3">
      <div
        className="w-12 h-12 rounded-[8px] border border-[var(--rule)]"
        style={{ background: `var(${token})` }}
      />
      <div className="text-xs leading-tight">
        <div className="font-semibold text-[var(--ink)]">{name}</div>
        <div className="text-[var(--ink-4)] font-mono">{token}</div>
      </div>
    </div>
  )
}

function WeeklyRail({
  name,
  hours,
  target,
  tone,
}: {
  name: string
  hours: number
  target: number
  tone: "sage" | "honey" | "terracotta"
}) {
  const pct = Math.round((hours / target) * 100)
  return (
    <div className="atoz-mini-card">
      <div className="text-xs text-[var(--ink-3)] mb-1">This week · {name}</div>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="font-display text-[28px] font-normal tracking-tight">{hours}</span>{" "}
          <span className="text-[var(--ink-3)] text-sm">of {target} hrs</span>
        </div>
        <Pill variant={tone === "sage" ? "sage" : tone}>{pct}%</Pill>
      </div>
      <ProgressRail value={pct} tone={tone} label={`${name}'s weekly progress`} />
    </div>
  )
}
