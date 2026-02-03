import { Analytics } from "@vercel/analytics/react"

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

// Track event with properties
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
    referrer: referrer || document.referrer,
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

// Analytics component
export function AnalyticsComponent() {
  // Create element using createElement instead of JSX
  return { type: Analytics, props: {} }
}
