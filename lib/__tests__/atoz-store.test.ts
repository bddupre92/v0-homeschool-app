import { beforeEach, describe, expect, it } from "vitest"
import {
  deleteKid,
  deleteLesson,
  getAdvisorPrefs,
  getKid,
  getLesson,
  getOnboarding,
  getTodayLayout,
  listKids,
  listLessons,
  newDraftKid,
  newDraftLesson,
  resetKids,
  seedKidsIfEmpty,
  setAdvisorPrefs,
  setOnboarding,
  setTodayLayout,
  upsertKid,
  upsertLesson,
  type Kid,
  type Lesson,
} from "@/lib/atoz-store"

beforeEach(() => {
  window.localStorage.clear()
})

describe("kids CRUD", () => {
  it("starts empty", () => {
    expect(listKids()).toEqual([])
  })

  it("round-trips a kid through upsert / get", () => {
    const draft = newDraftKid({ name: "Emma", color: "#d46e4d", age: 9 })
    const saved = upsertKid(draft)
    expect(saved.name).toBe("Emma")
    const got = getKid(saved.id)
    expect(got?.name).toBe("Emma")
    expect(got?.createdAt).toBeDefined()
  })

  it("updates an existing kid without creating a duplicate", () => {
    const k = upsertKid(newDraftKid({ name: "Emma", color: "#d46e4d" }))
    const updated = upsertKid({ ...k, name: "Em" })
    expect(updated.id).toBe(k.id)
    expect(listKids()).toHaveLength(1)
    expect(getKid(k.id)?.name).toBe("Em")
  })

  it("deletes a kid", () => {
    const k = upsertKid(newDraftKid({ name: "Noah", color: "#7d9e7d" }))
    deleteKid(k.id)
    expect(getKid(k.id)).toBeUndefined()
    expect(listKids()).toHaveLength(0)
  })

  it("newDraftKid produces valid defaults with a unique id prefix", () => {
    const a = newDraftKid()
    const b = newDraftKid()
    expect(a.id).toMatch(/^kid_/)
    expect(b.id).not.toBe(a.id)
    expect(a.color).toBeTruthy()
    expect(a.weeklyTarget).toBeGreaterThan(0)
  })

  it("seedKidsIfEmpty writes seeds only when empty", () => {
    const seed: Omit<Kid, "createdAt" | "updatedAt">[] = [
      { id: "emma", name: "Emma", color: "#d46e4d", age: 9, weeklyTarget: 17.5 },
    ]
    seedKidsIfEmpty(seed)
    expect(listKids()).toHaveLength(1)
    // Calling again is a no-op because the list is no longer empty.
    seedKidsIfEmpty([
      { id: "noah", name: "Noah", color: "#7d9e7d", age: 7, weeklyTarget: 17.5 },
    ])
    expect(listKids()).toHaveLength(1)
    expect(getKid("emma")).toBeDefined()
    expect(getKid("noah")).toBeUndefined()
  })

  it("resetKids wipes the roster", () => {
    upsertKid(newDraftKid({ name: "Emma" }))
    upsertKid(newDraftKid({ name: "Noah" }))
    expect(listKids()).toHaveLength(2)
    resetKids()
    expect(listKids()).toHaveLength(0)
  })
})

describe("lessons CRUD", () => {
  it("round-trips a lesson through upsert / get / delete", () => {
    const draft = newDraftLesson({ title: "Intro to fractions", subject: "Mathematics" })
    const saved = upsertLesson(draft)
    expect(getLesson(saved.id)?.title).toBe("Intro to fractions")
    deleteLesson(saved.id)
    expect(getLesson(saved.id)).toBeUndefined()
  })

  it("newDraftLesson starts as draft with unique id", () => {
    const l = newDraftLesson({ title: "x", subject: "Art" })
    expect(l.status).toBe("draft")
    expect(l.id).toMatch(/^les_/)
  })

  it("upsertLesson prepends new lessons so listLessons is newest-first", () => {
    const a = upsertLesson(newDraftLesson({ title: "a", subject: "Art" }))
    const b = upsertLesson(newDraftLesson({ title: "b", subject: "Music" }))
    const all = listLessons()
    expect(all[0].id).toBe(b.id)
    expect(all[1].id).toBe(a.id)
  })
})

describe("preferences", () => {
  it("today layout defaults to 'agenda' and persists", () => {
    expect(getTodayLayout()).toBe("agenda")
    setTodayLayout("per-kid")
    expect(getTodayLayout()).toBe("per-kid")
    setTodayLayout("compass")
    expect(getTodayLayout()).toBe("compass")
  })

  it("onboarding starts not completed and merges partial updates", () => {
    expect(getOnboarding().completed).toBe(false)
    setOnboarding({ state: "FL" })
    expect(getOnboarding()).toMatchObject({ completed: false, state: "FL" })
    setOnboarding({ completed: true })
    expect(getOnboarding()).toMatchObject({ completed: true, state: "FL" })
  })

  it("advisor prefs default off and toggle cleanly", () => {
    expect(getAdvisorPrefs().enabled).toBe(false)
    setAdvisorPrefs({ enabled: true })
    expect(getAdvisorPrefs().enabled).toBe(true)
    setAdvisorPrefs({ enabled: false })
    expect(getAdvisorPrefs().enabled).toBe(false)
  })
})
