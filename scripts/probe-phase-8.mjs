#!/usr/bin/env node
/**
 * Phase 8 (State Compliance Generator) behavioral probe.
 *
 * Runs against the live built server with auth bypass on but Postgres
 * unset (the dev sandbox state). Verifies:
 *
 *  1. /filings renders the Postgres-unset fallback at status 200.
 *  2. /filings/new renders all six filing-option chips.
 *  3. /api/filings/<id>/download returns 503 with Postgres unset.
 *  4. /api/filings/<id>/sidecar returns 503 with Postgres unset.
 *  5. NY IHIP picker seeds the K-6 required-subjects curriculum list.
 *  6. NY Quarterly picker reveals Q1-Q4 chips.
 *  7. PA Portfolio picker seeds the required-subjects hour inputs.
 *  8. MA Plan picker seeds the MA required-subjects + a Competence
 *     textarea.
 *  9. OR Test Results picker seeds at least one test row.
 *  10. FilingsDueSoon card on /today stays hidden when the user has no
 *      onboarding state (avoids surfacing irrelevant deadlines).
 *
 * Prereq: prod server on http://localhost:3000 with
 * NEXT_PUBLIC_DEV_BYPASS_AUTH=true.
 */

import { chromium } from "@playwright/test"

const BASE = process.env.REVIEW_BASE_URL ?? "http://localhost:3000"

async function probe() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const results = []

  // ── 1: /filings fallback ───────────────────────────────────────
  await page.goto(`${BASE}/filings`, { waitUntil: "networkidle" })
  await page.waitForTimeout(600)
  const filings = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim(),
    body: document.body.innerText,
  }))
  results.push({
    name: "1. /filings renders the Postgres-unset fallback",
    pass:
      filings.h1?.includes("Filings need a connected database") &&
      filings.body.includes("Filings need a connected database"),
    detail: `h1="${filings.h1}"`,
  })

  // ── 2: /filings/new has six filing options ─────────────────────
  await page.goto(`${BASE}/filings/new`, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  const newPage = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('[role="switch"]'))
      .map((b) => (b.textContent ?? "").trim())
    return {
      h1: document.querySelector("h1")?.textContent?.trim(),
      hasNY_IHIP: chips.includes("NY IHIP (annual)"),
      hasNY_Quarterly: chips.includes("NY Quarterly Report"),
      hasPA_Portfolio: chips.includes("PA Act 169 Portfolio"),
      hasMA_Plan: chips.includes("MA Home Education Plan"),
      hasOR_Notification: chips.includes("Oregon Notification of Intent"),
      hasOR_TestResults: chips.includes("Oregon Test Results"),
      chipCount: chips.length,
    }
  })
  results.push({
    name: "2. /filings/new exposes all six filing types",
    pass:
      newPage.h1 === "Generate a filing." &&
      newPage.hasNY_IHIP &&
      newPage.hasNY_Quarterly &&
      newPage.hasPA_Portfolio &&
      newPage.hasMA_Plan &&
      newPage.hasOR_Notification &&
      newPage.hasOR_TestResults,
    detail: `chips=${newPage.chipCount} h1="${newPage.h1}"`,
  })

  // ── 3 + 4: download + sidecar return 503 with no Postgres ──────
  const missingUuid = "00000000-0000-0000-0000-000000000000"
  const dlResp = await page.goto(`${BASE}/api/filings/${missingUuid}/download`, {
    waitUntil: "domcontentloaded",
  })
  results.push({
    name: "3. /api/filings/<id>/download returns 503 when Postgres unset",
    pass: dlResp?.status() === 503,
    detail: `status=${dlResp?.status()}`,
  })

  const scResp = await page.goto(`${BASE}/api/filings/${missingUuid}/sidecar`, {
    waitUntil: "domcontentloaded",
  })
  results.push({
    name: "4. /api/filings/<id>/sidecar returns 503 when Postgres unset",
    pass: scResp?.status() === 503,
    detail: `status=${scResp?.status()}`,
  })

  // ── 5: NY IHIP picker seeds K-6 curriculum textareas ───────────
  await page.goto(`${BASE}/filings/new`, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  // Picker is reactive — the seed effect requires the picker selection to
  // mount with a known grade. /filings/new defaults to NY IHIP so this should
  // seed automatically.
  const ihipFields = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll("label"))
      .map((l) => (l.textContent || "").trim())
      .filter(Boolean)
    return {
      hasArithmetic: labels.includes("Arithmetic"),
      hasReading: labels.includes("Reading"),
      hasUSHistory: labels.includes("US History"),
      hasPE: labels.includes("Physical Education"),
      textareaCount: document.querySelectorAll("textarea").length,
    }
  })
  results.push({
    name: "5. NY IHIP picker seeds K-6 required-subjects curriculum",
    pass:
      ihipFields.hasArithmetic &&
      ihipFields.hasReading &&
      ihipFields.hasUSHistory &&
      ihipFields.hasPE &&
      ihipFields.textareaCount >= 12,
    detail: `arith=${ihipFields.hasArithmetic} reading=${ihipFields.hasReading} hist=${ihipFields.hasUSHistory} pe=${ihipFields.hasPE} textareas=${ihipFields.textareaCount}`,
  })

  // ── 6: NY Quarterly picker reveals Q1-Q4 chips ─────────────────
  await page.getByRole("switch", { name: "NY Quarterly Report" }).click()
  await page.waitForTimeout(400)
  const qFields = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('[role="switch"]'))
      .map((b) => (b.textContent ?? "").trim())
    return {
      hasQ1: chips.includes("Q1"),
      hasQ2: chips.includes("Q2"),
      hasQ3: chips.includes("Q3"),
      hasQ4: chips.includes("Q4"),
    }
  })
  results.push({
    name: "6. NY Quarterly reveals Q1-Q4 chips",
    pass: qFields.hasQ1 && qFields.hasQ2 && qFields.hasQ3 && qFields.hasQ4,
    detail: `Q1=${qFields.hasQ1} Q2=${qFields.hasQ2} Q3=${qFields.hasQ3} Q4=${qFields.hasQ4}`,
  })

  // ── 7: PA Portfolio picker seeds the required-subjects hours ───
  await page.getByRole("switch", { name: "PA Act 169 Portfolio" }).click()
  await page.waitForTimeout(400)
  const paFields = await page.evaluate(() => {
    const text = document.body.innerText
    const placeholders = Array.from(document.querySelectorAll("input"))
      .map((i) => i.placeholder || "")
    return {
      hasReading: text.includes("English (reading)"),
      hasArithmetic: text.includes("Arithmetic"),
      hasSafety: text.includes("Safety"),
      hasEvaluator: placeholders.includes("Evaluator full name"),
    }
  })
  results.push({
    name: "7. PA Portfolio seeds required-subjects hour inputs",
    pass: paFields.hasReading && paFields.hasArithmetic && paFields.hasSafety && paFields.hasEvaluator,
    detail: `reading=${paFields.hasReading} arith=${paFields.hasArithmetic} safety=${paFields.hasSafety} evaluator=${paFields.hasEvaluator}`,
  })

  // ── 8: MA Plan picker seeds MA subjects + Competence textarea ──
  await page.getByRole("switch", { name: "MA Home Education Plan" }).click()
  await page.waitForTimeout(400)
  const maFields = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll("label"))
      .map((l) => (l.textContent || "").trim())
      .filter(Boolean)
    return {
      hasReading: labels.includes("Reading"),
      hasUSHistory: labels.includes("United States history"),
      hasCompetenceField: labels.some((l) =>
        l.toLowerCase().includes("competence / qualifications"),
      ),
    }
  })
  results.push({
    name: "8. MA Plan seeds MA subjects + Competence textarea",
    pass: maFields.hasReading && maFields.hasUSHistory && maFields.hasCompetenceField,
    detail: `reading=${maFields.hasReading} ushist=${maFields.hasUSHistory} competence=${maFields.hasCompetenceField}`,
  })

  // ── 9: OR Test Results picker seeds at least one test row ──────
  await page.getByRole("switch", { name: "Oregon Test Results" }).click()
  await page.waitForTimeout(400)
  const orFields = await page.evaluate(() => {
    const placeholders = Array.from(document.querySelectorAll("input"))
      .map((i) => i.placeholder || "")
      .filter(Boolean)
    return {
      hasTestNameField: placeholders.includes("Test name"),
      hasAddMoreButton: document.body.innerText.includes("Add another test result"),
    }
  })
  results.push({
    name: "9. OR Test Results seeds a test row + add-more button",
    pass: orFields.hasTestNameField && orFields.hasAddMoreButton,
    detail: `testNameField=${orFields.hasTestNameField} addMore=${orFields.hasAddMoreButton}`,
  })

  // ── 10: /today's FilingsDueSoon card is absent when no state set ──
  await page.goto(`${BASE}/today`, { waitUntil: "networkidle" })
  await page.waitForTimeout(1200)
  const todayCard = await page.evaluate(() => ({
    bodyHasFilingsDueSoon: document.body.innerText.includes("Filings due soon"),
  }))
  results.push({
    name: "10. /today hides FilingsDueSoon when no onboarding state",
    pass: !todayCard.bodyHasFilingsDueSoon,
    detail: `card-present=${todayCard.bodyHasFilingsDueSoon}`,
  })

  await browser.close()

  console.log("\n=== Phase 8 (State Compliance Generator) behavioral probe ===")
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
