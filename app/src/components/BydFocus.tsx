import { Link } from 'react-router-dom'
import { Check, ArrowRight, PlugZap, BatteryCharging, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FLEET, GRADES } from '@/lib/data'
import { cn } from '@/lib/utils'

const HOTSPOTS = [
  { icon: PlugZap, x: 12, y: 46, t: 'We plug in at the charge port', d: 'Nothing is fitted to the car.' },
  { icon: BatteryCharging, x: 50, y: 56, t: `${FLEET[0].kwh} kWh pack under the floor`, d: 'Roughly half of what the car is worth.' },
  { icon: Cpu, x: 33, y: 30, t: 'BMS — read where the car allows', d: 'Always cross-checked against our database.' },
]

/** The fleet Ethiopia actually has: BYD first, with the other Chinese imports
 *  alongside. The car is a real Atto 3, cut from a CC BY photograph. */
export function BydFocus() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <figure>
        <div className="bg-grid relative overflow-hidden rounded-3xl border bg-[radial-gradient(70%_60%_at_50%_100%,oklch(0.62_0.21_29/0.14),transparent_70%)] px-6 pt-12 pb-6 md:px-12 md:pt-14 md:pb-8">
          <img src="img/byd-atto3.webp" alt="BYD Atto 3, side view" width={1200} height={460} loading="lazy"
            className="relative z-10 mx-auto w-full max-w-[720px] drop-shadow-[0_28px_36px_rgba(0,0,0,0.28)]" data-parallax="-3" />
          {/* numbered markers on the car; the legend below explains each */}
          {HOTSPOTS.map(({ x, y }, i) => (
            <span key={i} className="absolute z-20 hidden size-7 -translate-x-1/2 -translate-y-1/2 md:grid place-items-center" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden>
              <span className="absolute inset-0 rounded-full bg-brand opacity-50 motion-safe:animate-ping" />
              <span className="relative grid size-6 place-items-center rounded-full border-2 border-white bg-brand font-mono text-[0.7rem] font-bold text-white shadow">{i + 1}</span>
            </span>
          ))}
          <ol className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
            {HOTSPOTS.map(({ icon: Icon, t, d }, i) => (
              <li key={t} className="flex gap-3 rounded-xl border bg-card/90 p-3 backdrop-blur">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand font-mono text-[0.7rem] font-bold text-white">{i + 1}</span>
                <div className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[0.8rem] leading-tight font-semibold"><Icon className="size-3.5 shrink-0 text-brand" />{t}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{d}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <figcaption className="mt-3 text-xs text-muted-foreground">
          BYD Atto 3 — the most common electric car in Addis Ababa. Photo: Hubert Berberich (HubiB),{' '}
          <a className="underline underline-offset-2 hover:text-brand" href="https://creativecommons.org/licenses/by/4.0" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>, via Wikimedia Commons; background removed.
        </figcaption>
      </figure>

      <div>
        <span className="font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">BYD models we certify today</span>
        <ul className="mt-4 divide-y rounded-2xl border bg-card">
          {FLEET.map((f) => (
            <li key={f.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/50">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-grade-a/10 text-grade-a"><Check className="size-4" strokeWidth={3} /></span>
              <div className="min-w-0 flex-1">
                <b className="block text-sm">{f.name}</b>
                <span className="block text-xs text-muted-foreground">{f.seg}</span>
              </div>
              <div className="text-right font-mono text-xs text-muted-foreground tabular">
                <span className="block text-foreground">{f.kwh} kWh</span>
                <span className="block">{f.range} km rated</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Also certified:</span>
          {['Changan', 'Jetour', 'any EV that charges'].map((b) => (
            <span key={b} className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground">{b}</span>
          ))}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild className="bg-brand hover:bg-brand-dark"><Link to="/tools">Model a BYD battery<ArrowRight /></Link></Button>
          <Button asChild variant="outline"><Link to="/pilot">See the ten-BYD pilot</Link></Button>
        </div>
      </div>
    </div>
  )
}

/** Plain-language grade scale, the way Moba asks "is the battery in good condition?" */
export function GradeLegend({ className }: { className?: string }) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {GRADES.map((g) => (
        <li key={g.g} className="flex gap-4 rounded-2xl border bg-card p-4">
          <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl font-mono text-lg font-bold text-white',
            g.g === 'A' && 'bg-grade-a', g.g === 'B' && 'bg-grade-b', g.g === 'C' && 'bg-grade-c', g.g === 'D' && 'bg-grade-d')}>{g.g}</span>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <b className="text-sm">{g.title}</b>
              <span className="font-mono text-xs text-muted-foreground tabular">{g.range}</span>
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{g.meaning}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
