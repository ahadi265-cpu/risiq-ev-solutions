import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, PlugZap, BatteryCharging, Cpu, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GRADES } from '@/lib/data'
import { cn } from '@/lib/utils'

type Car = {
  id: string; brand: string; model: string; seg: string
  kwh: number; range: number; cycle: string
  img: string; credit: { author: string; license: string; url: string }
  obd: string
  markers?: { x: number; y: number }[]
}

/* Rated figures are the manufacturer's published values for the pack sizes
   common in Addis; RISIQ measures the real number. Photos are CC-licensed
   Wikimedia Commons images with the background removed. */
const CARS: Car[] = [
  { id: 'atto3', brand: 'BYD', model: 'Atto 3', seg: 'Compact SUV · the most common EV in Addis', kwh: 60.5, range: 420, cycle: 'rated',
    img: 'img/cars/atto3.webp', credit: { author: 'Hubert Berberich (HubiB)', license: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0' },
    obd: 'Diagnostics locked to the manufacturer’s tool',
    markers: [{ x: 12, y: 46 }, { x: 50, y: 56 }, { x: 33, y: 30 }] },
  { id: 'dolphin', brand: 'BYD', model: 'Dolphin', seg: 'Hatchback · taxi and commuter favourite', kwh: 44.9, range: 405, cycle: 'rated',
    img: 'img/cars/dolphin.webp', credit: { author: 'MoCars', license: 'CC0', url: 'https://creativecommons.org/publicdomain/zero/1.0' },
    obd: 'Diagnostics locked to the manufacturer’s tool' },
  { id: 'deepal', brand: 'Changan', model: 'Deepal S07', seg: 'Mid-size SUV · newer import', kwh: 68.8, range: 520, cycle: 'CLTC',
    img: 'img/cars/deepal.webp', credit: { author: 'Sulthan Naufal', license: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0' },
    obd: 'Encrypted BMS channel on most trims' },
  { id: 'jetour', brand: 'Jetour', model: 'Ice Cream EV', seg: 'City car · long-range pack', kwh: 13.9, range: 170, cycle: 'rated',
    img: 'img/cars/jetour.webp', credit: { author: 'Quzhouliulian', license: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0' },
    obd: 'Proprietary protocol · no public PIDs' },
]

const LEGEND = [
  { icon: PlugZap, t: 'We plug in at the charge port', d: 'Nothing is fitted to the car.' },
  { icon: BatteryCharging, t: 'The pack under the floor', d: 'Roughly half of what the car is worth.' },
  { icon: Cpu, t: 'BMS — read where the car allows', d: 'Always cross-checked against our database.' },
]

type Mode = 'obd' | 'socket'

/** EV selector for the locked imports on Ethiopian roads: pick a model, see
 *  what a plain OBD reader gets versus RISIQ metering at the charging socket. */
export function BydFocus() {
  const [carId, setCarId] = useState(CARS[0].id)
  const [mode, setMode] = useState<Mode>('socket')
  const car = CARS.find((c) => c.id === carId)!

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <figure>
        {/* model selector */}
        <div role="tablist" aria-label="Choose a vehicle" className="mb-4 flex flex-wrap gap-2">
          {CARS.map((c) => (
            <button key={c.id} role="tab" type="button" aria-selected={c.id === carId} onClick={() => setCarId(c.id)}
              className={cn('cursor-pointer rounded-full border px-4 py-2 text-sm font-medium outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50',
                c.id === carId ? 'border-brand bg-brand text-white shadow-sm' : 'bg-card text-muted-foreground hover:border-brand hover:text-foreground')}>
              <span className="font-mono text-[0.66rem] tracking-wider uppercase opacity-80">{c.brand}</span> {c.model}
            </button>
          ))}
        </div>

        <div className="bg-grid relative overflow-hidden rounded-3xl border bg-[radial-gradient(70%_60%_at_50%_100%,oklch(0.62_0.21_29/0.14),transparent_70%)] px-6 pt-8 pb-6 md:px-12 md:pt-10 md:pb-8">
          {/* keyed remount + CSS entrance when the model changes */}
          <div key={car.id} className="animate-rise relative z-10 h-[240px] md:h-[320px]">
            {/* absolute + object-contain: an auto grid row would grow to the photo's intrinsic height */}
            <img src={car.img} alt={`${car.brand} ${car.model}`} loading="lazy" data-parallax="-3"
              className="absolute inset-0 size-full object-contain drop-shadow-[0_28px_36px_rgba(0,0,0,0.28)]" />
          </div>
          {car.markers?.map(({ x, y }, i) => (
            <span key={i} className="absolute z-20 hidden size-7 -translate-x-1/2 -translate-y-1/2 place-items-center md:grid" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden>
              <span className="absolute inset-0 rounded-full bg-brand opacity-50 motion-safe:animate-ping" />
              <span className="relative grid size-6 place-items-center rounded-full border-2 border-white bg-brand font-mono text-[0.7rem] font-bold text-white shadow">{i + 1}</span>
            </span>
          ))}
          <ol className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
            {LEGEND.map(({ icon: Icon, t, d }, i) => (
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
          {car.brand} {car.model}. Photo: {car.credit.author},{' '}
          <a className="underline underline-offset-2 hover:text-brand" href={car.credit.url} target="_blank" rel="noopener noreferrer">{car.credit.license}</a>, via Wikimedia Commons; background removed.
        </figcaption>
      </figure>

      <div key={car.id} className="animate-rise">
        <span className="font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">{car.brand} {car.model}</span>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{car.seg}</h3>
        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border">
          <div className="bg-card p-4"><dt className="text-xs text-muted-foreground">Battery pack</dt><dd className="mt-1 font-mono text-xl font-semibold tabular">{car.kwh} kWh</dd></div>
          <div className="bg-card p-4"><dt className="text-xs text-muted-foreground">Range, {car.cycle}</dt><dd className="mt-1 font-mono text-xl font-semibold tabular">{car.range} km</dd></div>
        </dl>

        {/* OBD vs socket — what each method gets on this car */}
        <div role="tablist" aria-label="Port access on this model" className="mt-6 grid grid-cols-2 gap-1 rounded-full border bg-muted p-1">
          {([['obd', 'OBD port'], ['socket', 'RISIQ socket metering']] as [Mode, string][]).map(([k, label]) => (
            <button key={k} role="tab" type="button" aria-selected={mode === k} onClick={() => setMode(k)}
              className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50',
                mode === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {k === 'obd' ? <Lock className="size-3.5 text-amber" /> : <Check className="size-3.5 text-teal" strokeWidth={3} />}{label}
            </button>
          ))}
        </div>
        <div key={mode} className={cn('animate-rise mt-3 rounded-2xl border p-5', mode === 'obd' ? 'border-amber/30 bg-amber/6' : 'border-teal/30 bg-teal/6')}>
          {mode === 'obd' ? (
            <>
              <span className="font-mono text-[0.66rem] tracking-[0.14em] text-amber uppercase">Access denied · BMS encrypted</span>
              <p className="mt-2 text-sm"><b>{car.obd}.</b> A plain reader gets nothing or the car’s own estimate. Where the BMS does answer, RISIQ records it and cross-checks it against our calibrated database — it never becomes the verdict on its own.</p>
            </>
          ) : (
            <>
              <span className="font-mono text-[0.66rem] tracking-[0.14em] text-teal uppercase">100% direct electrical energy signal captured</span>
              <p className="mt-2 text-sm"><b>We meter the energy the {car.model} actually accepts at its charging socket.</b> Nothing is asked of the car, so nothing can be locked, encrypted or optimistic — and that measurement calibrates the BMS reading.</p>
            </>
          )}
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Also certified:</span>
          {['BYD Song Plus', 'BYD Yuan Plus', 'BYD e2', 'any EV that charges'].map((b) => (
            <span key={b} className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground">{b}</span>
          ))}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-brand hover:bg-brand-dark"><Link to="/tools">Model this battery<ArrowRight /></Link></Button>
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
