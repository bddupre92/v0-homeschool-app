export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) {
      return fallback
    }
    return JSON.parse(stored) as T
  } catch (error) {
    console.warn(`Failed to load ${key} from local storage`, error)
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to save ${key} to local storage`, error)
  }
}
