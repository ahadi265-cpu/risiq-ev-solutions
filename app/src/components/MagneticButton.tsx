import { forwardRef, useEffect, useRef, type ReactElement, type ComponentPropsWithoutRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

/* Motion driving a Radix Slot: Slot clones its single child (a Button, or a
   DialogTrigger's own asChild target) instead of wrapping it in a new
   element, so a trigger nested inside this keeps its real onClick, aria-*
   and ref — nothing about its accessibility or event wiring changes, only
   its transform. */
const MotionSlot = motion.create(Slot)

/**
 * Wraps a single trigger element (typically a `Button`) so it leans toward
 * the cursor before the pointer even reaches it, then snaps back on a spring
 * when the cursor leaves. Tracks the whole window rather than just its own
 * bounding box — that lead-in is what reads as "magnetic" rather than a
 * hover wobble. Disabled under reduced motion and on coarse pointers, where
 * the effect has no meaning and the trigger just sits still.
 *
 * Composes with `asChild`-style triggers, e.g.
 * `<BriefingModal trigger={<MagneticButton><Button>…</Button></MagneticButton>} />`:
 * when Radix's own `DialogTrigger asChild` clones its `onClick`/`aria-*`/
 * `ref` onto this component, `forwardRef` + the `...rest` spread carry them
 * through to `MotionSlot`, which (being built on the same `Slot`) clones
 * them again onto the real `<button>` underneath. Drop either half and the
 * dialog silently stops opening — Radix's props reach `MagneticButton`'s
 * own props, not its rendered output, unless something forwards them.
 */
// Motion redefines a handful of DOM event-handler names for its own gesture
// system (onDrag, onDragStart/End, onAnimationStart/End) with incompatible
// signatures. Nothing this component's two call sites pass needs those, so
// they're the only names excluded from the pass-through DOM props.
type MagneticButtonProps = { children: ReactElement; range?: number; strength?: number } & Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'
>

export const MagneticButton = forwardRef<HTMLElement, MagneticButtonProps>(function MagneticButton(
  { children, range = 40, strength = 0.4, ...rest }, forwardedRef,
) {
  const innerRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.5 })

  useEffect(() => {
    if (reduce || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) return
    const onMove = (e: PointerEvent) => {
      const el = innerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const dx = e.clientX - cx, dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      const reach = Math.max(r.width, r.height) / 2 + range
      if (dist < reach) {
        const pull = 1 - dist / reach // stronger the closer the cursor is to centre
        x.set(dx * strength * pull)
        y.set(dy * strength * pull)
      } else {
        x.set(0); y.set(0)
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, range, strength, x, y])

  return (
    <MotionSlot
      ref={(node: HTMLElement | null) => {
        innerRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      style={{ x: springX, y: springY }}
      {...rest}
    >
      {children}
    </MotionSlot>
  )
})
