"use client"

import { createContext, useContext, type ReactNode } from "react"

interface CacheContextProps {
  getItem: <T>(key: string, defaultValue: T) => T
  setItem: <T>(key: string, value: T) => void
  removeItem: (key: string) => void
}

const CacheContext = createContext<CacheContextProps>({
  getItem: (key, defaultValue) => defaultValue,
  setItem: () => {},
  removeItem: () => {},
})

export function CacheProvider({ children }: { children: ReactNode }) {
  // Get item from local storage
  const getItem = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") {
      return defaultValue
    }

    try {
      const item = window.localStorage.getItem(`homescholar:${key}`)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error getting item from cache: ${key}`, error)
      return defaultValue
    }
  }

  // Set item in local storage
  const setItem = <T,>(key: string, value: T): void => {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(`homescholar:${key}`, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item in cache: ${key}`, error)
    }
  }

  // Remove item from local storage
  const removeItem = (key: string): void => {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.removeItem(`homescholar:${key}`)
    } catch (error) {
      console.error(`Error removing item from cache: ${key}`, error)
    }
  }

  return <CacheContext.Provider value={{ getItem, setItem, removeItem }}>{children}</CacheContext.Provider>
}

export function useLocalStorageCache() {
  return useContext(CacheContext)
}
