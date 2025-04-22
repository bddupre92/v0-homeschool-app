"use server"

// This server action securely provides the Mapbox token to client components
export async function getMapboxToken() {
  // Only use the server-side environment variable
  const token = process.env.MAPBOX_ACCESS_TOKEN

  if (!token) {
    throw new Error("Mapbox token not configured")
  }

  return token
}
