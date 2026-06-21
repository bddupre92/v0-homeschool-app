/**
 * New York Individualized Home Instruction Plan (IHIP).
 *
 * Required under NYS Regulations of the Commissioner of Education § 100.10.
 * Submitted to the local school district superintendent annually by Aug 15
 * (or within four weeks of the LOI for new homeschoolers). The IHIP lists:
 *  - Required subjects per grade band
 *  - The curriculum, syllabi, or plan of instruction for each subject
 *  - Resource materials / textbooks
 *  - Names of all persons providing instruction
 *
 * Required subjects per § 100.10(e):
 *  - Grades 1–6: arithmetic, reading, spelling, writing, English, geography,
 *    US history, science, health education, music, visual arts, physical
 *    education, and (when 6th-grade) library skills.
 *  - Grades 7–8: English, history & geography, science, mathematics, PE,
 *    health, art, music, practical arts, library skills, technology.
 *  - Grades 9–12: 4 units English, 4 units social studies (including 1 unit
 *    US history, ½ unit participation in government, ½ unit economics),
 *    2 units math, 2 units science, 1 unit art and/or music, ½ unit health,
 *    2 units PE, 3 units electives.
 *
 * This template renders the parent's curriculum-by-subject map plus the
 * required disclaimers + footer. It does NOT auto-validate that all
 * required subjects are covered (that's a follow-up — surfacing the
 * required-subjects checklist in the form, not on the PDF itself).
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

export const NY_IHIP_META: FilingTypeMeta = {
  state: "ny",
  filingType: "ihip",
  title: "Individualized Home Instruction Plan (IHIP)",
  description:
    "Annual plan submitted to your NY school district superintendent by August 15. Lists curriculum + materials for each required subject.",
  citation: "8 NYCRR § 100.10",
  recipient: "School District Superintendent",
}

const styles = StyleSheet.create({
  twoCol: { flexDirection: "row", marginBottom: 4 },
  twoColLabel: { width: 140, color: palette.ink2, fontSize: 10 },
  twoColValue: { flex: 1, fontSize: 11 },
  subjectBlock: {
    paddingVertical: 8,
    borderBottom: `0.5pt solid ${palette.rule}`,
  },
  subjectName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  subjectMaterials: {
    fontSize: 10,
    color: palette.ink2,
  },
  emptyHint: {
    paddingVertical: 10,
    fontSize: 10,
    color: palette.ink3,
    fontStyle: "italic",
  },
})

export function NyIhipPdf({ snapshot }: { snapshot: FilingSnapshot }) {
  const lines = snapshot.curriculumBySubject ?? []
  return (
    <FilingDocument
      title={`${NY_IHIP_META.title} — ${snapshot.child.name}`}
      author={snapshot.parent.displayName}
      creator="AtoZ Family"
      producer="AtoZ Family"
      subject={`NY IHIP for ${snapshot.child.name}, school year ${snapshot.schoolYear}`}
    >
      <Page size="LETTER" style={baseStyles.page}>
        <FilingHeader meta={NY_IHIP_META} schoolYear={snapshot.schoolYear} />

        <Text style={baseStyles.h2}>Student</Text>
        <View>
          <Row label="Name" value={snapshot.child.name} />
          <Row
            label="Date of birth"
            value={snapshot.child.birthDate ? new Date(snapshot.child.birthDate).toISOString().slice(0, 10) : ""}
          />
          <Row label="Age" value={snapshot.child.age?.toString() ?? ""} />
          <Row label="Grade" value={snapshot.child.grade ?? ""} />
        </View>

        <Text style={baseStyles.h2}>Person(s) providing instruction</Text>
        <View>
          <Row label="Parent / guardian" value={snapshot.parent.displayName} />
          {snapshot.parent.phone && <Row label="Phone" value={snapshot.parent.phone} />}
          {snapshot.parent.email && <Row label="Email" value={snapshot.parent.email} />}
        </View>

        <Text style={baseStyles.h2}>Plan of instruction by subject</Text>
        {lines.length === 0 ? (
          <Text style={styles.emptyHint}>
            No subjects listed. Add curriculum + materials for each required subject before submitting.
          </Text>
        ) : (
          <View>
            {lines.map((line, idx) => (
              <View key={idx} style={styles.subjectBlock} wrap={false}>
                <Text style={styles.subjectName}>{line.subject}</Text>
                <Text style={styles.subjectMaterials}>
                  {line.materials || "Curriculum / materials not yet specified."}
                </Text>
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

        <FilingDisclaimer meta={NY_IHIP_META} snapshot={snapshot} />

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
