"use client"

import { useState } from "react"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { trackEvent } from "./analytics-service"

interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
}

interface PerformanceMonitoringContextProps {
  metrics: PerformanceMetrics
  measureUserInteraction: (name: string, startTime?: number) => () => void
}

const initialMetrics: PerformanceMetrics = {
  fcp: null,
  lcp: null,
  fid: null,
  cls: null,
  ttfb: null,
}

const PerformanceMonitoringContext = createContext<PerformanceMonitoringContextProps>({
  metrics: initialMetrics,
  measureUserInteraction: () => () => {},
})

export function PerformanceMonitoringProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(initialMetrics)

  // Measure Core Web Vitals
  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return
    }

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      if (entries.length > 0) {
        const fcp = entries[0].startTime
        setMetrics((prev) => ({ ...prev, fcp }))
        trackEvent("web_vitals_fcp", { value: fcp })
      }
    })

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1]
        const lcp = lastEntry.startTime
        setMetrics((prev) => ({ ...prev, lcp }))
        trackEvent("web_vitals_lcp", { value: lcp })
      }
    })

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      if (entries.length > 0) {
        const fid = entries[0].processingStart - entries[0].startTime
        setMetrics((prev) => ({ ...prev, fid }))
        trackEvent("web_vitals_fid", { value: fid })
      }
    })

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      setMetrics((prev) => ({ ...prev, cls: clsValue }))
      trackEvent("web_vitals_cls", { value: clsValue })
    })

    // Time to First Byte
    const navigationEntries = performance.getEntriesByType("navigation")
    if (navigationEntries.length > 0) {
      const ttfb = (navigationEntries[0] as PerformanceNavigationTiming).responseStart
      setMetrics((prev) => ({ ...prev, ttfb }))
      trackEvent("web_vitals_ttfb", { value: ttfb })
    }

    // Start observing
    fcpObserver.observe({ type: "paint", buffered: true })
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
    fidObserver.observe({ type: "first-input", buffered: true })
    clsObserver.observe({ type: "layout-shift", buffered: true })

    return () => {
      fcpObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])

  // Measure user interaction
  const measureUserInteraction = (name: string, startTime = performance.now()) => {
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      trackEvent("user_interaction", { name, duration })
    }
  }

  return (
    <PerformanceMonitoringContext.Provider value={{ metrics, measureUserInteraction }}>
      {children}
    </PerformanceMonitoringContext.Provider>
  )
}

export function usePerformanceMonitoring() {
  return useContext(PerformanceMonitoringContext)
}
