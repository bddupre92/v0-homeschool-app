#!/usr/bin/env node
/**
 * Text-based usability walk: for each route, dump what actually renders —
 * headings, interactive elements (buttons/links with labels), and a text
 * digest — so pages can be audited without screenshots.
 *
 * Prereq: dev server on http://localhost:3000 with
 * NEXT_PUBLIC_DEV_BYPASS_AUTH=true.
 */

import { chromium } from "@playwright/test"

const BASE_URL = process.env.REVIEW_BASE_URL ?? "http://localhost:3000"

const ROUTES = [
  "/", "/today", "/teach", "/family/calm", "/people", "/library",
  "/onboarding", "/settings", "/settings/compliance", "/profile",
  "/sign-in", "/sign-up", "/reset-password", "/verify-email",
  "/invite/accept", "/design-system", "/admin", "/admin/backups",
  "/admin/seed-data", "/privacy-policy", "/terms-of-service", "/offline",
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

for (const route of ROUTES) {
  try {
    const resp = await page.goto(BASE_URL + route, { waitUntil: "networkidle", timeout: 45000 })
    await page.waitForTimeout(800)
    const finalUrl = page.url().replace(BASE_URL, "") || "/"

    const data = await page.evaluate(() => {
      const vis = (el) => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"
      }
      const clean = (t) => (t || "").replace(/\s+/g, " ").trim().slice(0, 90)

      const headings = [...document.querySelectorAll("h1,h2,h3")]
        .filter(vis)
        .map((h) => `${h.tagName.toLowerCase()}: ${clean(h.textContent)}`)
        .slice(0, 25)

      const buttons = [...document.querySelectorAll("button,[role=button],input[type=submit]")]
        .filter(vis)
        .map((b) => clean(b.textContent || b.getAttribute("aria-label") || b.value || "<unlabeled>"))
        .filter(Boolean)
        .slice(0, 60)

      const links = [...document.querySelectorAll("a[href]")]
        .filter(vis)
        .map((a) => `${clean(a.textContent || a.getAttribute("aria-label") || "<unlabeled>")} -> ${a.getAttribute("href")}`)
        .slice(0, 60)

      const bodyText = clean(document.body.innerText.slice(0, 2200)).slice(0, 1400)

      return { headings, buttons, links, bodyText }
    })

    console.log(`\n${"=".repeat(70)}`)
    console.log(`ROUTE ${route}  [HTTP ${resp?.status()}]${finalUrl !== route ? `  REDIRECTED -> ${finalUrl}` : ""}`)
    console.log(`-- headings --`)
    data.headings.forEach((h) => console.log(`  ${h}`))
    console.log(`-- buttons (${data.buttons.length}) --`)
    data.buttons.forEach((b) => console.log(`  [${b}]`))
    console.log(`-- links (${data.links.length}) --`)
    data.links.forEach((l) => console.log(`  ${l}`))
    console.log(`-- text digest --`)
    console.log(`  ${data.bodyText}`)
  } catch (err) {
    console.log(`\n${"=".repeat(70)}`)
    console.log(`ROUTE ${route}  ERROR: ${String(err).split("\n")[0]}`)
  }
}

await browser.close()
