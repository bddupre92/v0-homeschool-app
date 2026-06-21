/**
 * Pennsylvania Act 169 home education portfolio.
 *
 * 24 P.S. § 13-1327.1 ("Act 169") requires a home-education supervisor
 * to maintain a portfolio for each child and submit it to a
 * Pennsylvania-certified evaluator by June 30. The evaluator then writes
 * a letter attesting that the program shows progress and is in
 * compliance — that letter is filed with the school district
 * superintendent (the portfolio itself stays with the family / evaluator).
 *
 * The portfolio (per the statute) must contain:
 *  - A log of educational activities, organized by subject, evidencing
 *    180 days or 900/990 hours of instruction.
 *  - Samples of student work demonstrating progress in each required
 *    subject.
 *  - Standardized test results in grades 3, 5, and 8 (the statute names
 *    accepted tests).
 *
 * Required subjects K–6: English (reading, writing, spelling), arithmetic,
 * science, geography, civics, safety, health and physiology, art, music,
 * physical education.
 * Required subjects 7–12: English, math, science, social studies, civics,
 * art, music, physical education, health, safety.
 *
 * This template renders the portfolio summary + activity log + sample
 * list + (optional) test results + a fillable evaluator-letter cover
 * sheet.
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

export const PA_PORTFOLIO_META: FilingTypeMeta = {
  state: "pa",
  filingType: "portfolio",
  title: "Act 169 Home Education Portfolio",
  description:
    "PA portfolio summary + activity log + sample list, ready for evaluator review by June 30.",
  citation: "24 P.S. § 13-1327.1 (Act 169)",
  recipient: "PA-certified evaluator",
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
  subjectName: { fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  subjectMeta: { fontSize: 10, color: palette.ink3 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 8,
    borderTop: `1pt solid ${palette.rule}`,
  },
  sampleRow: {
    paddingVertical: 4,
    fontSize: 10,
    color: palette.ink2,
  },
  emptyHint: {
    paddingVertical: 10,
    fontSize: 10,
    color: palette.ink3,
    fontStyle: "italic",
  },
  evaluatorBlock: {
    marginTop: 24,
    padding: 14,
    border: `1pt solid ${palette.rule}`,
    backgroundColor: "#fafaf7",
  },
})

function formatDate(value?: string): string {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function hourTarget(grade?: string): number {
  if (!grade) return 900
  const n = parseInt(grade.replace(/\D/g, ""), 10)
  if (Number.isNaN(n)) return 900
  return n >= 7 ? 990 : 900
}

export function PaPortfolioPdf({ snapshot }: { snapshot: FilingSnapshot }) {
  const subjects = snapshot.hoursBySubject ?? []
  const totHours = subjects.reduce((sum, s) => sum + s.minutes / 60, 0)
  const target = hourTarget(snapshot.child.grade)
  const samples = snapshot.portfolioSamples ?? []
  const tests = snapshot.testResults ?? []
  const evaluator = snapshot.evaluator

  return (
    <FilingDocument
      title={`${PA_PORTFOLIO_META.title} — ${snapshot.child.name}`}
      author={snapshot.parent.displayName}
      creator="AtoZ Family"
      producer="AtoZ Family"
      subject={`PA Act 169 portfolio for ${snapshot.child.name}, school year ${snapshot.schoolYear}`}
    >
      <Page size="LETTER" style={baseStyles.page}>
        <FilingHeader meta={PA_PORTFOLIO_META} schoolYear={snapshot.schoolYear} />

        <View style={styles.pillsRow}>
          {snapshot.child.grade && <Text style={styles.pill}>Grade {snapshot.child.grade}</Text>}
          <Text style={styles.pill}>Annual target {target} hrs</Text>
          {snapshot.daysOfInstruction !== undefined && (
            <Text style={styles.pill}>{snapshot.daysOfInstruction} instruction days</Text>
          )}
        </View>

        <Text style={baseStyles.h2}>Student</Text>
        <View>
          <Row label="Name" value={snapshot.child.name} />
          <Row label="Date of birth" value={formatDate(snapshot.child.birthDate)} />
          <Row label="Grade" value={snapshot.child.grade ?? ""} />
        </View>

        <Text style={baseStyles.h2}>Supervisor (parent / guardian)</Text>
        <View>
          <Row label="Name" value={snapshot.parent.displayName} />
          {snapshot.parent.phone && <Row label="Phone" value={snapshot.parent.phone} />}
          {snapshot.parent.email && <Row label="Email" value={snapshot.parent.email} />}
        </View>

        <Text style={baseStyles.h2}>Activity log — hours by subject</Text>
        {subjects.length === 0 ? (
          <Text style={styles.emptyHint}>
            No subject-hour totals recorded. Add hours per required subject before submitting.
          </Text>
        ) : (
          <View>
            {subjects.map((row, idx) => (
              <View key={idx} style={styles.subjectRow} wrap={false}>
                <Text style={styles.subjectName}>{row.subject}</Text>
                <Text style={styles.subjectMeta}>{(row.minutes / 60).toFixed(1)} hrs</Text>
              </View>
            ))}
            <View style={styles.totalsRow}>
              <Text style={{ fontSize: 10, color: palette.ink2 }}>Total hours</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                {totHours.toFixed(1)} / {target}
              </Text>
            </View>
          </View>
        )}

        <Text style={baseStyles.h2}>Work samples</Text>
        {samples.length === 0 ? (
          <Text style={styles.emptyHint}>
            No work samples listed. Attach photos / scans of student work to the portfolio.
          </Text>
        ) : (
          <View>
            {samples.map((s, idx) => (
              <View key={idx} style={styles.sampleRow}>
                <Text>
                  · {formatDate(s.date)} — {s.title}
                  {s.subject ? ` (${s.subject})` : ""}
                </Text>
                {s.notes && (
                  <Text style={{ fontSize: 9, color: palette.ink3, marginLeft: 8 }}>{s.notes}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {tests.length > 0 && (
          <View>
            <Text style={baseStyles.h2}>Standardized test results</Text>
            {tests.map((t, idx) => (
              <View key={idx} style={styles.sampleRow}>
                <Text>
                  · {t.testName} ({formatDate(t.date)})
                  {t.grade ? ` — grade ${t.grade}` : ""}
                </Text>
                {t.notes && (
                  <Text style={{ fontSize: 9, color: palette.ink3, marginLeft: 8 }}>{t.notes}</Text>
                )}
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

        <View style={styles.evaluatorBlock} wrap={false}>
          <Text style={baseStyles.h2}>Evaluator certification (for evaluator to complete)</Text>
          <Text style={{ fontSize: 10, color: palette.ink2, marginBottom: 8 }}>
            Per § 13-1327.1(e)(2), the evaluator must be a PA-certified teacher with two years of
            teaching experience, a licensed psychologist, or a person authorized by the
            superintendent.
          </Text>
          <Row label="Evaluator name" value={evaluator?.name ?? ""} />
          <Row label="Certification #" value={evaluator?.certificationNumber ?? ""} />
          <Row label="Evaluation date" value={formatDate(evaluator?.evaluationDate)} />
          <Text style={{ marginTop: 12, fontSize: 10 }}>
            Evaluator signature: ______________________________
          </Text>
        </View>

        <FilingDisclaimer meta={PA_PORTFOLIO_META} snapshot={snapshot} />

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
