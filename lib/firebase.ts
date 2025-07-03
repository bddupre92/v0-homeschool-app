import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore"
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase App as a singleton
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Create getter functions for each service to ensure they are initialized on demand
export const getFirebaseAuth = (): Auth => {
  const auth = getAuth(app)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    try {
      // Connect to emulator only once
      if (!auth.config.emulator) {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
      }
    } catch (error) {
      console.log("Auth emulator already connected or not available")
    }
  }
  return auth
}

export const getFirebaseDb = (): Firestore => {
  const db = getFirestore(app)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    try {
      // A simple check to see if it's already connected. This is not foolproof.
      if (!(db as any)._delegate._databaseId.projectId.includes("demo-")) {
        connectFirestoreEmulator(db, "localhost", 8080)
      }
    } catch (error) {
      console.log("Firestore emulator already connected or not available")
    }
  }
  return db
}

export const getFirebaseStorage = (): FirebaseStorage => {
  const storage = getStorage(app)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    try {
      if (!(storage as any)._delegate._host.includes("localhost")) {
        connectStorageEmulator(storage, "localhost", 9199)
      }
    } catch (error) {
      console.log("Storage emulator already connected or not available")
    }
  }
  return storage
}

// Export the app instance itself if needed elsewhere
export { app }
