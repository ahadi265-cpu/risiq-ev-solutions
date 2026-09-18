import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Zap, Home, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FLEET, modelSoH, gradeOf, bookFactor, batteryFactor, etb, usd, fmt } from '@/lib/data'
import type { Pt } from '@/components/BlindSpotChart'
import { cn } from '@/lib/utils'

const Chart = lazy(() => import('@/components/BlindSpotChart'))

type HabitId = 'gentle' | 'taxi'
const HABITS: Record<HabitId, { label: string; icon: typeof Zap; fast: number; temp: number; kmPerYear: number; blurb: string }> = {
  gentle: { label: 'Gentle · home AC', icon: Home, fast: 0.05, temp: 18, kmPerYear: 12_000, blurb: 'Charged overnight on a wall box, kept in the shade, easy commuting.' },
  taxi:   { label: 'Taxi · fast DC daily', icon: Zap, fast: 1, temp: 32, kmPerYear: 40_000, blurb: 'Fast-charged to full every day, parked in the sun, driven hard.' },
}

const CAR = FLEET[0] // BYD Atto 3
const KM_PER_CYCLE = CAR.range * 0.8
/* what a buyer infers from the odometer alone — a flat, habit-blind rule of thumb */
const guess = (km: number) => 100 - (km / 100_000) * 6
const sohAt = (km: number, h: HabitId) => {
  const H = HABITS[h]
  return modelSoH(km / H.kmPerYear, km / KM_PER_CYCLE, H.temp, H.fast).soh
}

/** The site's core argument, made explorable: same odometer, two lives, and a
 *  measurement that tells them apart when the mileage cannot. Uses the same
 *  battery model as the certificate; the odometer line is a rule of thumb. */
export function BlindSpotExplorer() {
  const [km, setKm] = useState(50_000)
  const [habit, setHabit] = useState<HabitId>('taxi')

  const data = useMemo<Pt[]>(() => Array.from({ length: 21 }, (_, i) => {
    const k = i * 5_000
    return { km: k, guess: +guess(k).toFixed(1), gentle: +sohAt(k, 'gentle').toFixed(1), taxi: +sohAt(k, 'taxi').toFixed(1) }
  }), [])

  const soh = sohAt(km, habit), other = sohAt(km, habit === 'taxi' ? 'gentle' : 'taxi')
  const grade = gradeOf(soh)
  const book = CAR.price * bookFactor(km / HABITS[habit].kmPerYear, km)
  const gapValue = book * (batteryFactor(sohAt(km, 'gentle')) - batteryFactor(sohAt(km, 'taxi')))
  const H = HABITS[habit]

  return (
    <div className="grid gap-6 rounded-3xl border bg-card p-6 shadow-sm md:p-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="grid content-start gap-7">
        <div className="grid gap-2.5">
          <div className="flex items-baseline justify-between gap-4">
            <Label>Odometer</Label>
            <output className="font-mono text-sm text-teal tabular">{fmt(km)} km</output>
          </div>
          <Slider value={[km]} min={0} max={100_000} step={1_000} onValueChange={([v]: number[]) => setKm(v)} aria-label="Odometer" />
          <p className="text-xs text-muted-foreground">Both cars below show exactly this number on the dash.</p>
        </div>

        <div>
          <Label>Charging habits</Label>
          <div role="tablist" aria-label="Charging habits" className="mt-2.5 grid grid-cols-2 gap-1 rounded-full border bg-muted p-1">
            {(Object.keys(HABITS) as HabitId[]).map((k) => {
              const Icon = HABITS[k].icon
              return (
                <button key={k} role="tab" type="button" aria-selected={habit === k} onClick={() => setHabit(k)}
                  className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    habit === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon className={cn('size-3.5', k === 'taxi' ? 'text-teal' : 'text-grade-a')} />{HABITS[k].label}
                </button>
              )
            })}
          </div>
          <p key={habit} className="animate-rise mt-2.5 text-xs text-muted-foreground">{H.blurb}</p>
        </div>

        <div key={`${habit}-${km}`} className="grid gap-px overflow-hidden rounded-2xl border bg-border">
          <div className="bg-card p-4">
            <span className="block text-xs text-muted-foreground">Socket-measured state of health · {CAR.name}</span>
            <div className="mt-1 flex items-baseline gap-3">
              <b className="font-mono text-4xl font-semibold tabular">{soh.toFixed(1)}%</b>
              <Badge variant={grade.toLowerCase() as 'a'}>Grade {grade}</Badge>
            </div>
            <span className="mt-1 block text-xs text-muted-foreground">
              Odometer alone implies {guess(km).toFixed(1)}%. The other car at the same mileage measures {other.toFixed(1)}%.
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border">
            <div className="bg-card p-4">
              <span className="block text-xs text-muted-foreground">Usable capacity</span>
              <b className="mt-1 block font-mono text-lg tabular">{(CAR.kwh * soh / 100).toFixed(1)} kWh</b>
              <small className="text-xs text-muted-foreground">of {CAR.kwh} kWh new</small>
            </div>
            <div className="bg-card p-4">
              <span className="block text-xs text-muted-foreground">Value gap the dash hides</span>
              <b className="mt-1 block font-mono text-lg text-primary tabular">{etb(Math.abs(gapValue))}</b>
              <small className="text-xs text-muted-foreground">≈ {usd(Math.abs(gapValue))} between the two cars</small>
            </div>
          </div>
        </div>
      </div>

      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">State of health vs. odometer</span>
          <span className="text-xs text-muted-foreground">Same mileage, two lives — and what the odometer implies</span>
        </div>
        <div className="h-[320px] w-full">
          {/* the chart chunk loads only once this panel scrolls into view */}
          <Suspense fallback={<div className="size-full animate-pulse rounded-2xl bg-muted" />}>
            <ChartWhenVisible data={data} km={km} soh={soh} habit={habit} />
          </Suspense>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Both measured curves use the battery model behind the certificate for a {CAR.name}; the odometer line is a flat rule of thumb, shown to illustrate what a buyer sees. Indicative — a certificate replaces this with a measurement.
        </p>
        <Button asChild variant="outline" className="w-fit"><Link to="/tools">Open the full calculator<ArrowRight /></Link></Button>
      </div>
    </div>
  )
}

/** Mounts the lazy chart once its slot approaches the viewport, then keeps it. */
function ChartWhenVisible(props: { data: Pt[]; km: number; soh: number; habit: HabitId }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight + 200 && r.bottom > 0) { setSeen(true); return }
    if (!('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: '200px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  if (!seen) return <div ref={ref} className="size-full" />
  return <Chart {...props} />
}
