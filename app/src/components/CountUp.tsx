import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/** Counts up when scrolled into view. Renders the final value immediately under
 *  reduced motion, and a settle timer guarantees the final value even when the
 *  frame loop is starved — the number is never left resting at 0. */
export function CountUp({ to, decimals = 0, prefix = '', suffix = '', duration = 1400 }: {
  to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const [val, setVal] = useState(reduce ? to : 0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce) { setVal(to); return }

    let raf = 0, settle = 0, started = false
    const start = () => {
      if (started) return
      started = true
      let t0: number | null = null
      const tick = (ts: number) => {
        if (t0 === null) t0 = ts
        const p = Math.min((ts - t0) / duration, 1)
        setVal(to * (1 - Math.pow(1 - p, 3)))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      settle = window.setTimeout(() => setVal(to), duration + 250)
    }

    const r = el.getBoundingClientRect()
    const onScreen = r.top < window.innerHeight && r.bottom > 0
    if (onScreen || !('IntersectionObserver' in window)) { start(); return () => { cancelAnimationFrame(raf); clearTimeout(settle) } }

    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { start(); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(settle) }
  }, [to, duration, reduce])

  return (
    <span ref={ref} className="tabular">
      {prefix}{val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}
