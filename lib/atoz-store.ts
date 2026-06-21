/**
 * Local-first v1 storage (AtoZ Family handoff, docs/CLAUDE.md).
 * Lessons, sessions, captures, memberships and invites live in
 * localStorage so the flows work offline without a backend.
 * v2 will migrate to Supabase; v1 keeps data on the device.
 */

export interface Kid {
  id: string
  name: string
  color: string
  age?: number
  weeklyTarget?: number
  createdAt: string
  updatedAt: string
}

export type LessonStatus = "draft" | "scheduled" | "archived"

export interface LessonPlanStep {
  id: string
  text: string
  done?: boolean
}

export interface Lesson {
  id: string
  title: string
  subject: string
  kidIds: string[]
  durationMin?: number
  goal?: string
  materials: string[]
  planSteps: LessonPlanStep[]
  status: LessonStatus
  scheduledFor?: string // ISO timestamp
  createdAt: string
  updatedAt: string
  /**
   * Soft-delete timestamp. Set by softDeleteLesson and pruneExpiredDrafts;
   * the lesson stays in the store so /library "Recently deleted" can show
   * and restore it. listLessons() filters these out by default.
   */
  deletedAt?: string
}

export type CaptureKind = "note" | "photo" | "voice" | "quote"

export interface Capture {
  id: string
  sessionId: string
  kind: CaptureKind
  text?: string
  dataUrl?: string // small photo/voice inlined as data URL (< 100KB)
  blobId?: string // IndexedDB id (lib/blob-store) for larger media
  mimeType?: string // e.g. "image/jpeg", "audio/webm" — tracked alongside blobId
  relMs: number // ms since session start
  createdAt: string
}

export interface ReflectionPrompt {
  /** stable id so re-ordering is safe */
  id: string
  question: string
  answer?: string
}

export type ReflectionRating = "great" | "good" | "okay" | "tough"

export interface LessonSession {
  id: string
  lessonId: string
  startedAt: string
  endedAt?: string
  pausedAtMs?: number // accumulated paused duration
  lastPausedAt?: string | null
  completedStepIds: string[]
  reflection?: {
    rating?: ReflectionRating
    note?: string
    /** 3.4 extended reflection: answers to the calm-day prompts */
    prompts?: ReflectionPrompt[]
  }
}

export interface PortfolioItem {
  id: string
  sessionId: string
  lessonId: string
  kidId: string
  title: string
  subject: string
  date: string
  quote?: string
  narration?: string
  photoUrls: string[]
  /** IndexedDB blob ids for photos too large to inline as dataUrl. Pair with photoUrls. */
  photoBlobIds?: string[]
  /** IndexedDB blob id for a voice-narration clip, if captured. */
  voiceBlobId?: string
  voiceMimeType?: string
  notes: string[]
  /** Observations, not scores. Labels from the curated list in components/trait-picker. */
  traits?: string[]
  rating?: ReflectionRating
  minutes: number
  createdAt: string
}

export type MemberRole = "primary" | "coparent" | "tutor" | "grandparent" | "group"

export interface MembershipScope {
  kidIds?: string[]
  subjects?: string[]
  weekdays?: number[] // 0=Sun ... 6=Sat
}

export interface Membership {
  id: string
  name: string
  email?: string
  phone?: string
  role: MemberRole
  scope?: MembershipScope
  createdAt: string
}

export interface Invite {
  id: string
  name?: string
  email?: string
  phone?: string
  role: MemberRole
  scope?: MembershipScope
  note?: string
  token: string
  createdAt: string
  expiresAt: string
  acceptedAt?: string
  revokedAt?: string
}

// ── storage helpers ──────────────────────────────────────────────

const KEY = {
  kids: "atoz.kids",
  lessons: "atoz.lessons",
  sessions: "atoz.sessions",
  captures: "atoz.captures",
  portfolio: "atoz.portfolio",
  memberships: "atoz.memberships",
  invites: "atoz.invites",
  onboarding: "atoz.onboarding",
  todayLayout: "atoz.todayLayout",
  advisor: "atoz.advisor",
  branding: "atoz.branding",
} as const

export type TodayLayout = "agenda" | "per-kid" | "compass"

export interface AdvisorPrefs {
  enabled: boolean
}

export interface BrandingPrefs {
  familyName?: string
  accentColor?: string
}

export interface OnboardingState {
  completed: boolean
  state?: string // US state abbr, used by Phase 4 compliance guides
  completedAt?: string
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function read<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent("atoz:change", { detail: { key } }))
  } catch {
    // Quota exceeded or private-mode: fail silently; CLAUDE.md says "never block."
  }
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

// ── kids ─────────────────────────────────────────────────────────

export function listKids(): Kid[] {
  return read<Kid[]>(KEY.kids, [])
}

export function getKid(id: string): Kid | undefined {
  return listKids().find((k) => k.id === id)
}

export function upsertKid(kid: Kid): Kid {
  const now = new Date().toISOString()
  const all = listKids()
  const idx = all.findIndex((k) => k.id === kid.id)
  const merged = { ...kid, updatedAt: now }
  if (idx >= 0) all[idx] = merged
  else all.push({ ...merged, createdAt: now })
  write(KEY.kids, all)
  return merged
}

export function deleteKid(id: string): void {
  write(
    KEY.kids,
    listKids().filter((k) => k.id !== id),
  )
}

export function newDraftKid(partial: Partial<Kid> = {}): Kid {
  const now = new Date().toISOString()
  return {
    id: uid("kid"),
    name: "",
    color: "#d46e4d",
    weeklyTarget: 17.5,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function seedKidsIfEmpty(seed: Omit<Kid, "createdAt" | "updatedAt">[]): void {
  if (listKids().length > 0) return
  const now = new Date().toISOString()
  write(
    KEY.kids,
    seed.map((k) => ({ ...k, createdAt: now, updatedAt: now })),
  )
}

// ── lessons ──────────────────────────────────────────────────────

/** Drafts auto-expire after this many days untouched (Phase 6.10 doctrine). */
export const DRAFT_TTL_DAYS = 30

function readAllLessonsRaw(): Lesson[] {
  return read<Lesson[]>(KEY.lessons, [])
}

/**
 * Returns lessons excluding soft-deleted ones by default.
 * Pass `{ includeDeleted: true }` to surface them (used by /library
 * "Recently deleted" filter).
 */
export function listLessons(opts: { includeDeleted?: boolean } = {}): Lesson[] {
  const all = readAllLessonsRaw()
  return opts.includeDeleted ? all : all.filter((l) => !l.deletedAt)
}

/**
 * Look up a single lesson by id. Excludes soft-deleted lessons by default;
 * pass `{ includeDeleted: true }` to surface them (used by Library Restore).
 */
export function getLesson(id: string, opts: { includeDeleted?: boolean } = {}): Lesson | undefined {
  const match = readAllLessonsRaw().find((l) => l.id === id)
  if (!match) return undefined
  if (!opts.includeDeleted && match.deletedAt) return undefined
  return match
}

export function upsertLesson(lesson: Lesson): Lesson {
  const now = new Date().toISOString()
  const all = readAllLessonsRaw()
  const idx = all.findIndex((l) => l.id === lesson.id)
  const merged = { ...lesson, updatedAt: now }
  if (idx >= 0) all[idx] = merged
  else all.unshift({ ...merged, createdAt: now })
  write(KEY.lessons, all)
  return merged
}

/** Hard delete — only used internally; prefer softDeleteLesson. */
export function deleteLesson(id: string): void {
  softDeleteLesson(id)
}

/** Soft-delete: sets deletedAt; the lesson stays in the store for Restore. */
export function softDeleteLesson(id: string): void {
  const now = new Date().toISOString()
  const all = readAllLessonsRaw()
  const idx = all.findIndex((l) => l.id === id)
  if (idx < 0) return
  all[idx] = { ...all[idx], deletedAt: now }
  write(KEY.lessons, all)
}

/** Restore a soft-deleted lesson. */
export function restoreLesson(id: string): void {
  const all = readAllLessonsRaw()
  const idx = all.findIndex((l) => l.id === id)
  if (idx < 0) return
  const { deletedAt: _, ...rest } = all[idx]
  all[idx] = rest as Lesson
  write(KEY.lessons, all)
}

/** Returns the expiry date for a draft, or null if not a draft. */
export function getDraftExpiryDate(lesson: Lesson): Date | null {
  if (lesson.status !== "draft") return null
  const base = new Date(lesson.updatedAt)
  base.setDate(base.getDate() + DRAFT_TTL_DAYS)
  return base
}

/**
 * Soft-delete any draft whose updatedAt is older than DRAFT_TTL_DAYS.
 * Returns the number of drafts that were pruned. Idempotent.
 */
export function pruneExpiredDrafts(now: Date = new Date()): number {
  const cutoff = now.getTime() - DRAFT_TTL_DAYS * 24 * 60 * 60 * 1000
  const all = readAllLessonsRaw()
  let pruned = 0
  const next = all.map((l) => {
    if (l.status === "draft" && !l.deletedAt && new Date(l.updatedAt).getTime() < cutoff) {
      pruned += 1
      return { ...l, deletedAt: now.toISOString() }
    }
    return l
  })
  if (pruned > 0) write(KEY.lessons, next)
  return pruned
}

/**
 * Mark a lesson as completed today (or undo). Used by the /today checkbox.
 * Creates a synthetic session with startedAt = endedAt = now if no session
 * for this lesson exists today; otherwise toggles endedAt on the latest one.
 */
export function toggleLessonDoneToday(lessonId: string, now: Date = new Date()): void {
  const nowIso = now.toISOString()
  const all = listSessions()
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const sameDay = (iso: string | undefined) => {
    if (!iso) return false
    const d = new Date(iso)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() === todayMs
  }
  const existingToday = all.find(
    (s) => s.lessonId === lessonId && (sameDay(s.startedAt) || sameDay(s.endedAt)),
  )
  if (existingToday) {
    const updated = { ...existingToday, endedAt: existingToday.endedAt ? undefined : nowIso }
    upsertSession(updated)
    return
  }
  upsertSession({
    id: uid("ses"),
    lessonId,
    startedAt: nowIso,
    endedAt: nowIso,
    pausedAtMs: 0,
    lastPausedAt: null,
    completedStepIds: [],
  })
}

export function newDraftLesson(partial: Partial<Lesson> = {}): Lesson {
  const now = new Date().toISOString()
  return {
    id: uid("les"),
    title: "",
    subject: "",
    kidIds: [],
    materials: [],
    planSteps: [],
    status: "draft",
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

// ── sessions ─────────────────────────────────────────────────────

export function listSessions(): LessonSession[] {
  return read<LessonSession[]>(KEY.sessions, [])
}

export function getSession(id: string): LessonSession | undefined {
  return listSessions().find((s) => s.id === id)
}

export function upsertSession(session: LessonSession): LessonSession {
  const all = listSessions()
  const idx = all.findIndex((s) => s.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.unshift(session)
  write(KEY.sessions, all)
  return session
}

export function startSession(lessonId: string): LessonSession {
  const session: LessonSession = {
    id: uid("ses"),
    lessonId,
    startedAt: new Date().toISOString(),
    pausedAtMs: 0,
    lastPausedAt: null,
    completedStepIds: [],
  }
  upsertSession(session)
  return session
}

// ── captures ─────────────────────────────────────────────────────

export function listCapturesForSession(sessionId: string): Capture[] {
  return read<Capture[]>(KEY.captures, []).filter((c) => c.sessionId === sessionId)
}

export function addCapture(capture: Capture): void {
  const all = read<Capture[]>(KEY.captures, [])
  all.unshift(capture)
  write(KEY.captures, all)
}

export function deleteCapture(id: string): void {
  write(
    KEY.captures,
    read<Capture[]>(KEY.captures, []).filter((c) => c.id !== id),
  )
}

// ── portfolio ────────────────────────────────────────────────────

export function listPortfolio(): PortfolioItem[] {
  return read<PortfolioItem[]>(KEY.portfolio, [])
}

export function listPortfolioForKid(kidId: string): PortfolioItem[] {
  return listPortfolio().filter((p) => p.kidId === kidId)
}

export function addPortfolioItem(item: PortfolioItem): void {
  const all = listPortfolio()
  all.unshift(item)
  write(KEY.portfolio, all)
}

// ── memberships ──────────────────────────────────────────────────

export function listMemberships(): Membership[] {
  return read<Membership[]>(KEY.memberships, [])
}

export function addMembership(m: Membership): void {
  const all = listMemberships()
  all.unshift(m)
  write(KEY.memberships, all)
}

export function removeMembership(id: string): void {
  write(
    KEY.memberships,
    listMemberships().filter((m) => m.id !== id),
  )
}

// ── invites ──────────────────────────────────────────────────────

export function listInvites(): Invite[] {
  return read<Invite[]>(KEY.invites, [])
}

export function addInvite(invite: Invite): void {
  const all = listInvites()
  all.unshift(invite)
  write(KEY.invites, all)
}

export function updateInvite(id: string, patch: Partial<Invite>): void {
  const all = listInvites().map((i) => (i.id === id ? { ...i, ...patch } : i))
  write(KEY.invites, all)
}

export function newInvite(partial: Partial<Invite> & { role: MemberRole }): Invite {
  const now = new Date()
  const expires = new Date(now)
  expires.setDate(expires.getDate() + 7)
  return {
    id: uid("inv"),
    role: partial.role,
    name: partial.name,
    email: partial.email,
    phone: partial.phone,
    scope: partial.scope,
    note: partial.note,
    token: Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12),
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  }
}

// ── onboarding ───────────────────────────────────────────────────

export function getOnboarding(): OnboardingState {
  return read<OnboardingState>(KEY.onboarding, { completed: false })
}

export function setOnboarding(next: Partial<OnboardingState>): OnboardingState {
  const merged = { ...getOnboarding(), ...next }
  write(KEY.onboarding, merged)
  return merged
}

// ── today layout ─────────────────────────────────────────────────

export function getTodayLayout(): TodayLayout {
  return read<TodayLayout>(KEY.todayLayout, "agenda")
}

export function setTodayLayout(layout: TodayLayout): void {
  write(KEY.todayLayout, layout)
}

// ── advisor ──────────────────────────────────────────────────────

export function getAdvisorPrefs(): AdvisorPrefs {
  return read<AdvisorPrefs>(KEY.advisor, { enabled: false })
}

export function setAdvisorPrefs(next: Partial<AdvisorPrefs>): AdvisorPrefs {
  const merged = { ...getAdvisorPrefs(), ...next }
  write(KEY.advisor, merged)
  return merged
}

// ── branding ─────────────────────────────────────────────────────

export function getBranding(): BrandingPrefs {
  return read<BrandingPrefs>(KEY.branding, {})
}

export function setBranding(next: Partial<BrandingPrefs>): BrandingPrefs {
  const merged = { ...getBranding(), ...next }
  write(KEY.branding, merged)
  return merged
}

// ── day tweaks ───────────────────────────────────────────────────

export interface DayTweaks {
  quietDay?: boolean
  skipSubjects?: string[]
}

const DAY_TWEAKS_PREFIX = "atoz.dayTweaks."

export function getDayTweaks(dateKey: string): DayTweaks {
  return read<DayTweaks>(DAY_TWEAKS_PREFIX + dateKey, {})
}

export function setDayTweaks(dateKey: string, next: DayTweaks): void {
  write(DAY_TWEAKS_PREFIX + dateKey, next)
}

/**
 * Wipe any auto-seeded demo kids so the first real kid added during
 * onboarding isn't mixed with Emma/Noah/Lily.
 */
export function resetKids(): void {
  write(KEY.kids, [])
}

// ── change subscription ──────────────────────────────────────────

export function onStorageChange(cb: () => void): () => void {
  if (!canUseStorage()) return () => {}
  const handler = () => cb()
  window.addEventListener("storage", handler)
  window.addEventListener("atoz:change", handler as EventListener)
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener("atoz:change", handler as EventListener)
  }
}
