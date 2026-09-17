import {
  Children, cloneElement, isValidElement, useEffect, useRef,
  type CSSProperties, type ReactNode,
} from 'react'
import type { Variants } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Scroll-triggered reveals, done the way the project rule demands: the entrance
 * is a CSS keyframe animation (which always reaches its end state) started by a
 * data attribute that an IntersectionObserver sets once. There is no JS
 * animation loop and no Motion tween, so a starved frame loop, a print
 * stylesheet or a tall headless viewport can never strand content invisible.
 * Reduced motion and print are handled in CSS (see `.reveal` in index.css).
 */
function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.dataset.in !== undefined) return
    // Already on screen at mount (first viewport, tall windows, print preview):
    // reveal synchronously rather than waiting on an observer callback.
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight * 0.96 && r.bottom > 0) { el.dataset.in = ''; return }
    if (!('IntersectionObserver' in window)) { el.dataset.in = ''; return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.dataset.in = ''; io.disconnect() }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

export function Reveal({ children, delay = 0, y = 22, className }: {
  children: ReactNode; delay?: number; y?: number; className?: string
}) {
  const ref = useInViewOnce<HTMLDivElement>()
  return (
    <div ref={ref} className={cn('reveal', className)}
      style={{ '--reveal-delay': `${delay}s`, '--reveal-y': `${y}px` } as CSSProperties}>
      {children}
    </div>
  )
}

/** Staggers its direct children as the group enters the viewport. Children are
 *  given the `reveal-item` class and a per-item delay; nothing is wrapped, so
 *  grid and flex layouts are unaffected. */
export function RevealGroup({ children, className, stagger = 0.08 }: {
  children: ReactNode; className?: string; stagger?: number
}) {
  const ref = useInViewOnce<HTMLDivElement>()
  let i = 0
  const items = Children.map(children, (child) => {
    if (!isValidElement<{ className?: string; style?: CSSProperties }>(child)) return child
    const delay = i++ * stagger
    return cloneElement(child, {
      className: cn(child.props.className, 'reveal-item'),
      style: { ...child.props.style, '--reveal-delay': `${delay}s` } as CSSProperties,
    })
  })
  return <div ref={ref} className={cn('reveal-group', className)}>{items}</div>
}

/** Kept for call-site compatibility: pages still pass `variants={revealItem}`
 *  to motion elements inside a RevealGroup. The entrance now runs on CSS, so
 *  these variants are intentionally empty. */
export const revealItem: Variants = {}
