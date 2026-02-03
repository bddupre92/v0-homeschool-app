// Safe type definitions for Firebase Admin
// This file provides type definitions without requiring firebase-admin modules

export interface FirestoreTimestamp {
  toDate(): Date
  toMillis(): number
}

export interface FirestoreDocumentData {
  [key: string]: any
  createdAt?: FirestoreTimestamp | string
  updatedAt?: FirestoreTimestamp | string
  date?: FirestoreTimestamp | string | Date
}

export interface FirestoreDocument {
  id: string
  data(): FirestoreDocumentData
  exists: boolean
}

// Generic type for Firestore document snapshots
export type DocumentSnapshot = FirestoreDocument
