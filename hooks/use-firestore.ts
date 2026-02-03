"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryConstraint,
  serverTimestamp,
  onSnapshot,
  type QuerySnapshot,
} from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuth } from "@/contexts/auth-context"

// Hook to get a single document with real-time updates
export function useDocument<T = DocumentData>(collectionName: string, id: string | null) {
  const [document, setDocument] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setDocument(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const docRef = doc(db, collectionName, id)
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setDocument({ id: docSnap.id, ...docSnap.data() } as unknown as T)
        } else {
          setDocument(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error(`Error getting document from ${collectionName}:`, err)
        setError(err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [collectionName, id])

  return { document, loading, error }
}

// Hook to get a collection of documents with real-time updates
export function useCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  realtime = true,
) {
  const [documents, setDocuments] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)
  const [hasMore, setHasMore] = useState(true)

  // Function to process query snapshot
  const processSnapshot = useCallback((querySnapshot: QuerySnapshot<DocumentData>) => {
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as T[]

    setDocuments(docs)
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null)
    setHasMore(querySnapshot.docs.length > 0)
    setLoading(false)
  }, [])

  // Initial fetch
  useEffect(() => {
    setLoading(true)

    const q = query(collection(db, collectionName), ...constraints)

    if (realtime) {
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          processSnapshot(querySnapshot)
        },
        (err) => {
          console.error(`Error getting collection ${collectionName}:`, err)
          setError(err)
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } else {
      // One-time fetch
      getDocs(q)
        .then(processSnapshot)
        .catch((err) => {
          console.error(`Error getting collection ${collectionName}:`, err)
          setError(err)
          setLoading(false)
        })
    }
  }, [collectionName, JSON.stringify(constraints), realtime, processSnapshot])

  // Function to load more documents
  const loadMore = useCallback(async () => {
    if (!hasMore || !lastDoc) return

    setLoading(true)

    try {
      const q = query(collection(db, collectionName), ...constraints, startAfter(lastDoc), limit(10))

      const querySnapshot = await getDocs(q)

      const newDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as T[]

      setDocuments((prevDocs) => [...prevDocs, ...newDocs])
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null)
      setHasMore(querySnapshot.docs.length > 0)
    } catch (err) {
      console.error(`Error loading more from ${collectionName}:`, err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setLoading(false)
    }
  }, [collectionName, constraints, hasMore, lastDoc])

  return { documents, loading, error, loadMore, hasMore }
}

// Hook to get user-specific data with real-time updates
export function useUserData<T = DocumentData>(
  collectionName: string,
  additionalConstraints: QueryConstraint[] = [],
  realtime = true,
) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch user data
  useEffect(() => {
    if (!user) {
      setDocuments([])
      setLoading(false)
      return
    }

    setLoading(true)

    const constraints = [where("userId", "==", user.uid), orderBy("createdAt", "desc"), ...additionalConstraints]

    const q = query(collection(db, collectionName), ...constraints)

    if (realtime) {
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const docs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as unknown as T[]

          setDocuments(docs)
          setLoading(false)
        },
        (err) => {
          console.error(`Error getting user data from ${collectionName}:`, err)
          setError(err)
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } else {
      // One-time fetch
      getDocs(q)
        .then((querySnapshot) => {
          const docs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as unknown as T[]

          setDocuments(docs)
          setLoading(false)
        })
        .catch((err) => {
          console.error(`Error getting user data from ${collectionName}:`, err)
          setError(err instanceof Error ? err : new Error("An unknown error occurred"))
          setLoading(false)
        })
    }
  }, [collectionName, user, JSON.stringify(additionalConstraints), realtime])

  // Function to add a new document
  const addDocument = useCallback(
    async (data: Omit<T, "id" | "userId" | "createdAt">) => {
      if (!user) throw new Error("User must be logged in")

      try {
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        return docRef.id
      } catch (err) {
        console.error(`Error adding document to ${collectionName}:`, err)
        throw err instanceof Error ? err : new Error("An unknown error occurred")
      }
    },
    [collectionName, user],
  )

  // Function to update a document
  const updateDocument = useCallback(
    async (id: string, data: Partial<T>) => {
      if (!user) throw new Error("User must be logged in")

      try {
        const docRef = doc(db, collectionName, id)
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error(`Error updating document in ${collectionName}:`, err)
        throw err instanceof Error ? err : new Error("An unknown error occurred")
      }
    },
    [collectionName, user],
  )

  // Function to delete a document
  const deleteDocument = useCallback(
    async (id: string) => {
      if (!user) throw new Error("User must be logged in")

      try {
        await deleteDoc(doc(db, collectionName, id))
      } catch (err) {
        console.error(`Error deleting document from ${collectionName}:`, err)
        throw err instanceof Error ? err : new Error("An unknown error occurred")
      }
    },
    [collectionName, user],
  )

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
  }
}
