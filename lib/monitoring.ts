"use server"

import { headers } from "next/headers"

type ErrorEvent = {
  message: string
  source: string
  lineno?: number
  colno?: number
  error?: Error
  url: string
  timestamp: number
  userAgent?: string
}

type PerformanceEvent = {
  name: string
  duration: number
  url: string
  timestamp: number
  userAgent?: string
}

// In a real app, you'd send these to a monitoring service
// like Sentry, LogRocket, etc.
export async function logError(event: Omit<ErrorEvent, "userAgent">) {
  try {
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || undefined

    const errorEvent: ErrorEvent = {
      ...event,
      userAgent,
    }

    console.error("Client error:", errorEvent)

    // Here you would send to your error tracking service
    // Example: await fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorEvent) })

    return { success: true }
  } catch (error) {
    console.error("Failed to log error:", error)
    return { success: false }
  }
}

export async function logPerformance(event: Omit<PerformanceEvent, "userAgent">) {
  try {
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || undefined

    const perfEvent: PerformanceEvent = {
      ...event,
      userAgent,
    }

    console.log("Performance event:", perfEvent)

    // Here you would send to your performance monitoring service

    return { success: true }
  } catch (error) {
    console.error("Failed to log performance:", error)
    return { success: false }
  }
}
