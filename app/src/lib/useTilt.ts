import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { useMotionValue, useSpring, useReducedMotion, useMotionTemplate } from 'motion/react'

/**
 * Spring-physics 3D tilt driven by pointer position. Transform-only, and it
 * switches itself off for reduced motion and for coarse pointers, where a
 * hover tilt is meaningless and the element should stay tappable.
 */
export function useTilt({ max = 10, glare = true } = {}) {
  const reduce = useReducedMotion()
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  const active = !reduce && !coarse

  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0), ry = useMotionValue(0)
  const gx = useMotionValue(50), gy = useMotionValue(50)
  const srx = useSpring(rx, { stiffness: 170, damping: 18 })
  const sry = useSpring(ry, { stiffness: 170, damping: 18 })
  const glareBg = useMotionTemplate`radial-gradient(55% 55% at ${gx}% ${gy}%, oklch(1 0 0 / 0.22), transparent 70%)`

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!active || !ref.current) return
    const b = ref.current.getBoundingClientRect()
    const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height
    ry.set((px - 0.5) * max * 2); rx.set((0.5 - py) * max * 2)
    gx.set(px * 100); gy.set(py * 100)
  }
  const onPointerLeave = () => { rx.set(0); ry.set(0); gx.set(50); gy.set(50) }

  // `bind` is spread straight onto the element, so nothing reads a ref during render
  return {
    active,
    glare: active && glare ? glareBg : undefined,
    bind: {
      ref,
      onPointerMove,
      onPointerLeave,
      style: active ? { rotateX: srx, rotateY: sry, transformPerspective: 1200 } : undefined,
    },
  }
}
