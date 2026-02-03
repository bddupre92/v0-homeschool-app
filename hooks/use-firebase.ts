import { useEffect, useState } from 'react'
import { auth, db, storage, isFirebaseAvailable } from '@/lib/firebase'

export function useFirebase() {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    setIsAvailable(isFirebaseAvailable())
  }, [])

  return {
    auth: isAvailable ? auth : null,
    db: isAvailable ? db : null,
    storage: isAvailable ? storage : null,
    isAvailable,
  }
}

export function useRequireFirebase() {
  const firebase = useFirebase()
  
  if (!firebase.isAvailable) {
    throw new Error('Firebase is required for this feature but is not available')
  }
  
  return {
    auth: firebase.auth!,
    db: firebase.db!,
    storage: firebase.storage!,
  }
}