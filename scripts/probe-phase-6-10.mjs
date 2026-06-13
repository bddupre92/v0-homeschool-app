#!/usr/bin/env node
/**
 * Phase 6.10 behavioral probe. Verifies the locked room contract end-to-end:
 *
 *   1. Today's checkbox toggles a "done" session (creates one if missing).
 *   2. /teach?edit=<id> opens the authoring dialog and strips the param.
 *   3. /teach?edit=<missing> shows a toast and lands on /teach with no dialog.
 *   4. Library "Recently deleted" surfaces soft-deleted lessons + Restore.
 *   5. pruneExpiredDrafts soft-deletes drafts older than 30 days on mount.
 *
 * Prereq: dev/prod server on http://localhost:3000 with auth bypass.
 */

import { chromium } from "@playwright/test"

const BASE = process.env.REVIEW_BASE_URL ?? "http://localhost:3000"

function days(d) {
  return d * 24 * 60 * 60 * 1000
}

async function seed(page, lessons) {
  await page.evaluate((rows) => {
    localStorage.setItem("atoz.lessons", JSON.stringify(rows))
    localStorage.setItem("atoz.kids", JSON.stringify([{ id: "k1", name: "Kid", color: "#7d9e7d", age: 8, weeklyTarget: 10, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]))
    // bounce so reactive useEffects refire
    window.dispatchEvent(new CustomEvent("atoz:change", { detail: { key: "atoz.lessons" } }))
  }, lessons)
}

async function probe() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const results = []

  // ── Test 1: /teach?edit=missing-id shows toast ───────────────────
  await page.goto(`${BASE}/teach?edit=does-not-exist`, { waitUntil: "networkidle" })
  // Toast takes a moment to render after the router.replace navigation.
  await page.waitForTimeout(2500)
  const toast = await page.locator("text=Lesson not found").count()
  const finalUrl = page.url().replace(BASE, "")
  results.push({
    name: "1. /teach?edit=<missing> toasts + strips param",
    pass: toast > 0 && finalUrl === "/teach",
    detail: `toast=${toast} url=${finalUrl}`,
  })

  // ── Test 2: pruneExpiredDrafts on /today removes 40-day-old drafts ─
  const now = new Date().toISOString()
  const old = new Date(Date.now() - days(40)).toISOString()
  await page.goto(`${BASE}/today`, { waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  await seed(page, [
    { id: "les_fresh", title: "Fresh draft", subject: "Math", kidIds: ["k1"], materials: [], planSteps: [], status: "draft", createdAt: now, updatedAt: now },
    { id: "les_stale", title: "Stale draft", subject: "Math", kidIds: ["k1"], materials: [], planSteps: [], status: "draft", createdAt: old, updatedAt: old },
  ])
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("atoz.lessons") || "[]"))
  const stale = stored.find((l) => l.id === "les_stale")
  const fresh = stored.find((l) => l.id === "les_fresh")
  results.push({
    name: "2. pruneExpiredDrafts soft-deletes 40d draft on /today mount",
    pass: Boolean(stale?.deletedAt) && !fresh?.deletedAt,
    detail: `staleDeleted=${Boolean(stale?.deletedAt)} freshAlive=${!fresh?.deletedAt}`,
  })

  // ── Test 3: Library "Recently deleted" chip shows the pruned draft ─
  await page.goto(`${BASE}/library`, { waitUntil: "networkidle" })
  await page.waitForTimeout(600)
  await page.getByRole("switch", { name: "Recently deleted" }).click()
  await page.waitForTimeout(400)
  const deletedRowVisible = await page.locator("text=Stale draft").count()
  const restoreVisible = await page.getByRole("button", { name: "Restore" }).count()
  results.push({
    name: "3. Library Recently deleted shows soft-deleted draft + Restore",
    pass: deletedRowVisible > 0 && restoreVisible > 0,
    detail: `row=${deletedRowVisible} restore=${restoreVisible}`,
  })

  // ── Test 4: Restore puts the draft back into Drafts ──────────────
  await page.getByRole("button", { name: "Restore" }).first().click()
  await page.waitForTimeout(600)
  await page.getByRole("switch", { name: "Drafts", exact: true }).click()
  await page.waitForTimeout(400)
  const draftBack = await page.locator("text=Stale draft").count()
  results.push({
    name: "4. Restore brings the draft back into Drafts filter",
    pass: draftBack > 0,
    detail: `back=${draftBack}`,
  })

  // ── Test 5: Today's checkbox toggles done ────────────────────────
  // First, schedule the fresh draft for today.
  await page.goto(`${BASE}/today`, { waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  await page.evaluate(() => {
    const all = JSON.parse(localStorage.getItem("atoz.lessons") || "[]")
    const idx = all.findIndex((l) => l.id === "les_fresh")
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        status: "scheduled",
        scheduledFor: new Date().toISOString(),
      }
      localStorage.setItem("atoz.lessons", JSON.stringify(all))
    }
    localStorage.setItem("atoz.sessions", "[]")
    window.dispatchEvent(new CustomEvent("atoz:change", { detail: { key: "atoz.lessons" } }))
  })
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  const checkboxBefore = await page.getByRole("checkbox", { name: "Mark complete" }).count()
  if (checkboxBefore > 0) {
    await page.getByRole("checkbox", { name: "Mark complete" }).first().click()
    await page.waitForTimeout(600)
    const sessions = await page.evaluate(() => JSON.parse(localStorage.getItem("atoz.sessions") || "[]"))
    const hasDoneSession = sessions.some((s) => s.lessonId === "les_fresh" && s.endedAt)
    const checkboxAfter = await page.getByRole("checkbox", { name: "Mark incomplete" }).count()
    results.push({
      name: "5. Today checkbox creates a done session + flips label",
      pass: hasDoneSession && checkboxAfter > 0,
      detail: `done=${hasDoneSession} flipped=${checkboxAfter}`,
    })
  } else {
    results.push({
      name: "5. Today checkbox creates a done session + flips label",
      pass: false,
      detail: "no Mark-complete checkbox rendered",
    })
  }

  // ── Test 6: pencil icon links to /teach?edit= ────────────────────
  const editHref = await page.locator('button[aria-label="Edit lesson in Teach"]').count()
  // Clicking should route to /teach with the dialog open
  if (editHref > 0) {
    await page.locator('button[aria-label="Edit lesson in Teach"]').first().click()
    await page.waitForTimeout(1000)
    const url = page.url().replace(BASE, "")
    const dialogVisible = await page.locator('[role="dialog"]').count()
    results.push({
      name: "6. Today pencil routes to /teach and opens authoring dialog",
      pass: url === "/teach" && dialogVisible > 0,
      detail: `url=${url} dialog=${dialogVisible}`,
    })
  } else {
    results.push({
      name: "6. Today pencil routes to /teach and opens authoring dialog",
      pass: false,
      detail: "no pencil button rendered",
    })
  }

  await browser.close()

  // Print
  console.log("\n=== Phase 6.10 behavioral probe ===")
  let passed = 0
  for (const r of results) {
    console.log(`${r.pass ? "✓" : "✗"} ${r.name}  (${r.detail})`)
    if (r.pass) passed += 1
  }
  console.log(`\n${passed}/${results.length} pass`)
  process.exit(passed === results.length ? 0 : 1)
}

probe().catch((e) => {
  console.error("Probe failed:", e)
  process.exit(2)
})
