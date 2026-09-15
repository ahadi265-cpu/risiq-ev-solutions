import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'

/* Ambient glow behind every page: three blurred orbs drift on CSS keyframes and
   lean gently toward the cursor on a spring. Transform-only, pointer-events off,
   painted beneath content so cards and copy are never affected. */
export function AmbientOrbs() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 40, damping: 20 })
  const sy = useSpring(my, { stiffness: 40, damping: 20 })
  // each orb sits at a different "depth", so they separate as the cursor moves
  const ax = useTransform(sx, (n) => n * 70),  ay = useTransform(sy, (n) => n * 70)
  const bx = useTransform(sx, (n) => n * -100), by = useTransform(sy, (n) => n * -100)
  const cx = useTransform(sx, (n) => n * 45),  cy = useTransform(sy, (n) => n * 45)

  useEffect(() => {
    if (reduce) return
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, mx, my])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute -top-32 -left-40 size-[38rem]" style={{ x: ax, y: ay }}>
        <div className="orb orb-a size-full rounded-full" />
      </motion.div>
      <motion.div className="absolute top-[22rem] -right-32 size-[30rem]" style={{ x: bx, y: by }}>
        <div className="orb orb-b size-full rounded-full" />
      </motion.div>
      <motion.div className="absolute top-[64rem] left-[30%] size-[26rem]" style={{ x: cx, y: cy }}>
        <div className="orb orb-c size-full rounded-full" />
      </motion.div>
    </div>
  )
}
