export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}

export function isPreview(): boolean {
  // Check if we're in a Vercel preview deployment
  return Boolean(process.env.VERCEL_ENV === "preview")
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production" && !isPreview()
}

export function getEnvironmentName(): string {
  if (isDevelopment()) return "development"
  if (isPreview()) return "preview"
  if (isProduction()) return "production"
  return "unknown"
}
