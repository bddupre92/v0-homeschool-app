// Safe Firebase Admin wrapper that handles build environments
// This module provides a safe way to import Firebase Admin that won't break during builds

// Check if we're in a build environment or browser
const isServer = typeof window === 'undefined'
const isBuildEnvironment = 
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-export"

// Skip Firebase Admin entirely during build to prevent hanging
const skipFirebaseAdmin = isBuildEnvironment || !isServer

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

  // Chainable mock query that supports where/orderBy/limit chaining
  const mockQuery: any = {
    get: async () => ({ docs: [] }),
    where: () => mockQuery,
    orderBy: () => mockQuery,
    limit: () => mockQuery,
  }

  return {
    collection: (name: string) => ({
      get: async () => ({ docs: [] }),
      doc: (id?: string) => ({
        ...mockDoc,
        id: id || "mock-doc-id",
      }),
      add: async () => ({ id: "mock-doc-id" }),
      where: () => mockQuery,
      orderBy: () => mockQuery,
      limit: () => mockQuery,
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
let firebaseAdminConfigured = false

// Always use mocks during build or in browser
if (skipFirebaseAdmin) {
  adminDb = createMockFirestore()
  adminAuth = createMockAuth()
  adminStorage = createMockStorage()
} else {
  // Only load Firebase Admin at runtime on server
  try {
    // Use dynamic require to prevent bundler from analyzing these imports
    const firebaseAdminApp = eval('require')("firebase-admin/app")
    const firebaseAdminFirestore = eval('require')("firebase-admin/firestore")
    const firebaseAdminAuth = eval('require')("firebase-admin/auth")
    const firebaseAdminStorage = eval('require')("firebase-admin/storage")
    
    const { initializeApp, getApps, cert } = firebaseAdminApp
    const { getFirestore } = firebaseAdminFirestore
    const { getAuth } = firebaseAdminAuth
    const { getStorage } = firebaseAdminStorage

    if (!getApps().length) {
      if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }),
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        })
        firebaseAdminConfigured = true
      } else {
        console.error(
          "[firebase-admin] FIREBASE_ADMIN_PRIVATE_KEY / FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL not set. " +
            "Server actions (family, profile) will return EMPTY data. Set these env vars in production.",
        )
        initializeApp({
          projectId: "demo-homeschool-app",
        })
      }
    } else {
      firebaseAdminConfigured = Boolean(
        process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      )
    }

    adminDb = getFirestore()
    adminAuth = getAuth()
    adminStorage = getStorage()
  } catch (error) {
    console.error("[firebase-admin] Failed to initialize — falling back to mock (all reads return empty):", error)
    adminDb = createMockFirestore()
    adminAuth = createMockAuth()
    adminStorage = createMockStorage()
  }
}

// Export the admin services
export const db = adminDb
export { adminDb, adminAuth, adminStorage }
// True only when real credentials were provided (never true during build/browser).
export const isFirebaseAdminConfigured = firebaseAdminConfigured
