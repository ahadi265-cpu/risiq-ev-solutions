import { cn } from '@/lib/utils'
import type { Benchmark as Level } from '@/lib/data'

const SEGMENTS = ['bg-grade-d', 'bg-grade-c', 'bg-muted-foreground/40', 'bg-grade-b', 'bg-grade-a']
const POS: Record<Level, number> = { below: 1, average: 2, above: 4 }
const LABEL: Record<Level, string> = { below: 'Below average', average: 'Average', above: 'Above average' }

/** Where this pack sits against comparable cars in the RISIQ calibrated
 *  database — the scale a buyer reads before any number. */
export function Benchmark({ level, vehicle, className, compact = false }: {
  level: Level; vehicle: string; className?: string; compact?: boolean
}) {
  const pos = POS[level]
  return (
    <div className={cn('grid gap-1.5', className)} role="img"
      aria-label={`${LABEL[level]} for ${vehicle} in the RISIQ calibrated database`}>
      <div className={cn('flex items-baseline justify-between gap-3', compact ? 'text-[0.62rem]' : 'text-xs')}>
        <span className="font-mono tracking-[0.14em] text-muted-foreground uppercase">Fleet benchmark</span>
        <span className={cn('font-semibold', level === 'above' ? 'text-grade-a' : level === 'average' ? 'text-foreground' : 'text-grade-c')}>{LABEL[level]}</span>
      </div>
      <div className="relative grid grid-cols-5 gap-1">
        {SEGMENTS.map((c, i) => (
          <span key={c} className={cn('h-1.5 rounded-full transition-opacity', c, i === pos ? 'opacity-100' : 'opacity-30')} />
        ))}
        <span aria-hidden className="absolute -top-1 size-3.5 -translate-x-1/2 rounded-full border-2 border-card bg-foreground shadow"
          style={{ left: `${(pos + 0.5) * 20}%` }} />
      </div>
      <span className={cn('text-muted-foreground', compact ? 'text-[0.58rem]' : 'text-xs')}>
        vs. other {vehicle} packs in the RISIQ calibrated database
      </span>
    </div>
  )
}
