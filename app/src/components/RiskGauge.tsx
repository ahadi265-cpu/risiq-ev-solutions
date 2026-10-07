import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useMotionValueEvent, useReducedMotion, useSpring } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import type { Grade } from '@/lib/data'
import { GRADE_BANDS, arcPath, clampSoh, gaugeColor, polar, sohToAngle } from '@/lib/gauge'
import { cn } from '@/lib/utils'

/* viewBox 360 × 360, dial centred at (180,180) */
const C = 180, R_ARC = 124, R_BAND = 147, R_LABEL = 166, R_TICK = 106, R_NUM = 88
const NEEDLE_TIP = 78

const TRACK = arcPath(C, C, R_ARC, 0, 100)
const BANDS = GRADE_BANDS.map((b) => ({ ...b, d: arcPath(C, C, R_BAND, b.from, b.to), mid: (b.from + b.to) / 2 }))
const TICKS = Array.from({ length: 21 }, (_, i) => {
  const v = i * 5, major = v % 25 === 0, a = sohToAngle(v)
  return { v, major, p0: polar(C, C, R_TICK, a), p1: polar(C, C, R_TICK - (major ? 9 : 5), a), num: polar(C, C, R_NUM, a) }
})
const SPRING = { stiffness: 110, damping: 15, mass: 1 } as const
const f = (n: number) => +n.toFixed(2)

/**
 * Radial state-of-health gauge, 0–100 %. The needle, the lit arc, the colour and
 * the centre readout are all driven by one spring so they move as a single
 * instrument; the DOM is written per frame rather than re-rendering React.
 * The diamond marks a reference value (Car A) on the same dial.
 */
export function RiskGauge({ soh, reference, grade, label, className }: {
  soh: number; reference?: number; grade: Grade; label: string; className?: string
}) {
  const reduce = useReducedMotion()
  const spring = useSpring(soh, SPRING)
  const refSpring = useSpring(reference ?? soh, SPRING)

  const wrap = useRef<HTMLDivElement>(null)
  const needle = useRef<SVGGElement>(null)
  const arc = useRef<SVGPathElement>(null)
  const mark = useRef<SVGGElement>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const svg = useRef<SVGSVGElement>(null)

  const paint = useCallback(() => {
    const v = clampSoh(spring.get())
    if (wrap.current) wrap.current.style.color = gaugeColor(v)
    needle.current?.setAttribute('transform', `rotate(${f(sohToAngle(v))} ${C} ${C})`)
    if (arc.current) arc.current.style.strokeDasharray = `${(v / 100).toFixed(4)} 1`
    if (readout.current) readout.current.textContent = `${v.toFixed(1)}%`
    mark.current?.setAttribute('transform', `rotate(${f(sohToAngle(refSpring.get()))} ${C} ${C})`)
    svg.current?.querySelectorAll<SVGPathElement>('[data-band]').forEach((el) => {
      const from = +el.dataset.from!, to = +el.dataset.to!
      el.style.opacity = v >= from && (v < to || to === 100) ? '1' : '0.38'
    })
  }, [spring, refSpring])

  useEffect(() => { if (reduce) spring.jump(soh); else spring.set(soh) }, [soh, reduce, spring])
  useEffect(() => {
    const a = reference ?? soh
    if (reduce) refSpring.jump(a); else refSpring.set(a)
  }, [reference, soh, reduce, refSpring])
  useLayoutEffect(() => { paint() }, [paint])
  useMotionValueEvent(spring, 'change', paint)
  useMotionValueEvent(refSpring, 'change', paint)

  const shown = clampSoh(soh)
  return (
    <div ref={wrap} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={+shown.toFixed(1)}
      aria-valuetext={`${shown.toFixed(1)} percent, Grade ${grade}`}
      className={cn('relative mx-auto aspect-square w-full max-w-[22rem] [container-type:inline-size]', className)}>
      <svg ref={svg} viewBox="0 0 360 360" className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="rg-needle" gradientUnits="userSpaceOnUse" x1={C} y1={C} x2={C} y2={NEEDLE_TIP}>
            <stop offset="0" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="0.62" stopColor="currentColor" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <radialGradient id="rg-hub" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor="currentColor" /><stop offset="1" stopColor="#0B0F17" />
          </radialGradient>
        </defs>

        {/* grade bands — the certificate's own cut-offs, lit when the needle is inside */}
        {BANDS.map((b) => (
          <path key={b.grade} d={b.d} data-band data-from={b.from} data-to={b.to} fill="none" stroke={gaugeColor(b.mid)}
            strokeWidth="5" strokeLinecap="butt" style={{ transition: 'opacity 0.35s ease' }} />
        ))}
        {BANDS.filter((b) => b.grade !== 'D').map((b) => {
          const p = polar(C, C, R_LABEL, sohToAngle(b.mid))
          return <text key={b.grade} x={f(p.x)} y={f(p.y)} textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)"
            fontSize="12" fontWeight="600" fill="#94a3b8" letterSpacing="1">{b.grade}</text>
        })}
        {(() => { const p = polar(C, C, R_LABEL, sohToAngle(55)); return (
          <text x={f(p.x)} y={f(p.y)} textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)" fontSize="12" fontWeight="600" fill="#94a3b8">D</text>
        ) })()}

        {/* track, then the lit arc */}
        <path d={TRACK} fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="16" strokeLinecap="round" />
        <path ref={arc} data-gauge="arc" d={TRACK} pathLength={1} fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round"
          style={{ strokeDasharray: '0 1', filter: 'drop-shadow(0 0 6px currentColor) drop-shadow(0 0 14px currentColor)' }} />

        {/* ticks and numerals */}
        {TICKS.map((t) => (
          <line key={t.v} x1={f(t.p0.x)} y1={f(t.p0.y)} x2={f(t.p1.x)} y2={f(t.p1.y)} stroke={t.major ? '#cbd5e1' : '#475569'}
            strokeWidth={t.major ? 2 : 1} strokeLinecap="round" />
        ))}
        {TICKS.filter((t) => t.major).map((t) => (
          <text key={t.v} x={f(t.num.x)} y={f(t.num.y)} textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-mono)"
            fontSize="10" fill="#94a3b8">{t.v}</text>
        ))}

        {/* Car A reference diamond, riding the band ring */}
        <g ref={mark} data-gauge="reference">
          <path d={`M ${C} ${C - R_BAND - 8} L ${C + 7} ${C - R_BAND} L ${C} ${C - R_BAND + 8} L ${C - 7} ${C - R_BAND} Z`}
            fill="#ffffff" stroke="#0B0F17" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />
        </g>

        {/* the glowing pointer */}
        <g ref={needle} data-gauge="needle" style={{ filter: 'drop-shadow(0 0 4px currentColor) drop-shadow(0 0 11px currentColor)' }}>
          <path d={`M ${C - 5} ${C} L ${C} ${NEEDLE_TIP} L ${C + 5} ${C} Z`} fill="url(#rg-needle)" />
          <circle cx={C} cy={C + 16} r="4" fill="currentColor" opacity="0.8" />
        </g>
        <circle cx={C} cy={C} r="13" fill="#0B0F17" stroke="currentColor" strokeWidth="2" />
        <circle cx={C} cy={C} r="7" fill="url(#rg-hub)" />
      </svg>

      <div className="absolute inset-x-0 bottom-[3%] grid justify-items-center gap-1.5">
        <span ref={readout} data-gauge="readout" className="font-mono leading-none font-semibold tabular-nums"
          style={{ fontSize: 'clamp(1.6rem, 10.5cqw, 2.4rem)', textShadow: '0 0 18px currentColor' }} />
        <Badge variant={grade.toLowerCase() as 'a'}>Grade {grade}</Badge>
      </div>
    </div>
  )
}
