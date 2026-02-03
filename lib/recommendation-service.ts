// Types for content and preferences
export interface ContentItem {
  id: string
  type: string
  title: string
  description: string
  image: string
  tags: string[]
  author: {
    name: string
    avatar: string
  }
  stats: {
    likes: number
    comments: number
    saves: number
  }
  liked?: boolean
  saved?: boolean
  items?: number
}

export interface UserPreferences {
  grades: string[]
  subjects: string[]
  approaches: string[]
  resourceTypes: string[]
  interests?: string[]
  recentlyViewed?: string[]
  likedTags?: string[]
  savedTags?: string[]
}

// Calculate a match score between content and user preferences
export function calculateMatchScore(content: ContentItem, preferences: UserPreferences): number {
  if (!preferences) return 50 // Default score if no preferences

  let score = 50 // Base score
  let matchPoints = 0
  let totalPossiblePoints = 0

  // Check tags against preferences
  content.tags.forEach((tag) => {
    // Check if tag matches any grade level preference
    if (preferences.grades.some((grade) => tag.toLowerCase().includes(grade.toLowerCase()))) {
      matchPoints += 3
      totalPossiblePoints += 3
    }

    // Check if tag matches any subject preference
    if (preferences.subjects.some((subject) => tag.toLowerCase().includes(subject.toLowerCase()))) {
      matchPoints += 4
      totalPossiblePoints += 4
    }

    // Check if tag matches any approach preference
    if (preferences.approaches.some((approach) => tag.toLowerCase().includes(approach.toLowerCase()))) {
      matchPoints += 5
      totalPossiblePoints += 5
    }

    // Check if tag matches any resource type preference
    if (preferences.resourceTypes.some((type) => tag.toLowerCase().includes(type.toLowerCase()))) {
      matchPoints += 3
      totalPossiblePoints += 3
    }

    // Check if tag matches any interest
    if (preferences.interests?.some((interest) => tag.toLowerCase().includes(interest.toLowerCase()))) {
      matchPoints += 4
      totalPossiblePoints += 4
    }

    // Check if tag is in liked tags
    if (preferences.likedTags?.some((likedTag) => tag.toLowerCase().includes(likedTag.toLowerCase()))) {
      matchPoints += 5
      totalPossiblePoints += 5
    }

    // Check if tag is in saved tags
    if (preferences.savedTags?.some((savedTag) => tag.toLowerCase().includes(savedTag.toLowerCase()))) {
      matchPoints += 6
      totalPossiblePoints += 6
    }
  })

  // Add points for content type if it matches preferred resource types
  if (content.type === "resource" && preferences.resourceTypes.some((type) => type.toLowerCase() === "resource")) {
    matchPoints += 3
    totalPossiblePoints += 3
  }

  // Calculate final score
  if (totalPossiblePoints > 0) {
    // Convert to percentage and add to base score
    const matchPercentage = (matchPoints / totalPossiblePoints) * 50
    score += matchPercentage
  }

  // Boost score for recently viewed content types
  if (preferences.recentlyViewed?.includes(content.type)) {
    score += 5
  }

  // Cap score at 100
  return Math.min(Math.round(score), 100)
}

// Sort content based on match score
export function sortContentByRelevance(
  content: ContentItem[],
  preferences: UserPreferences,
): { item: ContentItem; score: number }[] {
  return content
    .map((item) => ({
      item,
      score: calculateMatchScore(item, preferences),
    }))
    .sort((a, b) => b.score - a.score)
}

// Get personalized content recommendations
export function getPersonalizedRecommendations(
  allContent: ContentItem[],
  preferences: UserPreferences,
  count = 10,
): { item: ContentItem; score: number }[] {
  const scoredContent = sortContentByRelevance(allContent, preferences)
  return scoredContent.slice(0, count)
}

// Extract tags from user interactions to enhance preferences
export function extractTagsFromInteractions(
  likedContent: ContentItem[],
  savedContent: ContentItem[],
): { likedTags: string[]; savedTags: string[] } {
  const likedTags = new Set<string>()
  const savedTags = new Set<string>()

  likedContent.forEach((content) => {
    content.tags.forEach((tag) => likedTags.add(tag))
  })

  savedContent.forEach((content) => {
    content.tags.forEach((tag) => savedTags.add(tag))
  })

  return {
    likedTags: Array.from(likedTags),
    savedTags: Array.from(savedTags),
  }
}

// Update user preferences based on interactions
export function updatePreferencesFromInteractions(
  preferences: UserPreferences,
  likedContent: ContentItem[],
  savedContent: ContentItem[],
  viewedContentTypes: string[],
): UserPreferences {
  const { likedTags, savedTags } = extractTagsFromInteractions(likedContent, savedContent)

  return {
    ...preferences,
    likedTags,
    savedTags,
    recentlyViewed: viewedContentTypes,
  }
}
