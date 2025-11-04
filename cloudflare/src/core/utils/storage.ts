const Storage = {
  loadObject<T>(key: string, fallback?: T): T | undefined {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : fallback
    } catch (e) {
      console.error(`Failed to load object from localStorage key ${key}`, e)
      return fallback
    }
  },
  saveObject<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to save to localStorage key "${key}":`, error)
    }
  }
}

export default Storage
