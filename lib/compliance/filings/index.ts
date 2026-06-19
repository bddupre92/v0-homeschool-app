/**
 * Filing-template registry. Phase 8 dispatches by `{ state, filingType }`.
 *
 * 8.1 ships OR notification only. 8.2 adds NY IHIP + PA portfolio.
 * 8.3 adds MA generic + OR test results submission.
 */

import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import type { ReactElement } from "react"
import { OR_NOTIFICATION_META, OregonNotificationPdf } from "./or-notification"
import { OR_TEST_RESULTS_META, OregonTestResultsPdf } from "./or-test-results"
import { NY_IHIP_META, NyIhipPdf } from "./ny-ihip"
import { NY_QUARTERLY_META, NyQuarterlyPdf } from "./ny-quarterly"
import { PA_PORTFOLIO_META, PaPortfolioPdf } from "./pa-portfolio"
import { MA_PLAN_META, MaPlanPdf } from "./ma-plan"
import type { FilingSnapshot, FilingTypeMeta } from "./types"

type Renderer = (input: { snapshot: FilingSnapshot }) => ReactElement<DocumentProps>

const REGISTRY: Record<string, { meta: FilingTypeMeta; render: Renderer }> = {
  "ny:ihip": { meta: NY_IHIP_META, render: NyIhipPdf },
  "ny:quarterly": { meta: NY_QUARTERLY_META, render: NyQuarterlyPdf },
  "pa:portfolio": { meta: PA_PORTFOLIO_META, render: PaPortfolioPdf },
  "ma:plan": { meta: MA_PLAN_META, render: MaPlanPdf },
  "or:notification": { meta: OR_NOTIFICATION_META, render: OregonNotificationPdf },
  "or:test-results": { meta: OR_TEST_RESULTS_META, render: OregonTestResultsPdf },
}

export function listFilingTypes(): FilingTypeMeta[] {
  return Object.values(REGISTRY).map((r) => r.meta)
}

export function getFilingMeta(state: string, filingType: string): FilingTypeMeta | null {
  return REGISTRY[`${state}:${filingType}`]?.meta ?? null
}

/** Render a filing PDF to a Buffer. Server-side only. */
export async function renderFilingPdf(snapshot: FilingSnapshot): Promise<Buffer> {
  const key = `${snapshot.state}:${snapshot.filingType}`
  const entry = REGISTRY[key]
  if (!entry) throw new Error(`No filing template registered for ${key}`)
  return await renderToBuffer(entry.render({ snapshot }))
}

export { OR_NOTIFICATION_META } from "./or-notification"
export { OR_TEST_RESULTS_META } from "./or-test-results"
export { NY_IHIP_META } from "./ny-ihip"
export { NY_QUARTERLY_META } from "./ny-quarterly"
export { PA_PORTFOLIO_META } from "./pa-portfolio"
export { MA_PLAN_META } from "./ma-plan"
export type {
  FilingSnapshot,
  FilingTypeMeta,
  FilingCurriculumLine,
  FilingHoursBySubject,
  FilingPortfolioSample,
  FilingTestResult,
  FilingSubjectProgress,
  FilingEvaluator,
} from "./types"
