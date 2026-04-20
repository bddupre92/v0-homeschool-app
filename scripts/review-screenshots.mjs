#!/usr/bin/env node
/**
 * MVP page-by-page review screenshot capture.
 *
 * Prereq: `NEXT_PUBLIC_DEV_BYPASS_AUTH=true npm run dev` must already be
 * running on http://localhost:3000. We intentionally do NOT spawn the dev
 * server here — the user drives that so port + env are obvious.
 *
 * Usage:
 *   node scripts/review-screenshots.mjs                # all routes, both viewports
 *   node scripts/review-screenshots.mjs --route=/today # single route
 *   node scripts/review-screenshots.mjs --viewport=desktop
 */

import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const BASE_URL = process.env.REVIEW_BASE_URL ?? "http://localhost:3000"

const CORE_ROUTES = [
  { slug: "root",               path: "/",                     label: "Landing" },
  { slug: "sign-in",            path: "/sign-in",              label: "Sign in" },
  { slug: "sign-up",            path: "/sign-up",              label: "Sign up" },
  { slug: "reset-password",     path: "/reset-password",       label: "Reset password" },
  { slug: "verify-email",       path: "/verify-email",         label: "Verify email" },
  { slug: "onboarding",         path: "/onboarding",           label: "Onboarding (3-step)" },
  { slug: "today",              path: "/today",                label: "Today (calm room)" },
  { slug: "teach",              path: "/teach",                label: "Teach (calm room)" },
  { slug: "family-calm",        path: "/family/calm",          label: "Family (calm room)" },
  { slug: "people",             path: "/people",               label: "Community (calm room)" },
  { slug: "library",            path: "/library",              label: "Library (calm room)" },
  { slug: "settings",           path: "/settings",             label: "Settings" },
  { slug: "settings-compliance",path: "/settings/compliance",  label: "Settings → Compliance" },
  { slug: "profile",            path: "/profile",              label: "Profile" },
]

const LEGACY_ROUTES = [
  { slug: "dashboard",              path: "/dashboard" },
  { slug: "planner",                path: "/planner" },
  { slug: "advisor",                path: "/advisor" },
  { slug: "plan",                   path: "/plan" },
  { slug: "resources",              path: "/resources" },
  { slug: "portfolio",              path: "/portfolio" },
  { slug: "boards",                 path: "/boards" },
  { slug: "scroll",                 path: "/scroll" },
  { slug: "search",                 path: "/search" },
  { slug: "community-groups",       path: "/community/groups" },
  { slug: "community-events",       path: "/community/events" },
  { slug: "community-locations",    path: "/community/locations" },
  { slug: "about",                  path: "/about" },
  { slug: "admin",                  path: "/admin" },
  { slug: "invite-accept",          path: "/invite/accept" },
  { slug: "privacy-policy",         path: "/privacy-policy" },
  { slug: "terms-of-service",       path: "/terms-of-service" },
  { slug: "offline",                path: "/offline" },
]

const VIEWPORTS = {
  mobile:  { width: 390,  height: 844 },  // iPhone 14
  desktop: { width: 1440, height: 900 },
}

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=")
      return [k, v ?? true]
    })
  )
  return {
    onlyRoute: args.route,
    onlyViewport: args.viewport,
    includeLegacy: Boolean(args.legacy),
  }
}

async function healthCheck() {
  try {
    const res = await fetch(BASE_URL, { redirect: "manual" })
    if (res.status >= 500) throw new Error(`dev server returned ${res.status}`)
  } catch (err) {
    console.error(`\n✗ Dev server not reachable at ${BASE_URL}`)
    console.error(`  Start it with:  NEXT_PUBLIC_DEV_BYPASS_AUTH=true npm run dev\n`)
    console.error(`  Underlying error: ${err.message}\n`)
    process.exit(1)
  }
}

async function capture({ browser, route, viewportName }) {
  const viewport = VIEWPORTS[viewportName]
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()

  const outDir = resolve(ROOT, "screenshots", viewportName)
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true })

  const url = BASE_URL + route.path
  const outPath = resolve(outDir, `${route.slug}.png`)

  const consoleErrors = []
  page.on("pageerror", (err) => consoleErrors.push(err.message))
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })

  let status = "ok"
  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 15000 })
    if (response && response.status() >= 400) status = `http-${response.status()}`
    // Give React a beat for client-side skeleton → data swap.
    await page.waitForTimeout(800)
    await page.screenshot({ path: outPath, fullPage: true })
  } catch (err) {
    status = `error: ${err.message.slice(0, 80)}`
    try { await page.screenshot({ path: outPath, fullPage: true }) } catch {}
  }

  await context.close()
  return { url, outPath, status, consoleErrors: consoleErrors.slice(0, 3) }
}

async function main() {
  const { onlyRoute, onlyViewport, includeLegacy } = parseArgs()
  await healthCheck()

  const routes = includeLegacy ? [...CORE_ROUTES, ...LEGACY_ROUTES] : CORE_ROUTES
  const filteredRoutes = onlyRoute
    ? routes.filter((r) => r.path === onlyRoute || r.slug === onlyRoute)
    : routes
  const viewportNames = onlyViewport ? [onlyViewport] : Object.keys(VIEWPORTS)

  if (filteredRoutes.length === 0) {
    console.error(`✗ No route matched --route=${onlyRoute}`)
    process.exit(1)
  }

  console.log(`Capturing ${filteredRoutes.length} route(s) × ${viewportNames.length} viewport(s)`)
  console.log(`Base URL: ${BASE_URL}\n`)

  const browser = await chromium.launch()
  const results = []
  for (const viewportName of viewportNames) {
    for (const route of filteredRoutes) {
      const result = await capture({ browser, route, viewportName })
      const tag = result.status === "ok" ? "✓" : "⚠"
      console.log(`${tag} ${viewportName.padEnd(7)} ${route.path.padEnd(28)} ${result.status}`)
      if (result.consoleErrors.length > 0) {
        for (const e of result.consoleErrors) console.log(`    console: ${e.slice(0, 120)}`)
      }
      results.push({ viewport: viewportName, ...route, ...result })
    }
  }
  await browser.close()

  const failed = results.filter((r) => r.status !== "ok")
  console.log(`\nDone. ${results.length - failed.length}/${results.length} ok.`)
  if (failed.length > 0) {
    console.log(`${failed.length} non-ok — review above.`)
  }
  console.log(`Screenshots: ${resolve(ROOT, "screenshots")}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
