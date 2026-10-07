import { useEffect, useState, type RefObject } from 'react'

/** True once the element has been at least `threshold` visible, and stays true. A
 *  state-returning sibling of `useInViewOnce` for sequences that start on sight. */
export function useSeen(ref: RefObject<HTMLElement | null>, threshold = 0.35) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === 'undefined') { const t = window.setTimeout(() => setSeen(true), 0); return () => clearTimeout(t) }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, seen, threshold])
  return seen
}
