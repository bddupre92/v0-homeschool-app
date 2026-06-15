/**
 * Filing-template registry. Phase 8 dispatches by `{ state, filingType }`.
 *
 * 8.1 ships OR notification only. 8.2 adds NY IHIP + PA portfolio.
 * 8.3 adds MA generic + OR test results submission.
 */

import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import type { ReactElement } from "react"
import { OR_NOTIFICATION_META, OregonNotificationPdf } from "./or-notification"
import type { FilingSnapshot, FilingTypeMeta } from "./types"

type Renderer = (input: { snapshot: FilingSnapshot }) => ReactElement<DocumentProps>

const REGISTRY: Record<string, { meta: FilingTypeMeta; render: Renderer }> = {
  "or:notification": { meta: OR_NOTIFICATION_META, render: OregonNotificationPdf },
  // future:
  // "ny:ihip": { ... },
  // "ny:quarterly": { ... },
  // "pa:portfolio": { ... },
  // "ma:plan": { ... },
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
export type { FilingSnapshot, FilingTypeMeta } from "./types"
