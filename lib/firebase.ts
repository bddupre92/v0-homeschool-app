import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type Storage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project'}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project'}.firebasestorage.app`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: Storage | null = null
let initError: string | null = null

// Validate using the already-resolved config values (process.env.NEXT_PUBLIC_* is
// statically replaced by Next.js at build time, so dynamic access like
// process.env[varName] does NOT work — we must use the config object instead)
const configCheck = {
  apiKey: firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
}

const missingKeys = Object.entries(configCheck)
  .filter(([, value]) => !value)
  .map(([key]) => key)

const hasDemoValues = Object.values(configCheck).some(
  value => value && (value.includes('demo') || value.includes('your-') || value === '123456789')
)

if (missingKeys.length > 0) {
  initError = `Missing Firebase config: ${missingKeys.join(', ')}`
  console.warn(initError)
} else if (hasDemoValues) {
  initError = 'Demo/placeholder Firebase values detected'
  console.warn(initError)
} else {
  try {
    if (getApps().length) {
      app = getApp()
    } else {
      app = initializeApp(firebaseConfig)
    }
    console.log('Firebase app initialized successfully with project:', firebaseConfig.projectId)
  } catch (error: any) {
    initError = `initializeApp error: ${error?.message || String(error)}`
    console.error('Firebase initialization failed:', error)
    app = null
  }

  if (app) {
    try {
      auth = getAuth(app)
      db = getFirestore(app)
      storage = getStorage(app)
      console.log('Firebase services ready')
    } catch (error: any) {
      const msg = `Services error: ${error?.message || String(error)}`
      initError = initError ? `${initError} | ${msg}` : msg
      console.error('Firebase services initialization failed:', error)
    }
  }
}

export const isFirebaseAvailable = () => app !== null
export const getFirebaseInitError = () => initError

export { app, auth, db, storage }
