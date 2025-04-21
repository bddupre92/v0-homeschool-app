"use client"

import { createContext, useContext, type ReactNode } from "react"
import { Analytics } from "@vercel/analytics/react"

interface AnalyticsContextProps {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
}

const AnalyticsContext = createContext<AnalyticsContextProps>({
  trackEvent: () => {},
})

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  // Function to track events
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Track event with Vercel Analytics
    if (typeof window !== "undefined" && window.va) {
      window.va("event", {
        name: eventName,
        ...properties,
      })
    }

    // Log events in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${eventName}`, properties)
    }
  }

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
      <Analytics />
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  return useContext(AnalyticsContext)
}
