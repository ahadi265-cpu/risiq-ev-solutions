import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { BadgeCheck, MapPin, Gauge, ShieldCheck } from 'lucide-react'
import { Stage, GLASS, GLASS_HOVER } from '@/components/Stage'
import { CountUp } from '@/components/CountUp'
import { EVIDENCE, FIELD_BADGE } from '@/lib/data'
import { useSeen } from '@/lib/useSeen'
import { cn } from '@/lib/utils'

/* How long each case study holds before the strip advances on its own. */
const DWELL = 7000

/** "Real-World Evidence": three anonymised case studies from the Addis Ababa field
 *  programme on an obsidian stage. The strip advances by itself while it is on screen
 *  and motion is allowed, and stops the moment a visitor picks a card. Panels remount
 *  with the CSS entrance, per the project rule. */
export function FieldEvidence() {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const seen = useSeen(ref, 0.3)
  const reduce = useReducedMotion()
  const e = EVIDENCE[i]

  useEffect(() => {
    if (!auto || !seen || reduce) return
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') setI((x) => (x + 1) % EVIDENCE.length)
    }, DWELL)
    return () => clearInterval(t)
  }, [auto, seen, reduce])

  const pick = (n: number) => { setAuto(false); setI(n) }

  return (
    <Stage className="p-4 sm:p-6 lg:p-8">
      <div ref={ref} className="grid gap-5">
        <div role="tablist" aria-label="Addis Ababa fleet benchmarks" className="grid gap-2 sm:grid-cols-3">
          {EVIDENCE.map((x, n) => {
            const on = n === i
            return (
              <button key={x.id} role="tab" type="button" aria-selected={on} onClick={() => pick(n)}
                className={cn('relative min-h-14 cursor-pointer overflow-hidden rounded-xl border px-4 py-3 text-left outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  on ? 'border-teal/50 bg-teal/10 shadow-[0_0_25px_rgba(0,242,254,0.12)]' : 'border-slate-800/80 hover:border-teal/40 hover:bg-slate-800/40')}>
                <span className="block font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground uppercase">{x.make} · case {n + 1}</span>
                <b className="mt-0.5 block text-sm">{x.model} <span className="font-normal text-muted-foreground">· {x.profile}</span></b>
                {on && auto && !reduce && (
                  <span aria-hidden className="ev-progress absolute inset-x-0 bottom-0 h-[3px] bg-teal/70" style={{ animationDuration: `${DWELL}ms` }} />
                )}
              </button>
            )
          })}
        </div>

        <div key={e.id} role="tabpanel" className={cn(GLASS, GLASS_HOVER, 'animate-rise grid gap-6 rounded-2xl p-5 md:p-7 lg:grid-cols-2 lg:gap-8')}>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-grade-a/40 bg-grade-a/10 px-3 py-1 font-mono text-[0.66rem] font-semibold tracking-wider text-grade-a uppercase">
              <BadgeCheck className="size-3.5 shrink-0" />{FIELD_BADGE}
            </span>
            <span className="mt-3 block font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">{e.make} {e.model} · {e.profile}</span>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{e.headline}</h3>
            <p className="mt-4 max-w-[58ch] text-sm text-muted-foreground md:text-[0.95rem]">{e.body}</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/10 px-3 py-2 text-xs font-medium text-teal">
              <Gauge className="size-4 shrink-0" />{e.method}
            </span>
          </div>
          <div className="grid content-start gap-3 sm:grid-cols-2">
            {e.stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                <span className="flex items-baseline gap-1.5 font-mono text-3xl font-semibold text-teal md:text-[2.1rem]">
                  <CountUp to={s.n} decimals={s.decimals ?? 0} duration={1300} />
                  <span className="text-sm text-muted-foreground">{s.unit}</span>
                </span>
                <span className="mt-1.5 block text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
            <p className="text-[0.68rem] leading-snug text-muted-foreground sm:col-span-2">{e.footnote}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-amber/30 bg-amber/10 p-4 md:p-5">
          <MapPin className="mt-0.5 size-5 shrink-0 text-amber" />
          <p className="text-sm leading-snug md:text-[0.95rem]">
            <b className="text-foreground">Tested on Addis Ababa asphalt, not on a European test bench.</b>{' '}
            <span className="text-muted-foreground">RISIQ’s socket-level measurement and calibrated diagnostics deliver verified results on modern Chinese imported EVs, independent of OEM software encryption — without voiding warranties or opening battery casings.</span>
          </p>
        </div>
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-teal" />
          Anonymised results from the October 2026 Addis Ababa field programme. Vehicle identities and owners are never published, and method details stay off the page by design.
        </p>
      </div>
    </Stage>
  )
}
