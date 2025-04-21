import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"

// Check if we already have an initialized app
if (!getApps().length) {
  // If we're in a production environment, use the environment variables
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // The private key needs to have newlines replaced
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com`,
      storageBucket: `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`,
    })
  } else {
    // For local development, use a service account key file
    const serviceAccount = require("../service-account.json")
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    })
  }
}

// Export the admin services
export const adminDb = getFirestore()
export const adminAuth = getAuth()
export const adminStorage = getStorage()
