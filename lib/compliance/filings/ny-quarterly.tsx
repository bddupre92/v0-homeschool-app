/**
 * New York Quarterly Report.
 *
 * Required under § 100.10(g) and (h). Four reports per year submitted to
 * the local district superintendent (typically Nov 15, Jan 30, Mar 30,
 * June 30 — but the IHIP-approval letter sets the official dates). Each
 * report contains:
 *  - Hours of instruction completed during the quarter.
 *  - Description of material covered in each subject from the IHIP.
 *  - Either a numeric grade or written narrative evaluation per subject.
 *
 * Annual hours target: 900 (grades 1–6) or 990 (grades 7–12). The quarter
 * must show progress toward that target. The full-year fourth quarter
 * also serves as the annual assessment cover sheet — parents append a
 * standardized-test result or written narrative evaluation.
 */

import type { FilingSnapshot, FilingTypeMeta } from "./types"
import {
  FilingDisclaimer,
  FilingDocument,
  FilingFooter,
  FilingHeader,
  Page,
  StyleSheet,
  Text,
  View,
  baseStyles,
  palette,
} from "./shared"

export const NY_QUARTERLY_META: FilingTypeMeta = {
  state: "ny",
  filingType: "quarterly",
  title: "Quarterly Report",
  description:
    "One of four annual NY quarterly reports per § 100.10(g). Hours by subject, material covered, and narrative or grade evaluation.",
  citation: "8 NYCRR § 100.10(g)",
  recipient: "School District Superintendent",
}

const styles = StyleSheet.create({
  pillsRow: { flexDirection: "row", marginBottom: 16, gap: 6 },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 9,
    backgroundColor: "#eef0ec",
    color: palette.ink2,
  },
  twoCol: { flexDirection: "row", marginBottom: 4 },
  twoColLabel: { width: 140, color: palette.ink2, fontSize: 10 },
  twoColValue: { flex: 1, fontSize: 11 },
  subjectRow: {
    paddingVertical: 8,
    borderBottom: `0.5pt solid ${palette.rule}`,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  subjectName: { fontSize: 11, fontWeight: "bold" },
  subjectMeta: { fontSize: 10, color: palette.ink3 },
  subjectNarrative: { fontSize: 10, color: palette.ink2 },
  totals: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 8,
    borderTop: `1pt solid ${palette.rule}`,
  },
  emptyHint: {
    paddingVertical: 10,
    fontSize: 10,
    color: palette.ink3,
    fontStyle: "italic",
  },
})

function totalHours(snapshot: FilingSnapshot): number {
  const fromSubjects = snapshot.subjectProgress?.reduce((sum, s) => sum + (s.hoursThisPeriod ?? 0), 0)
  if (typeof fromSubjects === "number") return fromSubjects
  return snapshot.hoursBySubject?.reduce((sum, h) => sum + h.minutes / 60, 0) ?? 0
}

function annualTarget(grade?: string): number | null {
  if (!grade) return null
  const n = parseInt(grade.replace(/\D/g, ""), 10)
  if (Number.isNaN(n)) return null
  return n >= 7 ? 990 : 900
}

function formatDate(value?: string): string {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

export function NyQuarterlyPdf({ snapshot }: { snapshot: FilingSnapshot }) {
  const quarter = snapshot.quarter ?? 1
  const progress = snapshot.subjectProgress ?? []
  const totHours = totalHours(snapshot)
  const target = annualTarget(snapshot.child.grade)

  return (
    <FilingDocument
      title={`${NY_QUARTERLY_META.title} Q${quarter} — ${snapshot.child.name}`}
      author={snapshot.parent.displayName}
      creator="AtoZ Family"
      producer="AtoZ Family"
      subject={`NY Quarterly Q${quarter} for ${snapshot.child.name}, school year ${snapshot.schoolYear}`}
    >
      <Page size="LETTER" style={baseStyles.page}>
        <FilingHeader meta={NY_QUARTERLY_META} schoolYear={snapshot.schoolYear} />

        <View style={styles.pillsRow}>
          <Text style={styles.pill}>Quarter {quarter}</Text>
          {snapshot.child.grade && <Text style={styles.pill}>Grade {snapshot.child.grade}</Text>}
          {target && <Text style={styles.pill}>Annual target {target} hrs</Text>}
        </View>

        <Text style={baseStyles.h2}>Student</Text>
        <View>
          <Row label="Name" value={snapshot.child.name} />
          <Row label="Grade" value={snapshot.child.grade ?? ""} />
        </View>

        <Text style={baseStyles.h2}>Period covered</Text>
        <View>
          <Row label="From" value={formatDate(snapshot.periodStartDate)} />
          <Row label="To" value={formatDate(snapshot.periodEndDate)} />
          {snapshot.daysOfInstruction !== undefined && (
            <Row label="Days of instruction" value={String(snapshot.daysOfInstruction)} />
          )}
        </View>

        <Text style={baseStyles.h2}>Progress by subject</Text>
        {progress.length === 0 ? (
          <Text style={styles.emptyHint}>
            No per-subject progress recorded. Add hours + a narrative or grade per IHIP subject
            before submitting.
          </Text>
        ) : (
          <View>
            {progress.map((row, idx) => (
              <View key={idx} style={styles.subjectRow} wrap={false}>
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{row.subject}</Text>
                  <Text style={styles.subjectMeta}>
                    {row.hoursThisPeriod !== undefined ? `${row.hoursThisPeriod} hrs` : "—"}
                    {row.grade ? ` · grade ${row.grade}` : ""}
                  </Text>
                </View>
                {row.narrative && <Text style={styles.subjectNarrative}>{row.narrative}</Text>}
              </View>
            ))}
            <View style={styles.totals}>
              <Text style={{ fontSize: 10, color: palette.ink2 }}>Total this period</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold" }}>{totHours.toFixed(1)} hrs</Text>
            </View>
          </View>
        )}

        {quarter === 4 && (
          <View style={{ marginTop: 12 }}>
            <Text style={baseStyles.h2}>Annual assessment</Text>
            <Text style={{ fontSize: 10, color: palette.ink2 }}>
              Per § 100.10(h), the fourth quarterly must include an annual assessment — either a
              standardized test result or a written narrative evaluation. Attach as a separate
              document.
            </Text>
            {(snapshot.testResults ?? []).map((t, idx) => (
              <View key={idx} style={{ marginTop: 6 }}>
                <Text style={{ fontSize: 10 }}>
                  · {t.testName} ({formatDate(t.date)}) {t.grade ? `— grade ${t.grade}` : ""}
                </Text>
                {t.notes && <Text style={{ fontSize: 9, color: palette.ink3 }}>{t.notes}</Text>}
              </View>
            ))}
          </View>
        )}

        {snapshot.notes && (
          <View style={{ marginTop: 12 }}>
            <Text style={baseStyles.h2}>Notes</Text>
            <Text style={{ fontSize: 10 }}>{snapshot.notes}</Text>
          </View>
        )}

        <View style={baseStyles.signature}>
          <Text>Parent / guardian signature: ______________________________</Text>
          <Text style={{ marginTop: 16 }}>Date signed: ______________________________</Text>
        </View>

        <FilingDisclaimer meta={NY_QUARTERLY_META} snapshot={snapshot} />

        <FilingFooter snapshot={snapshot} />
      </Page>
    </FilingDocument>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.twoCol}>
      <Text style={styles.twoColLabel}>{label}</Text>
      <Text style={styles.twoColValue}>{value || "—"}</Text>
    </View>
  )
}
