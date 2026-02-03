"use client"

import { createContext, useContext, type ReactNode, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Analytics as VercelAnalytics } from "@vercel/analytics/react"

// Define event categories
export enum EventCategory {
  Auth = "auth",
  Content = "content",
  Navigation = "navigation",
  Engagement = "engagement",
  Search = "search",
  User = "user",
  Error = "error",
}

// Define common events
export const AnalyticsEvents = {
  // Auth events
  SIGN_UP: `${EventCategory.Auth}_sign_up`,
  SIGN_IN: `${EventCategory.Auth}_sign_in`,
  SIGN_OUT: `${EventCategory.Auth}_sign_out`,
  PASSWORD_RESET: `${EventCategory.Auth}_password_reset`,

  // Content events
  VIEW_RESOURCE: `${EventCategory.Content}_view_resource`,
  SAVE_RESOURCE: `${EventCategory.Content}_save_resource`,
  CREATE_BOARD: `${EventCategory.Content}_create_board`,
  ADD_TO_BOARD: `${EventCategory.Content}_add_to_board`,

  // Navigation events
  PAGE_VIEW: `${EventCategory.Navigation}_page_view`,
  TAB_CHANGE: `${EventCategory.Navigation}_tab_change`,

  // Engagement events
  SEARCH: `${EventCategory.Search}_query`,
  FILTER_APPLY: `${EventCategory.Search}_filter_apply`,

  // User events
  UPDATE_PROFILE: `${EventCategory.User}_update_profile`,
  UPDATE_PREFERENCES: `${EventCategory.User}_update_preferences`,

  // Error events
  ERROR: `${EventCategory.Error}_occurred`,
}

interface AnalyticsContextProps {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
  trackPageView: (url: string, referrer?: string) => void
  trackError: (error: Error, componentName?: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextProps>({
  trackEvent: () => {},
  trackPageView: () => {},
  trackError: () => {},
})

// Analytics service functions
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Log events in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, properties)
  }

  // Track with Vercel Analytics
  if (typeof window !== "undefined" && window.va) {
    window.va("event", {
      name: eventName,
      ...properties,
    })
  }
}

// Track page view
export function trackPageView(url: string, referrer?: string) {
  trackEvent(AnalyticsEvents.PAGE_VIEW, {
    url,
    referrer: referrer || (typeof document !== "undefined" ? document.referrer : ""),
  })
}

// Track error
export function trackError(error: Error, componentName?: string) {
  trackEvent(AnalyticsEvents.ERROR, {
    message: error.message,
    stack: error.stack,
    component: componentName,
  })
}

// Re-export the tracking functions and AnalyticsEvents;

// Proper React component for Analytics
export function AnalyticsComponent() {
  return <VercelAnalytics />
}

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
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView, trackError }}>{children}</AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  return useContext(AnalyticsContext)
}
