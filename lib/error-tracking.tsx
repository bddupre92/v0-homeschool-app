"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import * as Sentry from "@sentry/nextjs"

interface ErrorTrackingContextProps {
  captureException: (error: Error, context?: Record<string, any>) => void
  captureMessage: (message: string, context?: Record<string, any>) => void
}

const ErrorTrackingContext = createContext<ErrorTrackingContextProps>({
  captureException: () => {},
  captureMessage: () => {},
})

export function ErrorTrackingProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          tracesSampleRate: 0.5,
        })
      }
    } catch (error) {
      console.warn("Failed to initialize Sentry:", error)
    }
  }, [])

  const captureException = (error: Error, context?: Record<string, any>) => {
    console.error("Error:", error)
    try {
      if (process.env.NODE_ENV === "production" && Sentry) {
        Sentry.captureException(error, { extra: context })
      }
    } catch (err) {
      console.error("Failed to capture exception:", err)
    }
  }

  const captureMessage = (message: string, context?: Record<string, any>) => {
    console.log("Message:", message)
    try {
      if (process.env.NODE_ENV === "production" && Sentry) {
        Sentry.captureMessage(message, "info", { extra: context })
      }
    } catch (err) {
      console.error("Failed to capture message:", err)
    }
  }

  return (
    <ErrorTrackingContext.Provider value={{ captureException, captureMessage }}>
      {children}
    </ErrorTrackingContext.Provider>
  )
}

export function useErrorTracking() {
  return useContext(ErrorTrackingContext)
}
