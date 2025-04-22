"use client"

import { useState, useEffect, useCallback } from "react"
import { useLocalStorageCache } from "@/lib/cache"
import {
  type ContentItem,
  type UserPreferences,
  getPersonalizedRecommendations,
  updatePreferencesFromInteractions,
} from "@/lib/recommendation-service"

// Default preferences if none exist
const defaultPreferences: UserPreferences = {
  grades: [],
  subjects: [],
  approaches: [],
  resourceTypes: [],
  interests: [],
  recentlyViewed: [],
  likedTags: [],
  savedTags: [],
}

export function useRecommendations(initialContent: ContentItem[] = []) {
  const { getItem, setItem } = useLocalStorageCache()

  // Load preferences from local storage
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    return getItem("user-preferences", defaultPreferences)
  })

  // Track user interactions
  const [likedContent, setLikedContent] = useState<ContentItem[]>([])
  const [savedContent, setSavedContent] = useState<ContentItem[]>([])
  const [viewedContentTypes, setViewedContentTypes] = useState<string[]>([])

  // Store recommended content
  const [recommendedContent, setRecommendedContent] = useState<{ item: ContentItem; score: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load interaction data from local storage
  useEffect(() => {
    setLikedContent(getItem("liked-content", []))
    setSavedContent(getItem("saved-content", []))
    setViewedContentTypes(getItem("viewed-content-types", []))
  }, [getItem])

  // Generate recommendations whenever preferences or content changes
  useEffect(() => {
    if (initialContent.length === 0) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Update preferences based on interactions
    const updatedPreferences = updatePreferencesFromInteractions(
      preferences,
      likedContent,
      savedContent,
      viewedContentTypes,
    )

    // Get personalized recommendations
    const recommendations = getPersonalizedRecommendations(initialContent, updatedPreferences)

    setRecommendedContent(recommendations)
    setIsLoading(false)

    // Save updated preferences
    setItem("user-preferences", updatedPreferences)
  }, [initialContent, preferences, likedContent, savedContent, viewedContentTypes, setItem])

  // Handle liking content
  const handleLikeContent = useCallback(
    (content: ContentItem) => {
      setLikedContent((prev) => {
        const exists = prev.some((item) => item.id === content.id)
        const updated = exists ? prev.filter((item) => item.id !== content.id) : [...prev, content]

        setItem("liked-content", updated)
        return updated
      })
    },
    [setItem],
  )

  // Handle saving content
  const handleSaveContent = useCallback(
    (content: ContentItem) => {
      setSavedContent((prev) => {
        const exists = prev.some((item) => item.id === content.id)
        const updated = exists ? prev.filter((item) => item.id !== content.id) : [...prev, content]

        setItem("saved-content", updated)
        return updated
      })
    },
    [setItem],
  )

  // Update user preferences
  const updatePreferences = useCallback(
    (newPreferences: Partial<UserPreferences>) => {
      setPreferences((prev) => {
        const updated = { ...prev, ...newPreferences }
        setItem("user-preferences", updated)
        return updated
      })
    },
    [setItem],
  )

  return {
    preferences,
    updatePreferences,
    recommendedContent,
    isLoading,
    handleLikeContent,
    handleSaveContent,
    isContentLiked: (id: string) => likedContent.some((item) => item.id === id),
    isContentSaved: (id: string) => savedContent.some((item) => item.id === id),
  }
}
