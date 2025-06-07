import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

if (!apiKey) {
  console.error("NEXT_PUBLIC_FIREBASE_API_KEY is not defined in environment variables!")
} else {
  console.log("NEXT_PUBLIC_FIREBASE_API_KEY is defined:", apiKey.substring(0, 5) + "...") // Log first 5 characters for verification
}

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let app
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  console.log("Firebase app initialized successfully.")
} catch (error) {
  console.error("Firebase initialization error:", error)
  throw error // Re-throw to prevent further execution if initialization fails
}

const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
