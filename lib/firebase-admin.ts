import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"

// Check if we already have an initialized app
if (!getApps().length) {
  // Always use a service account key file
  // Ensure service-account.json is in the root of your project and gitignored
  try {
    const serviceAccount = require("../service-account.json")
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    })
    console.log("Firebase Admin SDK initialized using service-account.json");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK with service-account.json:", error);
    // Fallback or further error handling if needed, 
    // for now, we'll let it fail if the JSON is missing/corrupt
    // as it's critical for admin operations.
  }
}

// Export the admin services
export const adminDb = getFirestore()
export const adminAuth = getAuth()
export const adminStorage = getStorage()

// Add the db export that's being referenced elsewhere
export const db = adminDb
