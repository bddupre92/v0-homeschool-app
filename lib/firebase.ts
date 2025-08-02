import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Connect to emulators in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Only connect to emulators if we haven't already
  if (!auth.config.emulator) {
    try {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    } catch (error) {
      console.log("Auth emulator already connected")
    }
  }

  // Connect Firestore emulator
  try {
    connectFirestoreEmulator(db, "localhost", 8080)
  } catch (error) {
    console.log("Firestore emulator already connected")
  }

  // Connect Storage emulator
  try {
    connectStorageEmulator(storage, "localhost", 9199)
  } catch (error) {
    console.log("Storage emulator already connected")
  }
}

export default app
