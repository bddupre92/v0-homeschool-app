import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"

// Check if we're in a build/preview environment
const isBuildEnvironment = process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "production"

// Create mock implementations for build environment
const createMockFirestore = () => {
  return {
    collection: () => ({
      get: async () => ({ docs: [] }),
      doc: () => ({
        get: async () => ({ exists: false, data: () => ({}) }),
        set: async () => {},
        update: async () => {},
        delete: async () => {},
      }),
    }),
  }
}

const createMockAuth = () => {
  return {
    getUser: async () => ({}),
    createUser: async () => ({}),
    updateUser: async () => ({}),
    deleteUser: async () => {},
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
let adminDb, adminAuth, adminStorage

if (isBuildEnvironment) {
  console.log("Using mock Firebase Admin for build environment")
  adminDb = createMockFirestore()
  adminAuth = createMockAuth()
  adminStorage = createMockStorage()
} else {
  // Only initialize Firebase Admin in non-build environments
  if (!getApps().length) {
    try {
      // If we're in a production environment, use the environment variables
      if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        // Skip actual initialization during build to avoid private key parsing issues
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || "",
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
            // Don't try to parse the private key during build
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
    } catch (error) {
      console.error("Firebase Admin initialization error:", error)
      // Initialize with a minimal configuration as fallback
      if (!getApps().length) {
        initializeApp({
          projectId: "demo-homeschool-app",
        })
        console.log("Firebase Admin initialized with fallback config after error")
      }
    }
  }

  // Get the admin services
  adminDb = getFirestore()
  adminAuth = getAuth()
  adminStorage = getStorage()
}

// Export the admin services
export const db = adminDb
export { adminDb, adminAuth, adminStorage }
