#!/usr/bin/env node
/**
 * Seed atoz-store localStorage and capture dynamic routes:
 * - /teach/[sessionId]       (requires a Lesson + LessonSession)
 * - /family/kid/emma         (requires portfolio items + weekly hours)
 *
 * Prereq: dev server running on http://localhost:3000 with
 * NEXT_PUBLIC_DEV_BYPASS_AUTH=true.
 */

import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const BASE_URL = "http://localhost:3000"

const VIEWPORTS = {
  mobile:  { width: 390,  height: 844 },
  desktop: { width: 1440, height: 900 },
}

const LESSON_ID = "les_reviewdemo"
const SESSION_ID = "ses_reviewdemo"

const lesson = {
  id: LESSON_ID,
  title: "Fractions on a number line",
  subject: "Mathematics",
  kidIds: ["emma"],
  durationMin: 30,
  goal: "Emma can place 1/2, 1/3, 2/3 on a 0–1 number line.",
  materials: ["Number line printout", "Colored pencils"],
  planSteps: [
    { id: "s1", text: "Warm-up: count by halves to 3", done: true },
    { id: "s2", text: "Place 1/2 on a 0–1 line",        done: true },
    { id: "s3", text: "Place 1/3 and 2/3",              done: false },
    { id: "s4", text: "Compare which is larger",        done: false },
    { id: "s5", text: "Reflect: which was trickiest?",  done: false },
  ],
  status: "scheduled",
  scheduledFor: new Date().toISOString(),
  createdAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
  updatedAt: new Date().toISOString(),
}

const session = {
  id: SESSION_ID,
  lessonId: LESSON_ID,
  startedAt: new Date(Date.now() - 12 * 60_000).toISOString(), // 12 min ago
  completedStepIds: ["s1", "s2"],
}

const portfolio = [
  {
    id: "pf_1",
    sessionId: "ses_earlier_1",
    lessonId: "les_earlier_1",
    kidId: "emma",
    title: "Counting by halves",
    subject: "Mathematics",
    date: new Date(Date.now() - 2 * 86400_000).toISOString(),
    quote: "I got to three really fast!",
    narration: "Emma paced the living room rug while counting.",
    photoUrls: [],
    notes: ["Confident through 2, slowed at 2.5."],
    rating: "good",
    minutes: 25,
    createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
  },
  {
    id: "pf_2",
    sessionId: "ses_earlier_2",
    lessonId: "les_earlier_2",
    kidId: "emma",
    title: "Sight words — week 2",
    subject: "Language Arts",
    date: new Date(Date.now() - 5 * 86400_000).toISOString(),
    quote: "That one’s ‘because’!",
    narration: "Flash cards on the kitchen floor.",
    photoUrls: [],
    notes: ["Mixed up ‘though’ and ‘through’ twice."],
    rating: "okay",
    minutes: 20,
    createdAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
  },
  {
    id: "pf_3",
    sessionId: "ses_earlier_3",
    lessonId: "les_earlier_3",
    kidId: "emma",
    title: "Leaf sorting",
    subject: "Science",
    date: new Date(Date.now() - 9 * 86400_000).toISOString(),
    narration: "Backyard field walk, sorted by vein pattern.",
    photoUrls: [],
    notes: ["Wanted to keep every leaf — smart compromise: one per kind."],
    rating: "great",
    minutes: 45,
    createdAt: new Date(Date.now() - 9 * 86400_000).toISOString(),
  },
]

async function seed(page) {
  await page.goto(BASE_URL + "/", { waitUntil: "domcontentloaded" })
  await page.evaluate(({ lesson, session, portfolio }) => {
    localStorage.setItem("atoz.lessons", JSON.stringify([lesson]))
    localStorage.setItem("atoz.sessions", JSON.stringify([session]))
    localStorage.setItem("atoz.portfolio", JSON.stringify(portfolio))
    localStorage.setItem("atoz.demoWeeklyHours", JSON.stringify({ emma: 14.5, noah: 12, lily: 9.5 }))
    window.dispatchEvent(new CustomEvent("atoz:change", { detail: { key: "seed" } }))
  }, { lesson, session, portfolio })
}

async function captureRoute(page, routePath, slug, viewportName) {
  const outDir = resolve(ROOT, "screenshots", viewportName)
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true })
  const outPath = resolve(outDir, `${slug}.png`)

  const consoleErrors = []
  page.on("pageerror", (err) => consoleErrors.push(err.message))
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()) })

  try {
    const response = await page.goto(BASE_URL + routePath, { waitUntil: "networkidle", timeout: 20000 })
    const status = response?.status() ?? "?"
    // Wait for either the page's "Loading..." to disappear or a long ceiling.
    await page.waitForFunction(
      () => !document.body.innerText.trim().startsWith("Loading"),
      { timeout: 8000 },
    ).catch(() => {})
    await page.waitForTimeout(1500)
    await page.screenshot({ path: outPath, fullPage: true })
    console.log(`✓ ${viewportName.padEnd(7)} ${routePath.padEnd(32)} http-${status}`)
    for (const e of consoleErrors.slice(0, 3)) console.log(`    console: ${e.slice(0, 160)}`)
  } catch (err) {
    console.log(`⚠ ${viewportName.padEnd(7)} ${routePath.padEnd(32)} error: ${err.message.slice(0, 80)}`)
    try { await page.screenshot({ path: outPath, fullPage: true }) } catch {}
  }
}

async function main() {
  const browser = await chromium.launch()
  for (const viewportName of Object.keys(VIEWPORTS)) {
    const context = await browser.newContext({ viewport: VIEWPORTS[viewportName] })
    const page = await context.newPage()
    await seed(page)
    await captureRoute(page, `/teach/${SESSION_ID}`, "teach-session", viewportName)
    await captureRoute(page, `/family/kid/emma`, "family-kid-emma", viewportName)
    await captureRoute(page, `/kid/emma`, "kid-mode-emma", viewportName)
    await context.close()
  }
  await browser.close()
  console.log("\nDone. Screenshots in screenshots/<viewport>/{teach-session,family-kid-emma,kid-mode-emma}.png")
}

main().catch((err) => { console.error(err); process.exit(1) })
