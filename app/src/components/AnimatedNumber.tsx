import { useEffect, useLayoutEffect, useRef } from 'react'
import { useMotionValueEvent, useReducedMotion, useSpring } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * A figure that glides to its new value on a spring. Digits are tabular
 * (`tabular-nums`) so the glyph widths never change mid-flight, and the text is
 * written straight to the DOM per frame, so React doesn't re-render 60 times a
 * second. A screen-reader-only copy carries the settled value.
 */
export function AnimatedNumber({ value, format, className }: {
  value: number; format: (n: number) => string; className?: string
}) {
  const reduce = useReducedMotion()
  const spring = useSpring(value, { stiffness: 140, damping: 22, mass: 1 })
  const el = useRef<HTMLSpanElement>(null)
  const fmt = useRef(format)
  useEffect(() => { fmt.current = format })

  useEffect(() => { if (reduce) spring.jump(value); else spring.set(value) }, [value, reduce, spring])
  useLayoutEffect(() => { if (el.current) el.current.textContent = fmt.current(spring.get()) }, [spring])
  useMotionValueEvent(spring, 'change', (v) => { if (el.current) el.current.textContent = fmt.current(v) })

  return (
    <>
      <span ref={el} aria-hidden className={cn('tabular-nums', className)} />
      <span className="sr-only">{format(value)}</span>
    </>
  )
}
