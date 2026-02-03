"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"

interface LazyLoadProps {
  children: ReactNode
  height?: string | number
  threshold?: number
  className?: string
}

export function LazyLoad({ children, height = "200px", threshold = 0.1, className }: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  return (
    <div ref={ref} className={className} style={{ minHeight: isVisible ? "auto" : height }}>
      {isVisible ? children : null}
    </div>
  )
}
