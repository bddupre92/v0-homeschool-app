// Safe Firebase Admin wrapper that handles build environments
// This module provides a safe way to import Firebase Admin that won't break during builds

// Check if we're in a build environment or browser
const isServer = typeof window === 'undefined'
const isBuildEnvironment = 
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-export" ||
  (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV && !process.env.VERCEL)

// Mock implementations for build environment
const createMockFirestore = () => {
  const mockDoc = {
    id: "mock-doc-id",
    get: async () => ({ 
      exists: false, 
      data: () => ({}),
      id: "mock-doc-id"
    }),
    set: async () => {},
    update: async () => {},
    delete: async () => {},
  }

  return {
    collection: (name: string) => ({
      get: async () => ({ docs: [] }),
      doc: (id?: string) => ({
        ...mockDoc,
        id: id || "mock-doc-id",
      }),
      add: async () => ({ id: "mock-doc-id" }),
      where: () => ({
        get: async () => ({ docs: [] }),
      }),
    }),
    FieldValue: {
      arrayUnion: (...values: any[]) => ({ _methodName: "arrayUnion", _elements: values }),
      arrayRemove: (...values: any[]) => ({ _methodName: "arrayRemove", _elements: values }),
      serverTimestamp: () => ({ _methodName: "serverTimestamp" }),
    },
  }
}

const createMockAuth = () => {
  return {
    getUser: async () => ({}),
    createUser: async () => ({}),
    updateUser: async () => ({}),
    deleteUser: async () => {},
    verifySessionCookie: async () => ({ uid: "mock-user-id" }),
    createSessionCookie: async () => "mock-session-cookie",
  }
}

const createMockStorage = () => {
  return {
    bucket: () => ({
      file: () => ({
        save: async () => {},
        download: async () => [Buffer.from("")],
      }),
      getFiles: async () => [[]],
    }),
  }
}

// Initialize Firebase Admin or use mocks
let adminDb: any, adminAuth: any, adminStorage: any

if (!isServer) {
  // Browser environment - always use mocks
  console.log("Browser environment detected - using mock Firebase Admin")
  adminDb = createMockFirestore()
  adminAuth = createMockAuth()
  adminStorage = createMockStorage()
} else if (isBuildEnvironment) {
  console.log("Using mock Firebase Admin for build environment")
  adminDb = createMockFirestore()
  adminAuth = createMockAuth()
  adminStorage = createMockStorage()
} else {
  // Dynamic import Firebase Admin only when not in build environment
  try {
    const { initializeApp, getApps, cert } = require("firebase-admin/app")
    const { getFirestore } = require("firebase-admin/firestore")
    const { getAuth } = require("firebase-admin/auth")
    const { getStorage } = require("firebase-admin/storage")

    if (!getApps().length) {
      // If we're in a production environment, use the environment variables
      if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }),
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        })
        console.log("Firebase Admin initialized with environment variables")
      } else {
        // Initialize with a minimal configuration for development/preview
        initializeApp({
          projectId: "demo-homeschool-app",
        })
        console.log("Firebase Admin initialized with minimal config (no credentials)")
      }
    }

    // Get the admin services
    adminDb = getFirestore()
    adminAuth = getAuth()
    adminStorage = getStorage()
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)
    // Use mocks as fallback
    console.log("Using mock Firebase Admin due to error")
    adminDb = createMockFirestore()
    adminAuth = createMockAuth()
    adminStorage = createMockStorage()
  }
}

// Export the admin services
export const db = adminDb
export { adminDb, adminAuth, adminStorage }
