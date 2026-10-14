import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Zap, Home, ArrowRight, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Stage, GLASS, GLASS_HOVER, PRIMARY_GLOW } from '@/components/Stage'
import { RiskGauge } from '@/components/RiskGauge'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { etb, usd, fmt } from '@/lib/data'
import { CAR, GENTLE, KM_MAX, collateral, guess, kmPerYearOf, sohAt, type Life } from '@/lib/collateral'
import type { Pt } from '@/components/BlindSpotChart'
import { cn } from '@/lib/utils'

const Chart = lazy(() => import('@/components/BlindSpotChart'))

type PresetId = 'gentle' | 'taxi'
const PRESETS: Record<PresetId, Life & { label: string; icon: typeof Zap; blurb: string }> = {
  gentle: { label: '90% overnight slow AC', icon: Home, ...GENTLE, blurb: 'Nine charges in ten on a wall box overnight, kept in the shade, easy commuting.' },
  taxi:   { label: '80% fast DC · taxi', icon: Zap, fast: 80, temp: 32, years: 4, blurb: 'Four charges in five on a DC fast charger, parked in the sun, driven hard.' },
}

/** The site's core argument, made explorable: Car A lives gently, Car B is the
 *  taxi you configure. Same odometer, two lives — and a measurement that tells
 *  them apart when the mileage cannot. The gauge reads Car B's measured health
 *  off the same battery model as the certificate, and the counters beside it
 *  show what that does to the collateral. */
export function BlindSpotExplorer() {
  const [km, setKm] = useState(60_000)
  const [b, setB] = useState<Life>({ fast: PRESETS.taxi.fast, temp: PRESETS.taxi.temp, years: PRESETS.taxi.years })
  const preset = (Object.keys(PRESETS) as PresetId[]).find((k) => PRESETS[k].fast === b.fast && PRESETS[k].temp === b.temp && PRESETS[k].years === b.years)
  const set = (patch: Partial<Life>) => setB((v) => ({ ...v, ...patch }))

  const kmPerYear = kmPerYearOf(km, b.years)
  const data = useMemo<Pt[]>(() => Array.from({ length: 31 }, (_, i) => {
    const k = i * 5_000
    return { km: k, guess: +guess(k).toFixed(1), gentle: +sohAt(k, GENTLE, kmPerYear).toFixed(1), taxi: +sohAt(k, b, kmPerYear).toFixed(1) }
  }), [b, kmPerYear])

  const c = collateral(km, b)

  const sliders = [
    { label: 'Odometer (both cars)', value: km, set: setKm, min: 0, max: KM_MAX, step: 1_000, disp: `${fmt(km)} km` },
    { label: 'Car B · fast charging', value: b.fast, set: (v: number) => set({ fast: v }), min: 0, max: 100, step: 5, disp: `${b.fast}% DC` },
    { label: 'Car B · daily temperature', value: b.temp, set: (v: number) => set({ temp: v }), min: 5, max: 40, step: 1, disp: `${b.temp} °C` },
    { label: 'Car B · vehicle age', value: b.years, set: (v: number) => set({ years: v }), min: 1, max: 6, step: 0.5, disp: `${b.years} yr` },
  ]

  const counters = [
    { id: 'book', label: 'Book value', note: 'age and odometer only — battery ignored', value: c.book, tone: 'text-foreground' },
    { id: 'adjusted', label: 'Battery-adjusted collateral', note: 'repriced for the measured pack', value: c.adjusted, tone: 'text-teal' },
    { id: 'risk', label: 'Value at risk vs Car A', note: `hidden by the same ${fmt(km)} km on both dashes`, value: c.atRisk, tone: 'text-primary' },
  ]

  return (
    <Stage>
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-6 lg:p-8">
        {/* ------------------------------------------------ the four sliders */}
        <section aria-label="Car B settings" className={cn(GLASS, GLASS_HOVER, 'flex flex-col gap-6 rounded-2xl p-5 md:p-6')}>
          <div>
            <Label>Car B lives like…</Label>
            <div role="tablist" aria-label="Car B preset" className="mt-2.5 grid grid-cols-2 gap-1 rounded-full border border-slate-800/60 bg-slate-950/60 p-1">
              {(Object.keys(PRESETS) as PresetId[]).map((k) => {
                const P = PRESETS[k]; const Icon = P.icon
                return (
                  <button key={k} role="tab" type="button" aria-selected={preset === k}
                    onClick={() => setB({ fast: P.fast, temp: P.temp, years: P.years })}
                    className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm',
                      preset === k ? 'bg-slate-800 text-foreground shadow-[0_0_18px_rgba(0,242,254,0.18)]' : 'text-muted-foreground hover:text-foreground')}>
                    <Icon className={cn('size-3.5 shrink-0', k === 'taxi' ? 'text-teal' : 'text-grade-a')} />{PRESETS[k].label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <SlidersHorizontal className="size-3.5 shrink-0" />{preset ? PRESETS[preset].blurb : 'Custom life — move the sliders to shape it.'}
            </p>
          </div>

          {sliders.map((s) => (
            <div key={s.label} className="grid gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <Label className="text-sm">{s.label}</Label>
                <output className="font-mono text-sm text-teal tabular-nums">{s.disp}</output>
              </div>
              <Slider value={[s.value]} min={s.min} max={s.max} step={s.step} onValueChange={([v]: number[]) => s.set(v)} aria-label={s.label} />
            </div>
          ))}

          <p className="mt-auto border-t border-slate-800/60 pt-4 text-xs text-muted-foreground">
            Odometer alone implies <b className="font-mono text-foreground tabular-nums">{guess(km).toFixed(1)}%</b> for both cars. {CAR.name}, indicative Addis retail.
          </p>
        </section>

        {/* ------------------------------------------- gauge + financial impact */}
        <section aria-label="Battery collateral risk" className={cn(GLASS, 'grid content-start gap-6 rounded-2xl p-5 md:p-6')}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">Battery collateral risk gauge</span>
            <span className="text-xs text-muted-foreground">Car B · measured at the socket</span>
          </div>

          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,19rem)_1fr]">
            <RiskGauge soh={c.sohB} reference={c.sohA} grade={c.gradeB} label="Car B battery state of health" />

            <div className="grid gap-4">
              {counters.map((k) => (
                <div key={k.id} className="grid gap-0.5 border-b border-slate-800/60 pb-4 last:border-b-0 last:pb-0">
                  <span className="font-mono text-[0.66rem] tracking-[0.12em] text-muted-foreground uppercase">{k.label}</span>
                  <b className={cn('block font-mono text-3xl leading-tight font-semibold tabular-nums', k.tone)}>
                    <AnimatedNumber value={k.value} format={usd} />
                  </b>
                  <small className="text-xs text-muted-foreground">
                    ≈ <AnimatedNumber value={k.value} format={etb} className="font-mono" /> · {k.note}
                  </small>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-slate-800/60 bg-slate-800/60 sm:grid-cols-2">
            <div className="bg-slate-950/60 p-3.5">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <i aria-hidden className="inline-block size-2 rotate-45 bg-white" />Car A · gentle life
              </span>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <b className="font-mono text-xl font-semibold tabular-nums">{c.sohA.toFixed(1)}%</b>
                <Badge variant={c.gradeA.toLowerCase() as 'a'}>Grade {c.gradeA}</Badge>
              </div>
            </div>
            <div className="bg-slate-950/60 p-3.5">
              <span className="block text-xs text-muted-foreground">True remaining range · Car B</span>
              <b className="mt-1 block font-mono text-xl font-semibold tabular-nums">{Math.round(CAR.range * c.sohB / 100)} km</b>
              <small className="text-xs text-muted-foreground tabular-nums">of {CAR.range} km rated · {(CAR.kwh * c.sohB / 100).toFixed(1)} kWh usable</small>
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------- the chart */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        <section aria-label="State of health against odometer" className={cn(GLASS, GLASS_HOVER, 'grid gap-4 rounded-2xl p-5 md:p-6')}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">State of health vs. odometer</span>
            <span className="text-xs text-muted-foreground">Car A, Car B, and what the odometer implies</span>
          </div>
          <div className="h-[300px] w-full sm:h-[340px]">
            <Suspense fallback={<div className="size-full animate-pulse rounded-2xl bg-slate-800/40" />}>
              <ChartWhenVisible data={data} km={km} soh={c.sohB} habit="taxi" />
            </Suspense>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-[68ch] text-xs leading-relaxed text-muted-foreground">
              Both measured curves use the battery model behind the certificate for a {CAR.name}; the odometer line is a flat rule of thumb, shown to illustrate what a buyer sees. Indicative — a certificate replaces this with a measurement.
            </p>
            <Button asChild className={cn(PRIMARY_GLOW, 'bg-teal text-slate-950 hover:bg-teal/90')}>
              <Link to="/tools">Open the full calculator<ArrowRight /></Link>
            </Button>
          </div>
        </section>
      </div>
    </Stage>
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
