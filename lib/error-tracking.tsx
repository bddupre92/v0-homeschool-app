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
    if (process.env.NODE_ENV === "production") {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
        tracesSampleRate: 0.5,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      })
    }
  }, [])

  const captureException = (error: Error, context?: Record<string, any>) => {
    console.error("Error:", error)
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error, { extra: context })
    }
  }

  const captureMessage = (message: string, context?: Record<string, any>) => {
    console.log("Message:", message)
    if (process.env.NODE_ENV === "production") {
      Sentry.captureMessage(message, { extra: context })
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
