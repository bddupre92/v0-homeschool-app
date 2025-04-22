"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { trackEvent, trackPageView, AnalyticsComponent } from "./analytics-service"

interface AnalyticsContextProps {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
}

const AnalyticsContext = createContext<AnalyticsContextProps>({
  trackEvent: () => {},
})

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views
  useEffect(() => {
    if (pathname) {
      const url = searchParams?.size ? `${pathname}?${searchParams.toString()}` : pathname

      trackPageView(url)
    }
  }, [pathname, searchParams])

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
      <AnalyticsComponent />
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  return useContext(AnalyticsContext)
}
