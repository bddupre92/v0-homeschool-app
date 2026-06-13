import { beforeEach, describe, expect, it } from "vitest"
import {
  DRAFT_TTL_DAYS,
  getDraftExpiryDate,
  listLessons,
  newDraftLesson,
  pruneExpiredDrafts,
  restoreLesson,
  softDeleteLesson,
  upsertLesson,
} from "@/lib/atoz-store"

beforeEach(() => {
  localStorage.clear()
})

function withUpdatedAt(daysAgo: number, partial: Partial<ReturnType<typeof newDraftLesson>> = {}) {
  const draft = newDraftLesson({ title: `draft-${daysAgo}d`, subject: "Math", ...partial })
  const past = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
  // upsertLesson stamps updatedAt to now; force it back to the past for the test.
  const saved = upsertLesson(draft)
  saved.updatedAt = past
  upsertLesson(saved)
  // The second upsert restamps updatedAt — reach into storage to rewind.
  const all = listLessons()
  const idx = all.findIndex((l) => l.id === saved.id)
  if (idx >= 0) {
    all[idx] = { ...all[idx], updatedAt: past }
    localStorage.setItem("atoz.lessons", JSON.stringify(all))
  }
  return saved
}

describe("draft TTL", () => {
  it("getDraftExpiryDate returns null for non-drafts", () => {
    const scheduled = upsertLesson({
      ...newDraftLesson({ title: "scheduled", subject: "Math" }),
      status: "scheduled",
    })
    expect(getDraftExpiryDate(scheduled)).toBeNull()
  })

  it("getDraftExpiryDate returns updatedAt + DRAFT_TTL_DAYS for drafts", () => {
    const draft = upsertLesson(newDraftLesson({ title: "fresh", subject: "Math" }))
    const expiry = getDraftExpiryDate(draft)
    expect(expiry).not.toBeNull()
    const expected = new Date(draft.updatedAt)
    expected.setDate(expected.getDate() + DRAFT_TTL_DAYS)
    expect(expiry!.getTime()).toBe(expected.getTime())
  })

  it("pruneExpiredDrafts soft-deletes drafts older than TTL", () => {
    withUpdatedAt(40)
    const fresh = upsertLesson(newDraftLesson({ title: "fresh", subject: "Math" }))
    const pruned = pruneExpiredDrafts()
    expect(pruned).toBe(1)
    const visible = listLessons()
    expect(visible.find((l) => l.id === fresh.id)).toBeDefined()
    const all = listLessons({ includeDeleted: true })
    const expired = all.find((l) => l.title === "draft-40d")
    expect(expired?.deletedAt).toBeTruthy()
  })

  it("pruneExpiredDrafts is idempotent", () => {
    withUpdatedAt(40)
    expect(pruneExpiredDrafts()).toBe(1)
    expect(pruneExpiredDrafts()).toBe(0)
  })

  it("pruneExpiredDrafts ignores scheduled lessons even if old", () => {
    withUpdatedAt(40, { status: "scheduled" })
    expect(pruneExpiredDrafts()).toBe(0)
  })
})

describe("soft delete + restore", () => {
  it("softDeleteLesson hides the lesson from listLessons but keeps it for includeDeleted", () => {
    const draft = upsertLesson(newDraftLesson({ title: "x", subject: "Art" }))
    softDeleteLesson(draft.id)
    expect(listLessons().find((l) => l.id === draft.id)).toBeUndefined()
    const all = listLessons({ includeDeleted: true })
    expect(all.find((l) => l.id === draft.id)?.deletedAt).toBeTruthy()
  })

  it("restoreLesson clears deletedAt", () => {
    const draft = upsertLesson(newDraftLesson({ title: "x", subject: "Art" }))
    softDeleteLesson(draft.id)
    restoreLesson(draft.id)
    const found = listLessons().find((l) => l.id === draft.id)
    expect(found).toBeDefined()
    expect(found?.deletedAt).toBeUndefined()
  })
})
