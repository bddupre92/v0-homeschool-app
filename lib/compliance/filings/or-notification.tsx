/**
 * Oregon "Notification of Intent to Teach Children at Home" template.
 *
 * Per ORS 339.030 and OAR 581-021-0026, parents send a notification to
 * the local Education Service District (ESD) when:
 *   - the child reaches age 6 (or earlier compulsory entry), OR
 *   - the child is withdrawn from public/private school to be taught at home, OR
 *   - the family moves into a new ESD.
 *
 * The ESD then tracks the child for the standardized-testing schedule
 * (grades 3, 5, 8, 10). Oregon does NOT require curriculum approval or
 * portfolio review — the notification + test scores are the entire
 * compliance surface. This makes it the right Phase 8.1 proof-of-concept:
 * one-page filing, minimal data, validates the whole render pipeline.
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

export const OR_NOTIFICATION_META: FilingTypeMeta = {
  state: "or",
  filingType: "notification",
  title: "Notification of Intent to Teach Children at Home",
  description:
    "Sent to your local Oregon ESD when a child turns 6, is withdrawn from a school, or moves into a new district.",
  citation: "ORS 339.030 / OAR 581-021-0026",
  recipient: "Education Service District",
}

const styles = StyleSheet.create({
  fieldList: { marginTop: 6 },
  fieldRow: { flexDirection: "row", paddingVertical: 4, borderBottom: `0.5pt solid ${palette.rule}` },
  fieldLabel: { width: 150, color: palette.ink2, fontSize: 10 },
  fieldValue: { flex: 1, fontSize: 11 },
  notesBlock: {
    marginTop: 18,
    padding: 10,
    backgroundColor: "#fafaf7",
    fontSize: 10,
  },
})

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || "—"}</Text>
    </View>
  )
}

function formatAddress(snap: FilingSnapshot): string {
  const a = snap.parent.address
  if (!a) return ""
  const lines = [
    a.line1,
    a.line2,
    [a.city, a.state, a.zip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ")
  return lines
}

function formatBirth(snap: FilingSnapshot): string {
  if (!snap.child.birthDate) return ""
  const d = new Date(snap.child.birthDate)
  return d.toISOString().slice(0, 10)
}

function formatStart(snap: FilingSnapshot): string {
  if (!snap.instructionStartDate) return ""
  const d = new Date(snap.instructionStartDate)
  return d.toISOString().slice(0, 10)
}

export function OregonNotificationPdf({ snapshot }: { snapshot: FilingSnapshot }) {
  return (
    <FilingDocument
      title={`${OR_NOTIFICATION_META.title} — ${snapshot.child.name}`}
      author={snapshot.parent.displayName}
      creator="AtoZ Family"
      producer="AtoZ Family"
      subject={`Oregon ${OR_NOTIFICATION_META.filingType} for school year ${snapshot.schoolYear}`}
    >
      <Page size="LETTER" style={baseStyles.page}>
        <FilingHeader meta={OR_NOTIFICATION_META} schoolYear={snapshot.schoolYear} />

        <Text style={baseStyles.h2}>Parent / Guardian</Text>
        <View style={styles.fieldList}>
          <Field label="Name" value={snapshot.parent.displayName} />
          <Field label="Mailing address" value={formatAddress(snapshot)} />
          <Field label="Phone" value={snapshot.parent.phone ?? ""} />
          <Field label="Email" value={snapshot.parent.email ?? ""} />
        </View>

        <Text style={baseStyles.h2}>Child</Text>
        <View style={styles.fieldList}>
          <Field label="Full name" value={snapshot.child.name} />
          <Field label="Date of birth" value={formatBirth(snapshot)} />
          <Field
            label="Age / grade"
            value={[snapshot.child.age, snapshot.child.grade].filter(Boolean).join(" / ")}
          />
        </View>

        <Text style={baseStyles.h2}>Instruction</Text>
        <View style={styles.fieldList}>
          <Field label="Began home instruction" value={formatStart(snapshot)} />
          <Field label="School year" value={snapshot.schoolYear} />
        </View>

        {snapshot.notes && (
          <View style={styles.notesBlock}>
            <Text style={baseStyles.subdued}>Notes</Text>
            <Text style={{ marginTop: 4 }}>{snapshot.notes}</Text>
          </View>
        )}

        <View style={baseStyles.signature}>
          <Text>Parent / Guardian signature: ______________________________</Text>
          <Text style={{ marginTop: 16 }}>Date signed: ______________________________</Text>
        </View>

        <FilingDisclaimer meta={OR_NOTIFICATION_META} snapshot={snapshot} />

        <FilingFooter snapshot={snapshot} />
      </Page>
    </FilingDocument>
  )
}
