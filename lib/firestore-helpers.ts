import { adminDb } from "@/lib/firebase-admin-safe"

type FirestoreDoc = {
  id: string
  data: () => Record<string, unknown>
}

export const collection = (name: string) => adminDb.collection(name)

export const docToData = (doc: FirestoreDoc) => ({
  id: doc.id,
  ...doc.data(),
})

export const nowIso = () => new Date().toISOString()
