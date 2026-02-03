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
      } else {
        initializeApp({
          projectId: "demo-homeschool-app",
        })
      }
    }

    adminDb = getFirestore()
    adminAuth = getAuth()
    adminStorage = getStorage()
  } catch (error) {
    adminDb = createMockFirestore()
    adminAuth = createMockAuth()
    adminStorage = createMockStorage()
  }
}

// Export the admin services
export const db = adminDb
export { adminDb, adminAuth, adminStorage }
