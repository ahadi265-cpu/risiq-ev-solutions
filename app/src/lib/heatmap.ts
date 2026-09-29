import { clamp, hashStr, mulberry32 } from '@/lib/data'

export const COLS = 12, ROWS = 8, CELLS = COLS * ROWS

/** Cell status uses the same A–D thresholds the certificate grades on, so the
 *  map reads the way the rest of the site reads: emerald healthy, teal normal,
 *  amber degraded, red below the warranty floor. */
export type Tone = { key: 'a' | 'b' | 'c' | 'd'; label: string; fill: string; glow: string }
export const TONES: Tone[] = [
  { key: 'a', label: 'Healthy', fill: 'var(--grade-a)', glow: 'color-mix(in oklch, var(--grade-a) 70%, transparent)' },
  { key: 'b', label: 'Normal wear', fill: 'var(--grade-b)', glow: 'color-mix(in oklch, var(--grade-b) 70%, transparent)' },
  { key: 'c', label: 'Degraded', fill: 'var(--grade-c)', glow: 'color-mix(in oklch, var(--grade-c) 80%, transparent)' },
  { key: 'd', label: 'Below the floor', fill: 'var(--grade-d)', glow: 'color-mix(in oklch, var(--grade-d) 85%, transparent)' },
]
export const toneOf = (v: number): Tone => (v >= 92 ? TONES[0] : v >= 85 ? TONES[1] : v >= 78 ? TONES[2] : TONES[3])

/** Cells diverge as a pack ages, so spread widens as health falls. Values derive
 *  from the id, so one certificate always draws the same map. */
export function cellMap(id: string, soh: number): number[] {
  const rnd = mulberry32(hashStr(id))
  const spread = 1.1 + (100 - soh) * 0.13
  return Array.from({ length: CELLS }, () =>
    clamp(soh + (rnd() + rnd() + rnd() - 1.5) * spread, 35, 100))
}

/** Which cells should pulse: the weakest, plus up to `max` more that sit
 *  clearly below the pack average. Bounded on purpose — on a degraded pack
 *  every cell is below the warranty floor, and pulsing all 96 strobes
 *  instead of pointing anywhere. */
export function outlierCells(cells: number[], soh: number, max = 6): Set<number> {
  let weakest = 0
  for (let i = 1; i < cells.length; i++) if (cells[i] < cells[weakest]) weakest = i
  const weak = cells
    .map((v, i) => ({ v, i }))
    .filter((c) => c.v < soh - 1.5)
    .sort((a, b) => a.v - b.v)
    .slice(0, max)
    .map((c) => c.i)
  return new Set([...weak, weakest])
}
