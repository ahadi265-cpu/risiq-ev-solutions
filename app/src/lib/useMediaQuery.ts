import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query. Server/first render falls back to `fallback`. */
export function useMediaQuery(query: string, fallback = false) {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', notify)
      return () => mq.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  )
}
