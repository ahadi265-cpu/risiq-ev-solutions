/** Geometry and colour for the battery collateral-risk gauge. Pure, so the
 *  needle, the arc and the colour ramp can be tested without a browser. */
import type { Grade } from '@/lib/data'

/** 270° sweep, opening at the bottom. Angles are degrees from 12 o'clock, clockwise positive. */
export const GAUGE_SWEEP = 270
export const GAUGE_START = -135

export const clampSoh = (v: number) => (Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0)
export const sohToAngle = (soh: number) => GAUGE_START + (clampSoh(soh) / 100) * GAUGE_SWEEP

export type Point = { x: number; y: number }
export function polar(cx: number, cy: number, r: number, deg: number): Point {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

const f = (n: number) => +n.toFixed(2)
/** SVG arc along the gauge between two SoH values. */
export function arcPath(cx: number, cy: number, r: number, fromSoh: number, toSoh: number): string {
  const a0 = sohToAngle(fromSoh), a1 = sohToAngle(toSoh)
  const p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1)
  return `M ${f(p0.x)} ${f(p0.y)} A ${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${f(p1.x)} ${f(p1.y)}`
}

/* Colour is a continuous risk signal, not a grade: emerald from 90 % up, amber at 80 %, red from
   75 % down, blended linearly between. The grade cut-offs (92 / 85 / 78) stay the certificate's own
   and are drawn as bands on the dial, so the two are never confused. */
export type Rgb = readonly [number, number, number]
export const GAUGE_STOPS: readonly { soh: number; rgb: Rgb }[] = [
  { soh: 75, rgb: [239, 68, 68] },   // critical red   #EF4444
  { soh: 80, rgb: [245, 158, 11] },  // warning amber  #F59E0B
  { soh: 90, rgb: [16, 185, 129] },  // emerald        #10B981
]

export function gaugeRgb(soh: number): Rgb {
  const s = clampSoh(soh)
  const first = GAUGE_STOPS[0], last = GAUGE_STOPS[GAUGE_STOPS.length - 1]
  if (s <= first.soh) return first.rgb
  if (s >= last.soh) return last.rgb
  for (let i = 1; i < GAUGE_STOPS.length; i++) {
    const lo = GAUGE_STOPS[i - 1], hi = GAUGE_STOPS[i]
    if (s <= hi.soh) {
      const t = (s - lo.soh) / (hi.soh - lo.soh)
      return [0, 1, 2].map((k) => Math.round(lo.rgb[k] + (hi.rgb[k] - lo.rgb[k]) * t)) as unknown as Rgb
    }
  }
  return last.rgb
}
export const gaugeColor = (soh: number) => { const [r, g, b] = gaugeRgb(soh); return `rgb(${r} ${g} ${b})` }

/** The certificate's grade scale, as dial bands. Must agree with `gradeOf` in data.ts. */
export const GRADE_BANDS: readonly { grade: Grade; from: number; to: number }[] = [
  { grade: 'D', from: 0, to: 78 },
  { grade: 'C', from: 78, to: 85 },
  { grade: 'B', from: 85, to: 92 },
  { grade: 'A', from: 92, to: 100 },
]
