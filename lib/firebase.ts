import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type Storage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project'}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project'}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: Storage | null = null

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
const hasDemoValues = requiredEnvVars.some(varName => {
  const value = process.env[varName]
  return value && (value.includes('demo') || value.includes('your-') || value === '123456789')
})

if (missingVars.length > 0) {
  console.warn(`Missing Firebase environment variables: ${missingVars.join(', ')}`)
  console.warn("Running in development mode without Firebase")
} else if (hasDemoValues) {
  console.warn('Demo Firebase values detected. Please replace with real Firebase configuration.')
  console.warn('Running in development mode without Firebase')
} else {
  // This pattern ensures that we're not re-initializing the app on every hot-reload
  if (getApps().length) {
    app = getApp()
  } else {
    try {
      app = initializeApp(firebaseConfig)
      console.log('Firebase initialized successfully')
    } catch (error) {
      console.error('Firebase initialization failed:', error)
      console.warn('Running in development mode without Firebase')
      app = null
    }
  }
}

if (app) {
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

// Helper function to check if Firebase is available
export const isFirebaseAvailable = () => app !== null

export { app, auth, db, storage }
