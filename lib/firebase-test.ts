// Simple Firebase test utility
import { auth, db, isFirebaseAvailable } from './firebase'

export const testFirebaseConnection = () => {
  console.log('=== Firebase Connection Test ===')
  console.log('Firebase available:', isFirebaseAvailable())
  console.log('Auth object:', auth ? 'initialized' : 'null')
  console.log('DB object:', db ? 'initialized' : 'null')
  
  // Test environment variables
  console.log('Environment variables:')
  console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'set' : 'missing')
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'set' : 'missing')
  console.log('Sender ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'set' : 'missing')
  console.log('App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'set' : 'missing')
  console.log('================================')
}