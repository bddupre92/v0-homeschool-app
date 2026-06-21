/**
 * US ZIP → lat/lng/city lookup. Wraps the `zipcodes` npm package
 * (shipped as a local dataset — no network calls), normalizes the
 * shape, and validates input.
 *
 * Used by Phase 7 Community discovery to convert a user's ZIP into
 * coordinates for the Haversine match-distance scoring in
 * `lib/group-matching.ts`.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const zipcodes = require("zipcodes") as {
  lookup: (zip: string | number) => {
    zip: string
    latitude: number
    longitude: number
    city: string
    state: string
    country: string
  } | null
}

export interface ZipLookupResult {
  zip: string
  lat: number
  lng: number
  city: string
  state: string
}

/** Returns true for any 5-digit US ZIP string. */
export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim())
}

/**
 * Returns lat/lng/city/state for a US ZIP, or null if not found.
 * Accepts 5-digit ZIPs only; ignores ZIP+4. Silently rejects invalid input.
 */
export function lookupZip(zip: string): ZipLookupResult | null {
  if (!zip) return null
  const trimmed = zip.trim().slice(0, 5)
  if (!isValidZip(trimmed)) return null
  const result = zipcodes.lookup(trimmed)
  if (!result) return null
  return {
    zip: result.zip,
    lat: result.latitude,
    lng: result.longitude,
    city: result.city,
    state: result.state,
  }
}
