import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-driven polish. Deliberately transform-only: never opacity-to-zero on
 * content, so a failed load or a print stylesheet can't leave sections blank.
 * Framer Motion handles entrance reveals; GSAP handles scrubbed motion.
 */
export function useGsapReveal(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        gsap.to(el, {
          yPercent: Number(el.dataset.parallax) || -8,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-settle]').forEach((el) => {
        gsap.from(el, {
          y: 14, duration: 0.5, ease: 'power2.out', clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        })
      })
    })

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => { window.removeEventListener('load', onLoad); ctx.revert() }
  }, [enabled])
}
