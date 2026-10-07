import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { sinePath } from '@/components/rig/wave'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

/* 120 × 60 board, horizontal; 60 × 120 when stacked on a phone. The sine is drawn a
   wavelength past each end so sliding it never reveals a gap. */
const H_MAIN = sinePath(-30, 150, 30, 12)
const H_ECHO = sinePath(-30, 150, 30, 7, Math.PI / 2)
const V_MAIN = sinePath(-30, 150, 30, 12, 0, true)
const V_ECHO = sinePath(-30, 150, 30, 7, Math.PI / 2, true)

/**
 * The current wave between the socket and the meter. Live: two phase-shifted
 * sines flow towards the meter over a bright wire that draws itself as the
 * section scrolls through the viewport (scroll-scrubbed, as before). Not live:
 * a dead, dashed line with a cross — no measurement path.
 */
export function WaveLink({ live, vertical }: { live: boolean; vertical: boolean }) {
  const reduce = useReducedMotion()
  const svg = useRef<SVGSVGElement>(null)
  const w = vertical ? 60 : 120, h = vertical ? 120 : 60
  const wire = vertical ? 'M 30 0 V 120' : 'M 0 30 H 120'
  const flow = vertical ? 'rig-wave-v' : 'rig-wave'

  useEffect(() => {
    if (reduce || !live || !svg.current) return
    const ctx = gsap.context(() => {
      const draw = svg.current!.querySelector<SVGPathElement>('.scrub-draw')
      if (!draw) return
      const L = draw.getTotalLength()
      gsap.set(draw, { strokeDasharray: L, strokeDashoffset: L })
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg.current, start: 'top 90%', end: 'bottom 35%', scrub: 0.5 } })
      tl.to(draw, { strokeDashoffset: 0, ease: 'none' }, 0)
      tl.to('.scrub-carrier', { motionPath: { path: draw, align: draw, alignOrigin: [0.5, 0.5] }, ease: 'none' }, 0)
    }, svg)
    return () => ctx.revert()
  }, [reduce, live, vertical])

  return (
    <div className={vertical ? 'mx-auto h-28 w-14' : 'mx-auto h-16 w-full max-w-[8.5rem]'} data-rig="wave" data-live={live}>
      <svg ref={svg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block size-full overflow-hidden" role="img"
        aria-label={live ? 'Current flows from the socket into the RISIQ meter.' : 'No measurement path: the car refused the request, so nothing reaches the meter.'}>
        <defs>
          <linearGradient id="rl-fade" x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
            <stop offset="0" stopColor="#000" /><stop offset="0.16" stopColor="#fff" /><stop offset="0.84" stopColor="#fff" /><stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="rl-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
            <rect width={w} height={h} fill="url(#rl-fade)" />
          </mask>
        </defs>

        {live ? (
          <g mask="url(#rl-mask)">
            <path d={wire} stroke="#0e3a40" strokeWidth="3" fill="none" />
            <g className={reduce ? undefined : flow} style={{ animationDuration: '1.4s' }}>
              <path d={vertical ? V_ECHO : H_ECHO} fill="none" stroke="#00F2FE" strokeOpacity="0.35" strokeWidth="1.6" />
            </g>
            <g className={reduce ? undefined : flow}>
              <path d={vertical ? V_MAIN : H_MAIN} fill="none" stroke="#00F2FE" strokeOpacity="0.16" strokeWidth="9" strokeLinecap="round" />
              <path d={vertical ? V_MAIN : H_MAIN} fill="none" stroke="#00F2FE" strokeOpacity="0.32" strokeWidth="5" strokeLinecap="round" />
              <path d={vertical ? V_MAIN : H_MAIN} fill="none" stroke="#aefbff" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            {!reduce && (
              <g aria-hidden>
                <path className="scrub-draw" d={wire} fill="none" stroke="#e6fffd" strokeWidth="1.6" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 5px #00F2FE)' }} />
                <circle className="scrub-carrier" r="3.6" fill="#fff" style={{ filter: 'drop-shadow(0 0 6px #00F2FE) drop-shadow(0 0 14px #00F2FE)' }} />
              </g>
            )}
          </g>
        ) : (
          <g>
            <path d={wire} stroke="#334155" strokeWidth="2" strokeDasharray="4 6" fill="none" />
            <g stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 5px #ef4444)' }}>
              <path d="M -6 -6 L 6 6 M 6 -6 L -6 6" transform={vertical ? 'translate(30 60)' : 'translate(60 30)'} />
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}
