/**
 * Oregon Standardized Test Results submission.
 *
 * Per ORS 339.035 and OAR 581-021-0029, registered Oregon homeschoolers
 * must arrange for the child to take an approved standardized
 * achievement test at the end of grades 3, 5, 8, and 10. The score is
 * submitted to the local Education Service District (ESD). Above the
 * 15th percentile = compliant; below = remediation may be required.
 *
 * Approved tests (per OAR 581-021-0029(7)):
 *   - California Achievement Test (CAT)
 *   - Iowa Tests of Basic Skills (ITBS)
 *   - Stanford Achievement Test
 *   - Metropolitan Achievement Test
 *   - TerraNova
 *   - others approved by the State Board of Education
 *
 * The test must be administered by a "qualified neutral person" — not
 * the parent — typically a teacher, school administrator, or
 * commercial testing service.
 *
 * This template renders a one-page submission listing each test result
 * with administration date, qualified administrator name, scores by
 * subject, and a parent signature. Multiple results can be attached
 * (e.g., a child in 5th grade may have results from 3rd grade and
 * 5th grade on the same submission if the family is catching up).
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

export const OR_TEST_RESULTS_META: FilingTypeMeta = {
  state: "or",
  filingType: "test-results",
  title: "Standardized Test Results Submission",
  description:
    "Submitted to your Oregon ESD at the end of grades 3, 5, 8, and 10. Lists test name, administration date, and scores.",
  citation: "ORS 339.035 / OAR 581-021-0029",
  recipient: "Education Service District",
}

const styles = StyleSheet.create({
  twoCol: { flexDirection: "row", marginBottom: 4 },
  twoColLabel: { width: 140, color: palette.ink2, fontSize: 10 },
  twoColValue: { flex: 1, fontSize: 11 },
  testBlock: {
    paddingVertical: 10,
    marginTop: 6,
    borderTop: `0.5pt solid ${palette.rule}`,
  },
  testHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  testName: { fontSize: 12, fontWeight: "bold" },
  testDate: { fontSize: 10, color: palette.ink3 },
  testMeta: { fontSize: 10, color: palette.ink2, marginTop: 2 },
  emptyHint: {
    paddingVertical: 10,
    fontSize: 10,
    color: palette.ink3,
    fontStyle: "italic",
  },
  attestation: {
    marginTop: 16,
    padding: 12,
    border: `1pt solid ${palette.rule}`,
    fontSize: 10,
    color: palette.ink2,
    lineHeight: 1.5,
  },
})

function formatDate(value?: string): string {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function gradeBand(grade?: string): string {
  if (!grade) return ""
  const n = parseInt(grade.replace(/\D/g, ""), 10)
  if (Number.isNaN(n)) return ""
  if ([3, 5, 8, 10].includes(n)) return `Required testing grade (${n})`
  return `Grade ${n} — testing not required this year`
}

export function OregonTestResultsPdf({ snapshot }: { snapshot: FilingSnapshot }) {
  const results = snapshot.testResults ?? []

  return (
    <FilingDocument
      title={`${OR_TEST_RESULTS_META.title} — ${snapshot.child.name}`}
      author={snapshot.parent.displayName}
      creator="AtoZ Family"
      producer="AtoZ Family"
      subject={`OR test results for ${snapshot.child.name}, school year ${snapshot.schoolYear}`}
    >
      <Page size="LETTER" style={baseStyles.page}>
        <FilingHeader meta={OR_TEST_RESULTS_META} schoolYear={snapshot.schoolYear} />

        <Text style={baseStyles.h2}>Student</Text>
        <View>
          <Row label="Name" value={snapshot.child.name} />
          <Row label="Date of birth" value={formatDate(snapshot.child.birthDate)} />
          <Row label="Grade" value={snapshot.child.grade ?? ""} />
          <Row label="Testing year status" value={gradeBand(snapshot.child.grade)} />
        </View>

        <Text style={baseStyles.h2}>Parent / guardian</Text>
        <View>
          <Row label="Name" value={snapshot.parent.displayName} />
          {snapshot.parent.email && <Row label="Email" value={snapshot.parent.email} />}
          {snapshot.parent.phone && <Row label="Phone" value={snapshot.parent.phone} />}
        </View>

        <Text style={baseStyles.h2}>Test results</Text>
        {results.length === 0 ? (
          <Text style={styles.emptyHint}>
            No test results listed. Add at least one approved test result (CAT, ITBS, Stanford,
            Metropolitan, or TerraNova) administered by a qualified neutral person before submitting.
          </Text>
        ) : (
          <View>
            {results.map((t, idx) => (
              <View key={idx} style={styles.testBlock} wrap={false}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>{t.testName || "Unnamed test"}</Text>
                  <Text style={styles.testDate}>{formatDate(t.date)}</Text>
                </View>
                {t.grade && (
                  <Text style={styles.testMeta}>Grade administered: {t.grade}</Text>
                )}
                {t.notes && <Text style={styles.testMeta}>{t.notes}</Text>}
              </View>
            ))}
          </View>
        )}

        <View style={styles.attestation}>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Parent attestation</Text>
          <Text>
            I attest that the test(s) listed above were administered by a qualified neutral person
            other than myself, in accordance with the test publisher's instructions, and that the
            scores reported are accurate copies of the official report. I understand that ORS
            339.035 requires submission of these results to the local Education Service District.
          </Text>
        </View>

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

        <FilingDisclaimer meta={OR_TEST_RESULTS_META} snapshot={snapshot} />

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
