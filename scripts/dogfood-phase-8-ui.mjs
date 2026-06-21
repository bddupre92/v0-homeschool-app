#!/usr/bin/env node
/**
 * Walks every Phase 8 user-facing surface in headless Chromium and
 * dumps headings + visible button labels + visible link counts, so a
 * human can scan friction points quickly.
 *
 * Prereq: prod server on http://localhost:3000 with auth bypass on.
 */

import { chromium } from "@playwright/test"

const BASE = process.env.REVIEW_BASE_URL ?? "http://localhost:3000"

const FILING_TYPES = [
  { label: "NY IHIP (annual)", section: "ny:ihip" },
  { label: "NY Quarterly Report", section: "ny:quarterly" },
  { label: "PA Act 169 Portfolio", section: "pa:portfolio" },
  { label: "MA Home Education Plan", section: "ma:plan" },
  { label: "Oregon Notification of Intent", section: "or:notification" },
  { label: "Oregon Test Results", section: "or:test-results" },
]

async function snapshot(page, label) {
  const data = await page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"
    }
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim().slice(0, 80)
    return {
      h1: document.querySelector("h1")?.textContent?.trim(),
      h2s: [...document.querySelectorAll("h2")].filter(vis).map((h) => clean(h.textContent)),
      labelCount: document.querySelectorAll("label").length,
      buttonCount: [...document.querySelectorAll("button,[role=button],[role=switch],input[type=submit]")].filter(vis).length,
      textareaCount: document.querySelectorAll("textarea").length,
      inputCount: document.querySelectorAll("input").length,
      legends: [...document.querySelectorAll("legend")].filter(vis).map((l) => clean(l.textContent)),
    }
  })
  console.log(`\n--- ${label} ---`)
  console.log(`  h1:       ${data.h1}`)
  console.log(`  legends:  ${data.legends.join(" | ")}`)
  if (data.h2s.length) console.log(`  h2:       ${data.h2s.join(" | ")}`)
  console.log(`  controls: ${data.buttonCount} btns, ${data.labelCount} labels, ${data.textareaCount} textareas, ${data.inputCount} inputs`)
  return data
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log("=== Phase 8 UI dogfood ===")

// /filings (fallback)
await page.goto(`${BASE}/filings`, { waitUntil: "networkidle" })
await page.waitForTimeout(500)
await snapshot(page, "/filings (Postgres unset → fallback)")

// /filings/new — initial render (NY IHIP default)
await page.goto(`${BASE}/filings/new`, { waitUntil: "networkidle" })
await page.waitForTimeout(800)
await snapshot(page, "/filings/new (default = NY IHIP)")

// Walk every filing type
for (const ft of FILING_TYPES.slice(1)) {
  await page.getByRole("switch", { name: ft.label }).click()
  await page.waitForTimeout(400)
  await snapshot(page, `/filings/new → ${ft.label}`)
}

// /today WITHOUT onboarding state
await page.goto(`${BASE}/today`, { waitUntil: "networkidle" })
await page.waitForTimeout(800)
const today1 = await page.evaluate(() => ({
  hasCard: document.body.innerText.includes("Filings due soon"),
}))
console.log(`\n--- /today (no onboarding state) ---`)
console.log(`  FilingsDueSoon visible? ${today1.hasCard ? "YES (unexpected)" : "NO (expected)"}`)

// /today WITH onboarding state = NY
await page.goto(`${BASE}/today`, { waitUntil: "networkidle" })
await page.evaluate(() => {
  localStorage.setItem("atoz.onboarding", JSON.stringify({ completed: true, state: "NY", completedAt: new Date().toISOString() }))
})
await page.reload({ waitUntil: "networkidle" })
await page.waitForTimeout(1500)
const today2 = await page.evaluate(() => {
  const card = document.querySelector('section[aria-label*="filings" i]')
  return {
    hasCard: document.body.innerText.includes("Filings due soon"),
    cardText: card?.innerText?.slice(0, 600) || null,
  }
})
console.log(`\n--- /today (onboarding state = NY) ---`)
console.log(`  FilingsDueSoon visible? ${today2.hasCard ? "YES (expected)" : "NO (unexpected)"}`)
if (today2.cardText) {
  console.log("  card content:")
  for (const line of today2.cardText.split("\n").slice(0, 15)) {
    console.log(`    ${line}`)
  }
}

// /today WITH onboarding state = OR (different state for variety)
await page.evaluate(() => {
  localStorage.setItem("atoz.onboarding", JSON.stringify({ completed: true, state: "OR", completedAt: new Date().toISOString() }))
})
await page.reload({ waitUntil: "networkidle" })
await page.waitForTimeout(1500)
const today3 = await page.evaluate(() => {
  const card = document.querySelector('section[aria-label*="filings" i]')
  return {
    hasCard: document.body.innerText.includes("Filings due soon"),
    cardText: card?.innerText?.slice(0, 600) || null,
  }
})
console.log(`\n--- /today (onboarding state = OR) ---`)
console.log(`  FilingsDueSoon visible? ${today3.hasCard ? "YES (expected)" : "NO (unexpected)"}`)
if (today3.cardText) {
  console.log("  card content:")
  for (const line of today3.cardText.split("\n").slice(0, 15)) {
    console.log(`    ${line}`)
  }
}

// /today with unsupported state (e.g., AZ — not in our 4)
await page.evaluate(() => {
  localStorage.setItem("atoz.onboarding", JSON.stringify({ completed: true, state: "AZ", completedAt: new Date().toISOString() }))
})
await page.reload({ waitUntil: "networkidle" })
await page.waitForTimeout(1500)
const today4 = await page.evaluate(() => ({
  hasCard: document.body.innerText.includes("Filings due soon"),
}))
console.log(`\n--- /today (onboarding state = AZ, unsupported) ---`)
console.log(`  FilingsDueSoon visible? ${today4.hasCard ? "YES (unexpected — leaking)" : "NO (expected)"}`)

await browser.close()
