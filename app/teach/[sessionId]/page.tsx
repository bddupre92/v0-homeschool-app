"use client"

/**
 * Flow 02 Step 3-5 — Teach mode.
 * Dark full-screen container. Timer, plan check-off, capture bar,
 * reflection, portfolio materialization on end.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  TeachScreen,
  TeachTimer,
  TeachSubjectChip,
  TeachCard,
  TeachBtn,
  TeachProgress,
  CaptureBar,
} from "@/components/primitives/teach"
import { ReflectionPicker } from "@/components/reflection-picker"
import { CapturePhoto, CaptureAudio } from "@/components/capture-media"
import { saveCaptureMedia } from "@/lib/blob-store"
import {
  type Capture,
  type Lesson,
  type LessonSession,
  type PortfolioItem,
  type ReflectionRating,
  addCapture,
  addPortfolioItem,
  getLesson,
  getSession,
  listCapturesForSession,
  uid,
  upsertSession,
} from "@/lib/atoz-store"
import { Camera, MessageSquare, Mic, Pause, Play, Square, ChevronLeft, Quote, X, Plus, StopCircle, Upload } from "lucide-react"

type CaptureKind = "note" | "photo" | "voice" | "quote"

export default function TeachSessionPage() {
  const params = useParams<{ sessionId: string }>()
  const router = useRouter()
  const sessionId = params?.sessionId

  const [session, setSession] = useState<LessonSession | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [now, setNow] = useState<number>(() => Date.now())
  const [captures, setCaptures] = useState<Capture[]>([])
  const [openCaptureKind, setOpenCaptureKind] = useState<CaptureKind | null>(null)
  const [captureText, setCaptureText] = useState("")
  const [photoPending, setPhotoPending] = useState<{ dataUrl?: string; blobId?: string; mimeType: string } | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [voicePending, setVoicePending] = useState<{ blobId?: string; dataUrl?: string; mimeType: string; durationMs: number } | null>(null)
  const [voiceRecording, setVoiceRecording] = useState(false)
  const [voiceRecordedMs, setVoiceRecordedMs] = useState(0)
  const [wrapOpen, setWrapOpen] = useState(false)
  const [reflection, setReflection] = useState<ReflectionRating | undefined>(undefined)
  const [reflectionNote, setReflectionNote] = useState("")
  const [reflectionStuck, setReflectionStuck] = useState("")
  const [reflectionRevisit, setReflectionRevisit] = useState("")
  const [addingStep, setAddingStep] = useState(false)
  const [newStep, setNewStep] = useState("")
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const voiceChunksRef = useRef<Blob[]>([])
  const voiceStreamRef = useRef<MediaStream | null>(null)
  const voiceStartRef = useRef<number>(0)
  const voiceTickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Hydrate session + lesson from storage
  useEffect(() => {
    if (!sessionId) return
    const s = getSession(sessionId)
    if (!s) {
      router.replace("/teach")
      return
    }
    setSession(s)
    setLesson(getLesson(s.lessonId) ?? null)
    setCaptures(listCapturesForSession(s.id))
  }, [sessionId, router])

  // Tick the timer while not paused.
  useEffect(() => {
    if (!session) return
    if (session.lastPausedAt) return
    const iv = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(iv)
  }, [session])

  const paused = Boolean(session?.lastPausedAt)
  const elapsedMs = useMemo(() => {
    if (!session) return 0
    const start = new Date(session.startedAt).getTime()
    const base = (paused ? new Date(session.lastPausedAt!).getTime() : now) - start
    return Math.max(0, base - (session.pausedAtMs ?? 0))
  }, [session, now, paused])

  const targetMs = (lesson?.durationMin ?? 30) * 60_000

  const togglePause = () => {
    if (!session) return
    if (paused) {
      const pausedMs = (session.pausedAtMs ?? 0) + (Date.now() - new Date(session.lastPausedAt!).getTime())
      const next = { ...session, pausedAtMs: pausedMs, lastPausedAt: null }
      setSession(next)
      upsertSession(next)
    } else {
      const next = { ...session, lastPausedAt: new Date().toISOString() }
      setSession(next)
      upsertSession(next)
    }
  }

  const toggleStepDone = useCallback(
    (stepId: string) => {
      if (!session) return
      const next = {
        ...session,
        completedStepIds: session.completedStepIds.includes(stepId)
          ? session.completedStepIds.filter((s) => s !== stepId)
          : [...session.completedStepIds, stepId],
      }
      setSession(next)
      upsertSession(next)
    },
    [session],
  )

  const resetCaptureDraft = useCallback(() => {
    setCaptureText("")
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    setPhotoPreviewUrl(null)
    setPhotoPending(null)
    setVoicePending(null)
    setVoiceRecording(false)
    setVoiceRecordedMs(0)
    if (voiceTickRef.current) {
      clearInterval(voiceTickRef.current)
      voiceTickRef.current = null
    }
    if (voiceStreamRef.current) {
      for (const track of voiceStreamRef.current.getTracks()) track.stop()
      voiceStreamRef.current = null
    }
    voiceChunksRef.current = []
  }, [photoPreviewUrl])

  const closeCaptureDialog = useCallback(() => {
    resetCaptureDraft()
    setOpenCaptureKind(null)
  }, [resetCaptureDraft])

  const saveCapture = useCallback(() => {
    if (!session || !openCaptureKind) return
    const text = captureText.trim()
    const hasMedia = !!(photoPending || voicePending)
    if (!text && !hasMedia) {
      closeCaptureDialog()
      return
    }
    const media = photoPending ?? voicePending
    const capture: Capture = {
      id: uid("cap"),
      sessionId: session.id,
      kind: openCaptureKind,
      text: text || undefined,
      dataUrl: media?.dataUrl,
      blobId: media?.blobId,
      mimeType: media?.mimeType,
      relMs: elapsedMs,
      createdAt: new Date().toISOString(),
    }
    addCapture(capture)
    setCaptures((prev) => [capture, ...prev])
    closeCaptureDialog()
  }, [session, openCaptureKind, captureText, photoPending, voicePending, elapsedMs, closeCaptureDialog])

  const handlePhotoFile = async (file: File) => {
    try {
      const saved = await saveCaptureMedia(file, "photo")
      setPhotoPending(saved)
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
      setPhotoPreviewUrl(saved.dataUrl ? null : URL.createObjectURL(file))
    } catch {
      setCaptureText((t) =>
        t ? `${t} · photo save failed` : "Couldn't save that photo — saved this as a note instead.",
      )
    }
  }

  const startVoiceRecording = useCallback(async () => {
    if (voiceRecording) return
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCaptureText((t) => (t ? t : "Voice recording is not available on this device."))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      voiceStreamRef.current = stream
      voiceChunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) voiceChunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        const type = recorder.mimeType || "audio/webm"
        const blob = new Blob(voiceChunksRef.current, { type })
        voiceChunksRef.current = []
        const saved = await saveCaptureMedia(blob, "voice")
        const duration = Date.now() - voiceStartRef.current
        setVoicePending({ ...saved, durationMs: duration })
        if (voiceStreamRef.current) {
          for (const track of voiceStreamRef.current.getTracks()) track.stop()
          voiceStreamRef.current = null
        }
      }
      mediaRecorderRef.current = recorder
      voiceStartRef.current = Date.now()
      recorder.start()
      setVoiceRecording(true)
      voiceTickRef.current = setInterval(() => {
        setVoiceRecordedMs(Date.now() - voiceStartRef.current)
      }, 250)
    } catch {
      setCaptureText((t) => (t ? t : "Microphone permission denied."))
    }
  }, [voiceRecording])

  const stopVoiceRecording = useCallback(() => {
    if (!voiceRecording || !mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    setVoiceRecording(false)
    if (voiceTickRef.current) {
      clearInterval(voiceTickRef.current)
      voiceTickRef.current = null
    }
  }, [voiceRecording])

  const addStepInline = () => {
    if (!lesson) return
    const text = newStep.trim()
    if (!text) return
    const step = { id: uid("stp"), text }
    const updatedLesson = { ...lesson, planSteps: [...lesson.planSteps, step] }
    setLesson(updatedLesson)
    // Persist the lesson change too.
    import("@/lib/atoz-store").then(({ upsertLesson }) => upsertLesson(updatedLesson))
    setNewStep("")
    setAddingStep(false)
  }

  const endLesson = () => {
    setWrapOpen(true)
  }

  const saveToPortfolio = () => {
    if (!session || !lesson) return
    const endedAt = new Date().toISOString()
    const prompts = [
      reflectionStuck.trim() && { id: "stuck", question: "What stuck?", answer: reflectionStuck.trim() },
      reflectionRevisit.trim() && { id: "revisit", question: "What to revisit?", answer: reflectionRevisit.trim() },
    ].filter(Boolean) as { id: string; question: string; answer: string }[]
    const done: LessonSession = {
      ...session,
      endedAt,
      reflection: {
        rating: reflection,
        note: reflectionNote || undefined,
        prompts: prompts.length > 0 ? prompts : undefined,
      },
    }
    upsertSession(done)

    const minutes = Math.round(elapsedMs / 60000)
    const quoteCapture = captures.find((c) => c.kind === "quote" && c.text)
    const captureNotes = captures.filter((c) => c.kind === "note" && c.text).map((c) => c.text!)
    const reflectionNotes = prompts.map((p) => `${p.question} ${p.answer}`)
    const notes = [...captureNotes, ...reflectionNotes]
    const photoCaps = captures.filter((c) => c.kind === "photo" && (c.dataUrl || c.blobId))
    const photoUrls = photoCaps.map((c) => c.dataUrl ?? "").filter(Boolean)
    const photoBlobIds = photoCaps.map((c) => c.blobId ?? "").filter(Boolean)
    const voiceCap = captures.find((c) => c.kind === "voice" && c.blobId)

    // One portfolio item per kid on the lesson.
    lesson.kidIds.forEach((kidId) => {
      const item: PortfolioItem = {
        id: uid("pf"),
        sessionId: session.id,
        lessonId: lesson.id,
        kidId,
        title: lesson.title,
        subject: lesson.subject,
        date: endedAt.slice(0, 10),
        quote: quoteCapture?.text,
        narration: reflectionNote || undefined,
        photoUrls,
        photoBlobIds: photoBlobIds.length > 0 ? photoBlobIds : undefined,
        voiceBlobId: voiceCap?.blobId,
        voiceMimeType: voiceCap?.mimeType,
        notes,
        rating: reflection,
        minutes,
        createdAt: endedAt,
      }
      addPortfolioItem(item)
    })

    router.replace("/teach?justSaved=1")
  }

  if (!session || !lesson) {
    return (
      <TeachScreen>
        <div className="flex items-center justify-center min-h-[60vh] text-white/70">Loading…</div>
      </TeachScreen>
    )
  }

  const completedCount = session.completedStepIds.length
  const totalSteps = lesson.planSteps.length
  const progressValue = targetMs > 0 ? Math.min(100, (elapsedMs / targetMs) * 100) : 0

  // WRAP / END screen
  if (wrapOpen) {
    return (
      <TeachScreen desktop>
        <div className="max-w-3xl mx-auto w-full space-y-6 pb-20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWrapOpen(false)}
              className="text-white/60 hover:text-white text-sm inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Back to lesson
            </button>
            <TeachSubjectChip>
              {lesson.subject} · {Math.round(elapsedMs / 60000)} min
            </TeachSubjectChip>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-white/50 font-semibold mb-2">
              Wrap
            </div>
            <h1 className="font-display text-4xl font-light text-white leading-tight">
              Nicely done.
            </h1>
            <p className="text-white/60 mt-2">
              {completedCount} of {totalSteps} steps · {captures.length} capture{captures.length === 1 ? "" : "s"}
            </p>
          </div>

          <TeachCard>
            <div className="text-xs uppercase tracking-[0.14em] text-white/50 font-semibold mb-3">
              How did it go?
            </div>
            <ReflectionPicker value={reflection} onChange={setReflection} dark />
            <textarea
              value={reflectionNote}
              onChange={(e) => setReflectionNote(e.target.value.slice(0, 500))}
              placeholder="Anything you want to remember? (optional)"
              rows={3}
              className="mt-4 w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/25 resize-none"
            />
          </TeachCard>

          <TeachCard>
            <div className="text-xs uppercase tracking-[0.14em] text-white/50 font-semibold mb-3">
              Worth remembering
            </div>
            <label className="block">
              <span className="text-sm text-white/70">What stuck?</span>
              <textarea
                value={reflectionStuck}
                onChange={(e) => setReflectionStuck(e.target.value.slice(0, 300))}
                placeholder="A detail, a question they asked, a moment…"
                rows={2}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/25 resize-none"
              />
            </label>
            <label className="block mt-4">
              <span className="text-sm text-white/70">What to revisit?</span>
              <textarea
                value={reflectionRevisit}
                onChange={(e) => setReflectionRevisit(e.target.value.slice(0, 300))}
                placeholder="A concept that needed more time, something to come back to…"
                rows={2}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/25 resize-none"
              />
            </label>
          </TeachCard>

          <div className="flex flex-wrap gap-2 justify-end">
            <TeachBtn variant="secondary" onClick={() => router.replace("/teach")}>
              Log hours only
            </TeachBtn>
            <TeachBtn variant="primary" onClick={saveToPortfolio}>
              Save to portfolio
            </TeachBtn>
          </div>
        </div>
      </TeachScreen>
    )
  }

  // ACTIVE teach mode
  return (
    <TeachScreen desktop>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.replace("/teach")}
          className="text-white/60 hover:text-white text-sm inline-flex items-center gap-1"
          aria-label="Exit teach mode"
        >
          <ChevronLeft size={16} /> Exit
        </button>
        <TeachSubjectChip>
          {lesson.subject}
          {lesson.durationMin ? ` · ${lesson.durationMin} min` : ""}
        </TeachSubjectChip>
      </div>

      <div className="text-center mb-6">
        <TeachTimer ms={elapsedMs} paused={paused} size="lg" />
        {lesson.durationMin ? (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="text-xs text-white/50 tabular-nums">
              of {lesson.durationMin}:00 · {Math.round(progressValue)}%
            </div>
            <TeachProgress value={progressValue} />
          </div>
        ) : null}
      </div>

      <div className="mb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-normal text-white tracking-tight">
          {lesson.title}
        </h1>
        {lesson.goal && <p className="text-white/60 text-sm mt-1">{lesson.goal}</p>}
      </div>

      {lesson.planSteps.length > 0 && (
        <TeachCard className="mb-4">
          <div className="text-xs uppercase tracking-[0.14em] text-white/50 font-semibold mb-3">
            Plan
          </div>
          <ul className="space-y-1">
            {lesson.planSteps.map((step, idx) => {
              const done = session.completedStepIds.includes(step.id)
              const firstUndone = lesson.planSteps.findIndex(
                (s) => !session.completedStepIds.includes(s.id),
              )
              const current = !done && idx === firstUndone
              return (
                <li
                  key={step.id}
                  className={[
                    "teach-step",
                    done ? "teach-step--done" : "",
                    current ? "teach-step--current" : "",
                    !done && !current ? "teach-step--future" : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    aria-pressed={done}
                    aria-label={`Mark step ${idx + 1} ${done ? "undone" : "done"}`}
                    onClick={() => toggleStepDone(step.id)}
                    className={[
                      "teach-step__check",
                      done ? "teach-step__check--done" : "",
                    ].join(" ")}
                  >
                    {done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className={["teach-step__title text-sm font-medium"].join(" ")}>{step.text}</div>
                    {current && <div className="text-xs text-white/50 mt-0.5">Step {idx + 1} of {totalSteps} · current</div>}
                  </div>
                </li>
              )
            })}
          </ul>
          {!addingStep ? (
            <button
              type="button"
              onClick={() => setAddingStep(true)}
              className="mt-3 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
            >
              <Plus size={12} /> Add step · on the fly
            </button>
          ) : (
            <div className="mt-3 flex gap-2">
              <input
                autoFocus
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addStepInline()
                  } else if (e.key === "Escape") {
                    setAddingStep(false)
                    setNewStep("")
                  }
                }}
                placeholder="New step…"
                className="flex-1 bg-transparent border-b border-white/20 focus:border-white/50 outline-none text-white placeholder:text-white/30 text-sm py-1"
              />
              <TeachBtn variant="secondary" onClick={() => { setAddingStep(false); setNewStep("") }}>
                Cancel
              </TeachBtn>
              <TeachBtn variant="primary" onClick={addStepInline} disabled={!newStep.trim()}>
                Add
              </TeachBtn>
            </div>
          )}
        </TeachCard>
      )}

      {captures.length > 0 && (
        <TeachCard className="mb-24">
          <div className="text-xs uppercase tracking-[0.14em] text-white/50 font-semibold mb-3">
            Captures · {captures.length}
          </div>
          <ul className="space-y-2">
            {captures.map((c) => (
              <li key={c.id} className="text-sm text-white/85 flex gap-2">
                <span className="text-white/40 text-xs w-10 flex-shrink-0 tabular-nums">
                  {Math.floor(c.relMs / 60000)}:{String(Math.floor((c.relMs % 60000) / 1000)).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  {c.kind === "quote" && c.text && (
                    <span className="atoz-quote text-[15px] block">“{c.text}”</span>
                  )}
                  {c.kind !== "quote" && c.text}
                  {c.kind === "photo" && (c.dataUrl || c.blobId) && (
                    <CapturePhoto
                      dataUrl={c.dataUrl}
                      blobId={c.blobId}
                      alt="Capture"
                      className="mt-1 max-h-40 rounded"
                    />
                  )}
                  {c.kind === "voice" && (c.dataUrl || c.blobId) && (
                    <CaptureAudio
                      dataUrl={c.dataUrl}
                      blobId={c.blobId}
                      className="mt-1 w-full max-w-[320px]"
                    />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </TeachCard>
      )}

      {/* CAPTURE DIALOG — inline lightbox */}
      {openCaptureKind && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={(e) => {
            if (e.currentTarget === e.target) closeCaptureDialog()
          }}
        >
          <div className="w-full max-w-[480px] bg-[#1b1f15] border border-white/10 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-lg capitalize">{openCaptureKind}</div>
              <button onClick={closeCaptureDialog} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {openCaptureKind === "photo" ? (
              <>
                {photoPending ? (
                  <CapturePhoto
                    dataUrl={photoPending.dataUrl ?? photoPreviewUrl ?? undefined}
                    blobId={photoPending.dataUrl ? undefined : photoPending.blobId}
                    alt="preview"
                    className="rounded-lg max-h-64 mx-auto"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoFile(file)
                      }}
                    />
                    <TeachBtn variant="primary" onClick={() => photoInputRef.current?.click()}>
                      <Camera size={14} className="mr-1" aria-hidden="true" /> Take photo
                    </TeachBtn>
                    <TeachBtn
                      variant="secondary"
                      onClick={() => {
                        if (!photoInputRef.current) return
                        photoInputRef.current.removeAttribute("capture")
                        photoInputRef.current.click()
                        photoInputRef.current.setAttribute("capture", "environment")
                      }}
                    >
                      <Upload size={14} className="mr-1" aria-hidden="true" /> Upload
                    </TeachBtn>
                  </div>
                )}
                <textarea
                  value={captureText}
                  onChange={(e) => setCaptureText(e.target.value.slice(0, 2000))}
                  placeholder="Optional caption…"
                  rows={2}
                  className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/25 resize-none"
                />
              </>
            ) : openCaptureKind === "voice" ? (
              <div className="space-y-3">
                {voicePending ? (
                  <div className="space-y-2">
                    <CaptureAudio
                      dataUrl={voicePending.dataUrl}
                      blobId={voicePending.blobId}
                      className="w-full"
                    />
                    <div className="text-xs text-white/50">
                      {(voicePending.durationMs / 1000).toFixed(1)}s recorded.
                    </div>
                    <TeachBtn
                      variant="secondary"
                      onClick={() => {
                        setVoicePending(null)
                        setVoiceRecordedMs(0)
                      }}
                    >
                      Redo
                    </TeachBtn>
                  </div>
                ) : voiceRecording ? (
                  <div className="flex items-center gap-3">
                    <TeachBtn variant="primary" onClick={stopVoiceRecording}>
                      <StopCircle size={14} className="mr-1" aria-hidden="true" /> Stop
                    </TeachBtn>
                    <span className="text-sm text-white/70 tabular-nums">
                      {Math.floor(voiceRecordedMs / 1000)}s
                    </span>
                    <span
                      className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <TeachBtn variant="primary" onClick={startVoiceRecording}>
                    <Mic size={14} className="mr-1" aria-hidden="true" /> Start recording
                  </TeachBtn>
                )}
                <textarea
                  value={captureText}
                  onChange={(e) => setCaptureText(e.target.value.slice(0, 2000))}
                  placeholder="Optional transcript or context…"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/25 resize-none"
                />
              </div>
            ) : (
              <textarea
                autoFocus
                value={captureText}
                onChange={(e) => setCaptureText(e.target.value.slice(0, 2000))}
                placeholder={openCaptureKind === "quote" ? "Their exact words…" : "Jot a note…"}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/25 resize-none"
              />
            )}
            <div className="flex justify-end gap-2 mt-4">
              <TeachBtn variant="secondary" onClick={closeCaptureDialog}>Cancel</TeachBtn>
              <TeachBtn
                variant="primary"
                onClick={saveCapture}
                disabled={!captureText.trim() && !photoPending && !voicePending}
              >
                Save
              </TeachBtn>
            </div>
          </div>
        </div>
      )}

      <CaptureBar>
        <TeachBtn onClick={() => setOpenCaptureKind("note")} aria-label="Add note">
          <MessageSquare size={14} /> Note
        </TeachBtn>
        <TeachBtn onClick={() => setOpenCaptureKind("photo")} aria-label="Add photo">
          <Camera size={14} /> Photo
        </TeachBtn>
        <TeachBtn onClick={() => setOpenCaptureKind("quote")} aria-label="Capture quote">
          <Quote size={14} /> Quote
        </TeachBtn>
        <TeachBtn onClick={() => setOpenCaptureKind("voice")} aria-label="Add voice note">
          <Mic size={14} /> Voice
        </TeachBtn>
        <TeachBtn onClick={togglePause} aria-label={paused ? "Resume" : "Pause"}>
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </TeachBtn>
        <TeachBtn variant="primary" onClick={endLesson} aria-label="End lesson">
          <Square size={14} /> End
        </TeachBtn>
      </CaptureBar>
    </TeachScreen>
  )
}
