"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Cache token for 1 hour
const CACHE_DURATION = 60 * 60 * 1000

export async function getMapboxToken() {
  try {
    // Check if we have a cached token in cookies
    const cookieStore = cookies()
    const cachedToken = cookieStore.get("mapbox_token")

    if (cachedToken) {
      try {
        const tokenData = JSON.parse(cachedToken.value)
        // If token is still valid (not expired), return it
        if (tokenData.expires > Date.now()) {
          return { token: tokenData.token, error: null }
        }
      } catch (e) {
        // Invalid JSON in cookie, will fetch a new token
      }
    }

    // Get token from environment variable
    const token = process.env.MAPBOX_ACCESS_TOKEN

    if (!token) {
      console.error("Mapbox token not found in environment variables")
      return {
        token: null,
        error: "Mapbox configuration is missing. Please contact support.",
      }
    }

    // Store token in cookie with expiration
    const tokenData = {
      token: token,
      expires: Date.now() + CACHE_DURATION,
    }

    // Set cookie with the token data
    cookieStore.set({
      name: "mapbox_token",
      value: JSON.stringify(tokenData),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: CACHE_DURATION / 1000, // Convert to seconds
    })

    return { token, error: null }
  } catch (error) {
    console.error("Error getting Mapbox token:", error)
    return {
      token: null,
      error: "Failed to load map configuration. Please try again later.",
    }
  }
}

export async function saveLocation(locationData: any) {
  try {
    // Validate location data
    if (!locationData || !locationData.name || !locationData.coordinates) {
      return { success: false, error: "Invalid location data" }
    }

    // Here you would save the location to your database
    // For example, using Firestore

    // Revalidate the locations page to show the new location
    revalidatePath("/community/locations")

    return { success: true, error: null }
  } catch (error) {
    console.error("Error saving location:", error)
    return {
      success: false,
      error: "Failed to save location. Please try again later.",
    }
  }
}
