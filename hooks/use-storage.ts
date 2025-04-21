"use client"

import { useState, useCallback } from "react"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "../lib/firebase"
import { useAuth } from "@/contexts/auth-context"

export function useStorage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Upload file to Firebase Storage
  const uploadFile = useCallback(
    (file: File, path: string): Promise<string> => {
      if (!user) throw new Error("User must be logged in")
      if (!file) throw new Error("No file provided")

      setIsUploading(true)
      setProgress(0)
      setError(null)
      setUrl(null)

      return new Promise((resolve, reject) => {
        // Create a unique filename
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`
        const storageRef = ref(storage, `${path}/${user.uid}/${fileName}`)

        // Start upload
        const uploadTask = uploadBytesResumable(storageRef, file)

        // Listen for state changes
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Track upload progress
            const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setProgress(percentage)
          },
          (error) => {
            // Handle errors
            console.error("Upload error:", error)
            setError(error instanceof Error ? error : new Error("Upload failed"))
            setIsUploading(false)
            reject(error)
          },
          async () => {
            // Upload completed successfully
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              setUrl(downloadURL)
              setIsUploading(false)
              resolve(downloadURL)
            } catch (error) {
              console.error("Error getting download URL:", error)
              setError(error instanceof Error ? error : new Error("Failed to get download URL"))
              setIsUploading(false)
              reject(error)
            }
          },
        )
      })
    },
    [user],
  )

  // Delete file from Firebase Storage
  const deleteFile = useCallback(async (fileUrl: string): Promise<boolean> => {
    if (!fileUrl) return false

    try {
      // Extract the path from the URL
      const fileRef = ref(storage, fileUrl)
      await deleteObject(fileRef)
      return true
    } catch (error) {
      console.error("Error deleting file:", error)
      setError(error instanceof Error ? error : new Error("Failed to delete file"))
      return false
    }
  }, [])

  return {
    progress,
    error,
    url,
    isUploading,
    uploadFile,
    deleteFile,
  }
}
