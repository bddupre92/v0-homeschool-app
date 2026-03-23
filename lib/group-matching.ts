import type { GroupProfile, GroupMatchResult, MatchBreakdown, UserGroupPreferences } from "./types"

// Weights for scoring criteria (must sum to 1.0)
const WEIGHTS = {
  distance: 0.4,
  ageOverlap: 0.25,
  philosophyMatch: 0.15,
  subjectOverlap: 0.1,
  scheduleCompat: 0.1,
}

// Related philosophy pairs that earn partial credit
const RELATED_PHILOSOPHIES: Record<string, string[]> = {
  classical: ["charlotte_mason"],
  charlotte_mason: ["classical"],
  montessori: ["reggio", "waldorf"],
  reggio: ["montessori", "waldorf"],
  waldorf: ["montessori", "reggio"],
  unschooling: ["eclectic"],
  eclectic: ["unschooling"],
}

/**
 * Haversine distance between two lat/lng points in miles
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Score distance: 0-5 mi = 100%, 5-15 mi = linear decay, >15 mi = 0%
 */
function scoreDistance(userLat?: number, userLng?: number, groupLat?: number, groupLng?: number, maxMiles = 15): { score: number; distanceMiles?: number } {
  if (!userLat || !userLng || !groupLat || !groupLng) {
    return { score: 50 } // Neutral if no location data
  }
  const dist = haversineDistance(userLat, userLng, groupLat, groupLng)
  if (dist <= 5) return { score: 100, distanceMiles: dist }
  if (dist >= maxMiles) return { score: 0, distanceMiles: dist }
  const score = 100 * (1 - (dist - 5) / (maxMiles - 5))
  return { score, distanceMiles: dist }
}

/**
 * Score age group overlap using intersection/union (Jaccard similarity)
 */
function scoreAgeOverlap(userAgeGroups: string[], groupAgeGroups: string[]): number {
  if (userAgeGroups.length === 0 || groupAgeGroups.length === 0) return 50
  const intersection = userAgeGroups.filter((a) => groupAgeGroups.includes(a))
  const union = new Set([...userAgeGroups, ...groupAgeGroups])
  return (intersection.length / union.size) * 100
}

/**
 * Score philosophy match: exact = 100%, related = 60%, else = 0%
 */
function scorePhilosophy(userPhilosophy?: string, groupPhilosophy?: string): number {
  if (!userPhilosophy || !groupPhilosophy) return 50
  if (userPhilosophy === groupPhilosophy) return 100
  const related = RELATED_PHILOSOPHIES[userPhilosophy]
  if (related?.includes(groupPhilosophy)) return 60
  return 0
}

/**
 * Score subject overlap using Jaccard similarity
 */
function scoreSubjectOverlap(wantedSubjects: string[], offeredSubjects: string[]): number {
  if (wantedSubjects.length === 0 || offeredSubjects.length === 0) return 50
  const wanted = wantedSubjects.map((s) => s.toLowerCase())
  const offered = offeredSubjects.map((s) => s.toLowerCase())
  const intersection = wanted.filter((s) => offered.includes(s))
  if (intersection.length === 0) return 0
  return (intersection.length / wanted.length) * 100
}

/**
 * Score schedule compatibility on preferred day
 */
function scoreSchedule(preferredDay?: string, groupSchedule?: { day: string }): number {
  if (!preferredDay || !groupSchedule?.day) return 50
  return preferredDay.toLowerCase() === groupSchedule.day.toLowerCase() ? 100 : 0
}

/**
 * Score a single group against user preferences
 */
export function scoreGroup(prefs: UserGroupPreferences, group: GroupProfile): { breakdown: MatchBreakdown; totalScore: number; distanceMiles?: number } {
  const distResult = scoreDistance(prefs.latitude, prefs.longitude, group.latitude, group.longitude, prefs.maxDistanceMiles)
  const ageScore = scoreAgeOverlap(prefs.childAgeGroups, group.ageGroups)
  const philScore = scorePhilosophy(prefs.preferredPhilosophy, group.philosophy)
  const subjScore = scoreSubjectOverlap(prefs.wantedSubjects, group.subjectsOffered)
  const schedScore = scoreSchedule(prefs.preferredDay, group.schedule)

  const breakdown: MatchBreakdown = {
    distance: Math.round(distResult.score),
    ageOverlap: Math.round(ageScore),
    philosophyMatch: Math.round(philScore),
    subjectOverlap: Math.round(subjScore),
    scheduleCompat: Math.round(schedScore),
  }

  const totalScore = Math.round(
    distResult.score * WEIGHTS.distance +
    ageScore * WEIGHTS.ageOverlap +
    philScore * WEIGHTS.philosophyMatch +
    subjScore * WEIGHTS.subjectOverlap +
    schedScore * WEIGHTS.scheduleCompat
  )

  return { breakdown, totalScore, distanceMiles: distResult.distanceMiles }
}

/**
 * Rank a list of groups by match score (descending)
 */
export function rankGroups(prefs: UserGroupPreferences, groups: GroupProfile[]): GroupMatchResult[] {
  return groups
    .map((group) => {
      const { breakdown, totalScore, distanceMiles } = scoreGroup(prefs, group)
      return {
        ...group,
        matchScore: totalScore,
        matchBreakdown: breakdown,
        distanceMiles,
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}
