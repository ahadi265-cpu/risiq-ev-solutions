import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

let instance: Lenis | null = null
export const getLenis = () => instance

/**
 * Momentum scrolling for the whole SPA, driven by GSAP's ticker so every
 * ScrollTrigger reads the same smoothed position. Native scrolling is kept on
 * touch devices (their momentum is already right) and under reduced motion.
 */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const lenis = new Lenis({ autoRaf: false, lerp: 0.09, smoothWheel: true, anchors: { offset: -88 } })
    instance = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(tick); lenis.destroy(); instance = null }
  }, [])
}

export function scrollToTop() {
  if (instance) instance.scrollTo(0, { immediate: true })
  else window.scrollTo({ top: 0, behavior: 'instant' })
}

export function scrollToEl(el: Element | null, offset = -88) {
  if (!el) return
  if (instance) instance.scrollTo(el as HTMLElement, { offset })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
