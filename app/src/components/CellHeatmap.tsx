import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { clamp, hashStr, mulberry32 } from '@/lib/data'

/* one hue, light→dark; validated for monotone lightness and light-end contrast */
export const RAMP = ['#3cc4ae', '#1eab97', '#12897c', '#0d6b61', '#084f47']
export const COLS = 12, ROWS = 8, CELLS = COLS * ROWS

/** Cells diverge as a pack ages, so spread widens as health falls. Values derive
 *  from the id, so one certificate always draws the same map. */
export function cellMap(id: string, soh: number) {
  const rnd = mulberry32(hashStr(id))
  const spread = 1.1 + (100 - soh) * 0.13
  return Array.from({ length: CELLS }, () =>
    clamp(soh + (rnd() + rnd() + rnd() - 1.5) * spread, 35, 100))
}

/** 96-cell state-of-health map with hover tooltips and click-to-pin. */
export function CellHeatmap({ id, soh, className }: { id: string; soh: number; className?: string }) {
  const cells = useMemo(() => cellMap(id, soh), [id, soh])
  const lo = Math.min(...cells), hi = Math.max(...cells)
  const weakest = cells.indexOf(lo)
  const [sel, setSel] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const idx = (v: number) => clamp(Math.floor(((v - lo) / (hi - lo || 1)) * RAMP.length), 0, RAMP.length - 1)
  const focus = hover ?? sel

  return (
    <div className={cn('grid gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">Cell-level degradation</span>
        <span className="flex items-center gap-1">
          <small className="font-mono text-xs text-muted-foreground">{lo.toFixed(0)}%</small>
          {RAMP.map((c) => <i key={c} className="block h-2.5 w-5" style={{ background: c }} />)}
          <small className="font-mono text-xs text-muted-foreground">{hi.toFixed(0)}%</small>
        </span>
      </div>
      <div className="grid grid-cols-12 gap-1" role="img" onPointerLeave={() => setHover(null)}
        aria-label={`${CELLS} cells span ${lo.toFixed(1)}% to ${hi.toFixed(1)}% state of health.`}>
        {cells.map((v, i) => (
          <motion.button key={i} type="button"
            onClick={() => setSel(sel === i ? null : i)} onPointerEnter={() => setHover(i)}
            whileHover={{ scale: 1.22, zIndex: 2 }}
            className={cn('group relative aspect-square cursor-pointer rounded-[3px]',
              i === weakest && 'ring-2 ring-amber', sel === i && 'ring-2 ring-foreground')}
            style={{ background: RAMP[idx(v)] }}
            aria-label={`Cell ${i + 1}, ${v.toFixed(1)} percent`}>
            {/* hover tooltip; pointer-events off so it never steals the hover */}
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-md border bg-popover px-2 py-1 font-mono text-[0.68rem] whitespace-nowrap text-popover-foreground shadow-md group-hover:block">
              Cell {i + 1} · {v.toFixed(1)}%
            </span>
          </motion.button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {focus !== null
          ? <><b className="text-foreground">Cell {focus + 1}</b> — {cells[focus].toFixed(1)}% of nominal, module {Math.floor(focus / COLS) + 1} of {ROWS}{focus === weakest && ', the weakest in the pack'}.</>
          : <><b className="text-foreground">Weakest cell {weakest + 1}</b> at {lo.toFixed(1)}%, {(soh - lo).toFixed(1)} pp below pack average. Hover any cell to inspect it; click to pin.</>}
      </p>
    </div>
  )
}
