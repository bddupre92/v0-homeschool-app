"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { trackError } from "./analytics-service"

interface ErrorTrackingContextProps {
  captureError: (error: Error, componentName?: string) => void
  captureMessage: (message: string, componentName?: string) => void
}

const ErrorTrackingContext = createContext<ErrorTrackingContextProps>({
  captureError: () => {},
  captureMessage: () => {},
})

export function ErrorTrackingProvider({ children }: { children: ReactNode }) {
  // Capture unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      captureError(event.error || new Error(event.message))
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      captureError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)))
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  // Capture error
  const captureError = (error: Error, componentName?: string) => {
    console.error(`[Error${componentName ? ` in ${componentName}` : ""}]`, error)

    // Track error with analytics
    trackError(error, componentName)

    // Here you would integrate with an error tracking service like Sentry
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: { componentName } })
    // }
  }

  // Capture message
  const captureMessage = (message: string, componentName?: string) => {
    console.warn(`[Warning${componentName ? ` in ${componentName}` : ""}]`, message)

    // Here you would integrate with an error tracking service like Sentry
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureMessage(message, { extra: { componentName } })
    // }
  }

  return (
    <ErrorTrackingContext.Provider value={{ captureError, captureMessage }}>{children}</ErrorTrackingContext.Provider>
  )
}

export function useErrorTracking() {
  return useContext(ErrorTrackingContext)
}
