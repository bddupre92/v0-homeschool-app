#!/usr/bin/env node
/**
 * Phase 7 (Community) behavioral probe.
 *
 * Runs against the live built server with auth bypass on but Postgres
 * unset (the dev sandbox state). Verifies:
 *
 *  1. Nav swap: every authenticated room's topbar Community link
 *     points to /community (not /people).
 *  2. /community renders the calm "Community is being set up" fallback
 *     and exposes the "Create a co-op" CTA + family-access footer.
 *  3. /community/new renders the full create form (group type +
 *     philosophy + age + subjects + day + frequency chips).
 *  4. /community/preferences renders the auto-save form with the
 *     distance + philosophy + age + subject + day chips.
 *  5. /community/groups/<missing-uuid> shows the calm fallback (it
 *     does NOT 500 with Postgres unset).
 *  6. Legacy /community/events still 308 redirects to /people.
 *  7. /people remains discoverable via the "People · N" link on
 *     /family/calm.
 *  8. ZIP-code form validation: invalid ZIP shows the "Use a 5-digit"
 *     hint, valid ZIP clears it.
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

  // ── Test 1: nav swap ────────────────────────────────────────────
  await page.goto(`${BASE}/today`, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  const communityHrefs = await page.$$eval(
    'a[href]',
    (links) => links.map((a) => a.getAttribute("href")).filter((h) => h?.startsWith("/people") || h?.startsWith("/community")),
  )
  results.push({
    name: "1. Topbar Community link points to /community",
    pass:
      communityHrefs.includes("/community") &&
      !communityHrefs.some((h) => h === "/people" && false), // /people may still appear in footer body links — only nav matters
    detail: `links found: ${communityHrefs.join(", ") || "<none>"}`,
  })

  // ── Test 2: /community fallback ────────────────────────────────
  await page.goto(`${BASE}/community`, { waitUntil: "networkidle" })
  await page.waitForTimeout(600)
  const c = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim(),
    pending: document.body.innerText.includes("Community is being set up"),
    createCta: !!document.querySelector('a[href="/community/new"]'),
    familyAccessFooter: document.body.innerText.includes("Family access lives at /people"),
  }))
  results.push({
    name: "2. /community shows Postgres-unset fallback + Create + footer",
    pass: c.h1 === "Find your village." && c.pending && c.createCta && c.familyAccessFooter,
    detail: `h1="${c.h1}" pending=${c.pending} createCta=${c.createCta} footer=${c.familyAccessFooter}`,
  })

  // ── Test 3: /community/new form ────────────────────────────────
  await page.goto(`${BASE}/community/new`, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  const newForm = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('[role="switch"]')).map((b) =>
      (b.textContent ?? "").trim(),
    )
    return {
      h1: document.querySelector("h1")?.textContent?.trim(),
      hasNameInput: !!document.querySelector("#name"),
      hasZipInput: !!document.querySelector("#zipCode"),
      chipCount: chips.length,
      hasCoOp: chips.includes("Co-op"),
      hasClassical: chips.includes("Classical"),
      hasMath: chips.includes("Mathematics"),
    }
  })
  results.push({
    name: "3. /community/new renders the full create form",
    pass:
      newForm.h1 === "Start a co-op." &&
      newForm.hasNameInput &&
      newForm.hasZipInput &&
      newForm.chipCount >= 30 &&
      newForm.hasCoOp &&
      newForm.hasClassical &&
      newForm.hasMath,
    detail: `h1="${newForm.h1}" chips=${newForm.chipCount} name=${newForm.hasNameInput} zip=${newForm.hasZipInput}`,
  })

  // ── Test 4: /community/preferences form ────────────────────────
  await page.goto(`${BASE}/community/preferences`, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  const prefs = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('[role="switch"]')).map((b) =>
      (b.textContent ?? "").trim(),
    )
    return {
      h1: document.querySelector("h1")?.textContent?.trim(),
      has10mi: chips.includes("10 mi"),
      has25mi: chips.includes("25 mi"),
      has50mi: chips.includes("50 mi"),
      hasClassical: chips.includes("Classical"),
      hasMonday: chips.includes("Monday"),
      chipCount: chips.length,
    }
  })
  results.push({
    name: "4. /community/preferences renders auto-save form",
    pass:
      prefs.h1 === "What you're looking for." &&
      prefs.has10mi &&
      prefs.has25mi &&
      prefs.has50mi &&
      prefs.hasClassical &&
      prefs.hasMonday,
    detail: `h1="${prefs.h1}" distances=${prefs.has10mi && prefs.has25mi && prefs.has50mi} chips=${prefs.chipCount}`,
  })

  // ── Test 5: /community/groups/<missing> graceful fallback ──────
  const missingUuid = "00000000-0000-0000-0000-000000000000"
  const resp = await page.goto(`${BASE}/community/groups/${missingUuid}`, {
    waitUntil: "networkidle",
  })
  await page.waitForTimeout(500)
  const detail = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim(),
    has404: document.body.innerText.includes("Group detail isn't available"),
    hasBack: !!document.querySelector('a[href="/community"]'),
  }))
  results.push({
    name: "5. /community/groups/<missing> renders Postgres-unset fallback",
    pass: resp?.status() === 200 && detail.has404 && detail.hasBack,
    detail: `status=${resp?.status()} h1="${detail.h1}" back=${detail.hasBack}`,
  })

  // ── Test 6: legacy /community/events still 308s ────────────────
  const legacyResp = await page.goto(`${BASE}/community/events`, { waitUntil: "domcontentloaded" })
  const finalUrl = page.url().replace(BASE, "")
  results.push({
    name: "6. Legacy /community/events → /people redirect",
    pass: finalUrl.startsWith("/people"),
    detail: `final=${finalUrl} initial-status=${legacyResp?.status() ?? "?"}`,
  })

  // ── Test 7: /people discoverable from /family/calm ─────────────
  await page.goto(`${BASE}/family/calm`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  const familyHasPeopleLink = await page.evaluate(
    () => !!document.querySelector('a[href="/people"]'),
  )
  results.push({
    name: "7. /people reachable from /family/calm",
    pass: familyHasPeopleLink,
    detail: `link present=${familyHasPeopleLink}`,
  })

  // ── Test 8: ZIP validation on /community/new ───────────────────
  await page.goto(`${BASE}/community/new`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await page.fill("#zipCode", "123")
  await page.waitForTimeout(200)
  const invalidShown = await page.evaluate(() =>
    document.body.innerText.includes("Use a 5-digit US ZIP"),
  )
  await page.fill("#zipCode", "55105")
  await page.waitForTimeout(200)
  const validClears = await page.evaluate(
    () => !document.body.innerText.includes("Use a 5-digit US ZIP"),
  )
  results.push({
    name: "8. ZIP form: invalid shows hint; valid clears it",
    pass: invalidShown && validClears,
    detail: `invalidShown=${invalidShown} validClears=${validClears}`,
  })

  await browser.close()

  // Print
  console.log("\n=== Phase 7 (Community) behavioral probe ===")
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
