import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { clamp, hashStr, mulberry32 } from '@/lib/data'

export const COLS = 12, ROWS = 8, CELLS = COLS * ROWS

/** Cell status uses the same A–D thresholds the certificate grades on, so the
 *  map reads the way the rest of the site reads: emerald healthy, teal normal,
 *  amber degraded, red below the warranty floor. */
type Tone = { key: 'a' | 'b' | 'c' | 'd'; label: string; fill: string; glow: string }
export const TONES: Tone[] = [
  { key: 'a', label: 'Healthy', fill: 'var(--grade-a)', glow: 'color-mix(in oklch, var(--grade-a) 70%, transparent)' },
  { key: 'b', label: 'Normal wear', fill: 'var(--grade-b)', glow: 'color-mix(in oklch, var(--grade-b) 70%, transparent)' },
  { key: 'c', label: 'Degraded', fill: 'var(--grade-c)', glow: 'color-mix(in oklch, var(--grade-c) 80%, transparent)' },
  { key: 'd', label: 'Below the floor', fill: 'var(--grade-d)', glow: 'color-mix(in oklch, var(--grade-d) 85%, transparent)' },
]
const toneOf = (v: number) => (v >= 92 ? TONES[0] : v >= 85 ? TONES[1] : v >= 78 ? TONES[2] : TONES[3])

/** Cells diverge as a pack ages, so spread widens as health falls. Values derive
 *  from the id, so one certificate always draws the same map. */
export function cellMap(id: string, soh: number) {
  const rnd = mulberry32(hashStr(id))
  const spread = 1.1 + (100 - soh) * 0.13
  return Array.from({ length: CELLS }, () =>
    clamp(soh + (rnd() + rnd() + rnd() - 1.5) * spread, 35, 100))
}

/** 96-cell state-of-health map: hover to inspect, click to pin. Degraded cells
 *  and the weakest cell pulse so the eye lands on them first. A single
 *  tooltip springs from cell to cell rather than each of the 96 buttons
 *  carrying its own — it snaps to wherever the pointer lands, which both
 *  reads as more alive and is 95 fewer floating DOM nodes at rest. */
export function CellHeatmap({ id, soh, className }: { id: string; soh: number; className?: string }) {
  const cells = useMemo(() => cellMap(id, soh), [id, soh])
  const lo = Math.min(...cells), hi = Math.max(...cells)
  const weakest = cells.indexOf(lo)
  const [sel, setSel] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const focus = hover ?? sel
  const flagged = cells.filter((v) => v < 85).length
  /* relative position inside this pack's own spread, so a healthy pack still shows texture */
  const mix = (v: number) => 52 + Math.round(clamp((v - lo) / (hi - lo || 1), 0, 1) * 48)
  /* Only outliers pulse. On a degraded pack every cell is below the floor, and
     pulsing all 96 strobes instead of pointing anywhere. */
  const pulsing = useMemo(() => {
    const weak = cells
      .map((v, i) => ({ v, i }))
      .filter((c) => c.v < soh - 1.5)
      .sort((a, b) => a.v - b.v)
      .slice(0, 6)
      .map((c) => c.i)
    return new Set([...weak, weakest])
  }, [cells, soh, weakest])

  // the floating tooltip's target position, in pixels relative to the grid
  // container — a snappy spring, so it visibly leaps and settles onto each
  // cell rather than teleporting or gliding evenly like a plain transition.
  const gridRef = useRef<HTMLDivElement>(null)
  const tipX = useMotionValue(0)
  const tipY = useMotionValue(0)
  const springX = useSpring(tipX, { stiffness: 520, damping: 30, mass: 0.5 })
  const springY = useSpring(tipY, { stiffness: 520, damping: 30, mass: 0.5 })

  const trackTooltip = (i: number, el: HTMLButtonElement) => {
    const grid = gridRef.current
    if (grid) {
      tipX.set(el.offsetLeft + el.offsetWidth / 2)
      tipY.set(el.offsetTop)
    }
    setHover(i)
  }

  return (
    <div className={cn('grid gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">Cell-level degradation</span>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {TONES.map((t) => (
            <li key={t.key} className="flex items-center gap-1.5 font-mono text-[0.62rem] text-muted-foreground">
              <i className="block size-2.5 rounded-[2px]" style={{ background: t.fill, boxShadow: `0 0 6px ${t.glow}` }} />{t.label}
            </li>
          ))}
        </ul>
      </div>

      <div ref={gridRef} className="relative grid grid-cols-12 gap-1 rounded-xl border bg-[color-mix(in_oklch,var(--ink)_6%,transparent)] p-2" role="img"
        onPointerLeave={() => setHover(null)}
        aria-label={`${CELLS} cells span ${lo.toFixed(1)}% to ${hi.toFixed(1)}% state of health. ${flagged} cells below 85%.`}>
        {cells.map((v, i) => {
          const t = toneOf(v)
          const alert = pulsing.has(i)
          return (
            <motion.button key={i} type="button"
              onClick={(e) => { setSel(sel === i ? null : i); trackTooltip(i, e.currentTarget) }}
              onPointerEnter={(e) => trackTooltip(i, e.currentTarget)} onFocus={(e) => trackTooltip(i, e.currentTarget)}
              whileHover={{ scale: 1.35, zIndex: 3 }} whileTap={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              className={cn('group relative aspect-square cursor-pointer rounded-[3px] outline-none',
                alert && 'cell-pulse', sel === i && 'ring-2 ring-foreground', i === weakest && 'ring-2 ring-offset-1 ring-grade-d ring-offset-transparent',
                'focus-visible:ring-2 focus-visible:ring-foreground')}
              style={{ background: `color-mix(in oklch, ${t.fill} ${mix(v)}%, var(--card))`, '--cell-glow': t.glow } as CSSProperties}
              aria-label={`Cell ${i + 1}, ${v.toFixed(1)} percent, ${t.label}`} />
          )
        })}

        {/* the single magnetic tooltip — springs to whichever cell is hovered/focused */}
        <AnimatePresence>
          {focus !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              style={{ x: springX, y: springY, translateX: '-50%', translateY: 'calc(-100% - 8px)' }}
              className="pointer-events-none absolute top-0 left-0 z-10 grid origin-bottom gap-0.5 rounded-lg border bg-popover px-2.5 py-1.5 whitespace-nowrap text-popover-foreground shadow-xl">
              <b className="font-mono text-[0.7rem] tabular">{cells[focus].toFixed(1)}%</b>
              <small className="font-mono text-[0.58rem] tracking-wider text-muted-foreground uppercase">Cell {focus + 1} · {toneOf(cells[focus]).label}</small>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        {flagged > 0 && <AlertTriangle className="mt-0.5 size-4 shrink-0 text-grade-c" />}
        {focus !== null
          ? <span><b className="text-foreground">Cell {focus + 1}</b> — {cells[focus].toFixed(1)}% of nominal, {toneOf(cells[focus]).label.toLowerCase()}, module {Math.floor(focus / COLS) + 1} of {ROWS}{focus === weakest && ', the weakest in the pack'}.</span>
          : <span><b className="text-foreground">Weakest cell {weakest + 1}</b> at {lo.toFixed(1)}%, {(soh - lo).toFixed(1)} pp below pack average{flagged > 0 && `; ${flagged} of ${CELLS} cells sit below 85%`}. Hover any cell to inspect it; click to pin.</span>}
      </p>
    </div>
  )
}
