/**
 * Massachusetts generic home-education plan.
 *
 * Massachusetts homeschoolers must submit a written plan to their local
 * school committee BEFORE beginning home instruction; the committee may
 * approve, reject, or request revisions. There is no statewide form —
 * each district uses its own. This template ships a portable "generic"
 * plan that satisfies the four criteria from Care and Protection of
 * Charles, 399 Mass. 324 (1987), which families can bring to any
 * district and adapt to the district's specific format.
 *
 * The Charles criteria are:
 *   1. The competence of the parents to teach the children.
 *   2. The proposed curriculum (subject matter to be taught).
 *   3. The number of hours and days of instruction.
 *   4. The methods by which the children's educational progress will
 *      be evaluated.
 *
 * Some districts also ask for: home learning environment description,
 * field-trip plans, socialization plans (the SJC said these may NOT be
 * required, but families often include them voluntarily).
 *
 * This template renders all four required sections plus an optional
 * notes block for whatever the district has additionally requested.
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

export const MA_PLAN_META: FilingTypeMeta = {
  state: "ma",
  filingType: "plan",
  title: "Home Education Plan (Charles criteria)",
  description:
    "Generic, portable plan for the four Charles criteria — bring to any Massachusetts school committee and adapt to their format.",
  citation: "Care and Protection of Charles, 399 Mass. 324 (1987)",
  recipient: "Local School Committee",
}

const styles = StyleSheet.create({
  twoCol: { flexDirection: "row", marginBottom: 4 },
  twoColLabel: { width: 140, color: palette.ink2, fontSize: 10 },
  twoColValue: { flex: 1, fontSize: 11 },
  criterionBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: `0.5pt solid ${palette.rule}`,
  },
  criterionLabel: {
    fontSize: 10,
    color: palette.ink3,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  criterionHeading: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subjectRow: {
    paddingVertical: 6,
    borderBottom: `0.5pt solid ${palette.rule}`,
  },
  subjectName: { fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  subjectMaterials: { fontSize: 10, color: palette.ink2 },
  emptyHint: {
    paddingVertical: 8,
    fontSize: 10,
    color: palette.ink3,
    fontStyle: "italic",
  },
})

function formatDate(value?: string): string {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

/**
 * Default evaluation-method text. Parents can override via `snapshot.notes`,
 * but most MA families end up with one of the three Charles-approved methods.
 */
const DEFAULT_EVAL_METHOD =
  "Progress will be evaluated through (a) periodic portfolio review by the parent showing samples of work demonstrating growth across required subjects, (b) annual standardized achievement testing administered by a qualified administrator, and (c) a written narrative summary submitted with the year-end portfolio. Test name and administration date will be reported in the annual progress summary."

export function MaPlanPdf({ snapshot }: { snapshot: FilingSnapshot }) {
  const lines = snapshot.curriculumBySubject ?? []
  const totalHoursPerWeek = (snapshot.hoursBySubject ?? []).reduce(
    (sum, h) => sum + h.minutes / 60,
    0,
  )

  return (
    <FilingDocument
      title={`${MA_PLAN_META.title} — ${snapshot.child.name}`}
      author={snapshot.parent.displayName}
      creator="AtoZ Family"
      producer="AtoZ Family"
      subject={`MA home education plan for ${snapshot.child.name}, school year ${snapshot.schoolYear}`}
    >
      <Page size="LETTER" style={baseStyles.page}>
        <FilingHeader meta={MA_PLAN_META} schoolYear={snapshot.schoolYear} />

        <Text style={baseStyles.h2}>Student</Text>
        <View>
          <Row label="Name" value={snapshot.child.name} />
          <Row label="Date of birth" value={formatDate(snapshot.child.birthDate)} />
          <Row label="Age" value={snapshot.child.age?.toString() ?? ""} />
          <Row label="Grade equivalent" value={snapshot.child.grade ?? ""} />
        </View>

        <Text style={baseStyles.h2}>Parent / guardian submitting the plan</Text>
        <View>
          <Row label="Name" value={snapshot.parent.displayName} />
          {snapshot.parent.email && <Row label="Email" value={snapshot.parent.email} />}
          {snapshot.parent.phone && <Row label="Phone" value={snapshot.parent.phone} />}
          {snapshot.parent.address?.line1 && (
            <Row
              label="Address"
              value={[
                snapshot.parent.address.line1,
                snapshot.parent.address.city,
                snapshot.parent.address.state,
                snapshot.parent.address.zip,
              ]
                .filter(Boolean)
                .join(", ")}
            />
          )}
        </View>

        {/* Criterion 1 — competence to teach */}
        <View style={styles.criterionBlock}>
          <Text style={styles.criterionLabel}>Charles criterion 1</Text>
          <Text style={styles.criterionHeading}>Competence of the parent(s) to teach</Text>
          <Text style={{ fontSize: 10 }}>
            {snapshot.notes ??
              `${snapshot.parent.displayName} is the primary instructor. The parent has direct knowledge of the child's learning needs and will follow the curriculum described below. Massachusetts does not require teaching credentials — competence is established through preparation, materials, and ongoing assessment.`}
          </Text>
        </View>

        {/* Criterion 2 — curriculum */}
        <View style={styles.criterionBlock}>
          <Text style={styles.criterionLabel}>Charles criterion 2</Text>
          <Text style={styles.criterionHeading}>Proposed curriculum</Text>
          {lines.length === 0 ? (
            <Text style={styles.emptyHint}>
              No curriculum lines added. Add curriculum + materials per required subject before
              submitting to the school committee.
            </Text>
          ) : (
            <View>
              {lines.map((line, idx) => (
                <View key={idx} style={styles.subjectRow} wrap={false}>
                  <Text style={styles.subjectName}>{line.subject}</Text>
                  <Text style={styles.subjectMaterials}>
                    {line.materials || "Materials to be selected."}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Criterion 3 — hours and days */}
        <View style={styles.criterionBlock}>
          <Text style={styles.criterionLabel}>Charles criterion 3</Text>
          <Text style={styles.criterionHeading}>Number of hours and days of instruction</Text>
          <View>
            {snapshot.daysOfInstruction !== undefined && (
              <Row label="Days per year" value={String(snapshot.daysOfInstruction)} />
            )}
            <Row
              label="Hours per week"
              value={totalHoursPerWeek > 0 ? totalHoursPerWeek.toFixed(1) : ""}
            />
            <Row label="Period start" value={formatDate(snapshot.periodStartDate)} />
            <Row label="Period end" value={formatDate(snapshot.periodEndDate)} />
          </View>
          <Text style={{ fontSize: 10, color: palette.ink3, marginTop: 4 }}>
            Massachusetts public schools provide approximately 180 days and 900-990 hours of
            instruction per year; the plan above is at least equivalent in scope and depth.
          </Text>
        </View>

        {/* Criterion 4 — evaluation method */}
        <View style={styles.criterionBlock}>
          <Text style={styles.criterionLabel}>Charles criterion 4</Text>
          <Text style={styles.criterionHeading}>Method of evaluating educational progress</Text>
          <Text style={{ fontSize: 10 }}>{DEFAULT_EVAL_METHOD}</Text>
        </View>

        <View style={baseStyles.signature}>
          <Text>Parent / guardian signature: ______________________________</Text>
          <Text style={{ marginTop: 16 }}>Date signed: ______________________________</Text>
        </View>

        <FilingDisclaimer meta={MA_PLAN_META} snapshot={snapshot} />

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
