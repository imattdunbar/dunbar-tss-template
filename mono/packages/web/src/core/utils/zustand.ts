import { create, useStore } from 'zustand'
import Storage from '@/core/utils/storage'

type StoreConfig = {
  persistKey?: string
}

export function createStore<T extends object>(initial?: T, config: StoreConfig = {}) {
  let initialState = initial ?? ({} as T)

  const store = create<T>(() => initialState)

  const { persistKey } = config

  if (persistKey) {
    const stored = Storage.loadObject(persistKey, initialState)
    if (stored) {
      store.setState(stored, true)
    }
    store.subscribe((state) => {
      Storage.saveObject(persistKey, state)
    })
  }

  return Object.assign(store, {
    current: () => store.getState(),
    update: (partial: Partial<T>) => {
      store.setState(partial)
    },
    reset: () => {
      store.setState(initialState ?? ({} as T), true)
    },
    use: <U = T>(selector?: (state: T) => U) => {
      if (selector) {
        return useStore(store, selector)
      }
      return useStore(store, (state) => state as unknown as U)
    }
  })
}
