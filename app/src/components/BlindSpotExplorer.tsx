import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Zap, Home, ArrowRight, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FLEET, modelSoH, gradeOf, bookFactor, batteryFactor, etb, usd, fmt } from '@/lib/data'
import type { Pt } from '@/components/BlindSpotChart'
import { cn } from '@/lib/utils'

const Chart = lazy(() => import('@/components/BlindSpotChart'))

type Life = { fast: number; temp: number; years: number }
type PresetId = 'gentle' | 'taxi'
const PRESETS: Record<PresetId, Life & { label: string; icon: typeof Zap; blurb: string }> = {
  gentle: { label: 'Car A · gentle commuting', icon: Home, fast: 5, temp: 18, years: 4, blurb: 'Charged overnight on a wall box, kept in the shade, easy commuting.' },
  taxi:   { label: 'Car B · taxi, fast-charged in heat', icon: Zap, fast: 100, temp: 32, years: 4, blurb: 'Fast-charged to full every day, parked in the sun, driven hard.' },
}
const CAR_A: Life = PRESETS.gentle

const CAR = FLEET[0] // BYD Atto 3
const KM_PER_CYCLE = CAR.range * 0.8
const KM_MAX = 150_000
/* what a buyer infers from the odometer alone — a flat, habit-blind rule of thumb */
const guess = (km: number) => 100 - (km / 100_000) * 6
/* state of health after `km` for a car living `life`; km→years scales with the marker's own pace */
const sohAt = (km: number, life: Life, kmPerYear: number) =>
  modelSoH(km / kmPerYear, km / KM_PER_CYCLE, life.temp, life.fast / 100).soh

/** The site's core argument, made explorable: Car A lives gently, Car B is the
 *  taxi you configure. Same odometer, two lives — and a measurement that tells
 *  them apart when the mileage cannot. Same battery model as the certificate. */
export function BlindSpotExplorer() {
  const [km, setKm] = useState(60_000)
  const [b, setB] = useState<Life>({ fast: PRESETS.taxi.fast, temp: PRESETS.taxi.temp, years: PRESETS.taxi.years })
  const preset = (Object.keys(PRESETS) as PresetId[]).find((k) => PRESETS[k].fast === b.fast && PRESETS[k].temp === b.temp && PRESETS[k].years === b.years)
  const set = (patch: Partial<Life>) => setB((v) => ({ ...v, ...patch }))

  const kmPerYear = Math.max(4_000, km / Math.max(0.5, b.years))
  const data = useMemo<Pt[]>(() => Array.from({ length: 31 }, (_, i) => {
    const k = i * 5_000
    return { km: k, guess: +guess(k).toFixed(1), gentle: +sohAt(k, CAR_A, kmPerYear).toFixed(1), taxi: +sohAt(k, b, kmPerYear).toFixed(1) }
  }), [b, kmPerYear])

  const sohB = sohAt(km, b, kmPerYear), sohA = sohAt(km, CAR_A, kmPerYear)
  const gradeB = gradeOf(sohB), gradeA = gradeOf(sohA)
  const book = CAR.price * bookFactor(b.years, km)
  const risk = book * (batteryFactor(sohA) - batteryFactor(sohB))

  const sliders = [
    { label: 'Odometer (both cars)', value: km, set: setKm, min: 0, max: KM_MAX, step: 1_000, disp: `${fmt(km)} km` },
    { label: 'Car B · fast charging', value: b.fast, set: (v: number) => set({ fast: v }), min: 0, max: 100, step: 5, disp: `${b.fast}% DC` },
    { label: 'Car B · daily temperature', value: b.temp, set: (v: number) => set({ temp: v }), min: 5, max: 40, step: 1, disp: `${b.temp} °C` },
    { label: 'Car B · vehicle age', value: b.years, set: (v: number) => set({ years: v }), min: 1, max: 10, step: 0.5, disp: `${b.years} yr` },
  ]

  return (
    <div className="grid gap-6 rounded-3xl border bg-card p-6 shadow-sm md:p-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="grid content-start gap-6">
        <div>
          <Label>Car B lives like…</Label>
          <div role="tablist" aria-label="Car B preset" className="mt-2.5 grid grid-cols-2 gap-1 rounded-full border bg-muted p-1">
            {(Object.keys(PRESETS) as PresetId[]).map((k) => {
              const P = PRESETS[k]; const Icon = P.icon
              return (
                <button key={k} role="tab" type="button" aria-selected={preset === k}
                  onClick={() => setB({ fast: P.fast, temp: P.temp, years: P.years })}
                  className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm',
                    preset === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon className={cn('size-3.5 shrink-0', k === 'taxi' ? 'text-teal' : 'text-grade-a')} />{k === 'gentle' ? 'Gentle, like Car A' : 'Taxi in heat'}
                </button>
              )
            })}
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="size-3.5" />{preset ? PRESETS[preset].blurb : 'Custom life — move the sliders to shape it.'}
          </p>
        </div>

        {sliders.map((s) => (
          <div key={s.label} className="grid gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <Label className="text-sm">{s.label}</Label>
              <output className="font-mono text-sm text-teal tabular">{s.disp}</output>
            </div>
            <Slider value={[s.value]} min={s.min} max={s.max} step={s.step} onValueChange={([v]: number[]) => s.set(v)} aria-label={s.label} />
          </div>
        ))}

        <div key={`${km}-${b.fast}-${b.temp}-${b.years}`} className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border">
          {([['Car A', sohA, gradeA, 'gentle commuting'], ['Car B', sohB, gradeB, 'your settings']] as const).map(([name, soh, g, sub]) => (
            <div key={name} className="bg-card p-4">
              <span className="block text-xs text-muted-foreground">{name} · {sub}</span>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <b className="font-mono text-3xl font-semibold tabular">{soh.toFixed(1)}%</b>
                <Badge variant={g.toLowerCase() as 'a'}>Grade {g}</Badge>
              </div>
              <small className="text-xs text-muted-foreground">{(CAR.kwh * soh / 100).toFixed(1)} kWh usable</small>
            </div>
          ))}
          <div className="col-span-2 bg-card p-4">
            <span className="block text-xs text-muted-foreground">Financial risk the odometer hides · same {fmt(km)} km on both dashes</span>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
              <b className="font-mono text-2xl text-primary tabular">{etb(Math.max(0, risk))}</b>
              <span className="font-mono text-sm text-muted-foreground">≈ {usd(Math.max(0, risk))}</span>
            </div>
            <small className="text-xs text-muted-foreground">Odometer alone implies {guess(km).toFixed(1)}% for both. {CAR.name}, indicative Addis retail.</small>
          </div>
        </div>
      </div>

      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">State of health vs. odometer</span>
          <span className="text-xs text-muted-foreground">Car A, Car B, and what the odometer implies</span>
        </div>
        <div className="h-[340px] w-full">
          <Suspense fallback={<div className="size-full animate-pulse rounded-2xl bg-muted" />}>
            <ChartWhenVisible data={data} km={km} soh={sohB} habit="taxi" />
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
function ChartWhenVisible(props: { data: Pt[]; km: number; soh: number; habit: 'gentle' | 'taxi' }) {
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
