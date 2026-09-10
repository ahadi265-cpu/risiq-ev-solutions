import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Section, SectionHead } from '@/components/Layout'
import { Reveal } from '@/components/Reveal'
import { TestVisualizer } from '@/components/TestVisualizer'
import { cn } from '@/lib/utils'
import {
  FLEET, CLIMATES, modelSoH, gradeOf, bookFactor, batteryFactor, fmt, etb, type Grade,
} from '@/lib/data'

const GRADE_FILL: Record<Grade, string> = {
  A: 'oklch(0.517 0.146 149.1)', B: 'oklch(0.511 0.096 186.4)',
  C: 'oklch(0.523 0.135 62.4)', D: 'oklch(0.487 0.192 27.6)',
}

function Stat({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="bg-card p-4">
      <span className="block text-xs text-muted-foreground">{k}</span>
      <b className="mt-1.5 block font-mono text-lg tabular">{v}</b>
      <small className="mt-0.5 block text-xs text-muted-foreground">{s}</small>
    </div>
  )
}

export default function Tools() {
  const [vid, setVid] = useState('atto3')
  const [years, setYears] = useState(4)
  const [km, setKm] = useState(72_000)
  const [cycles, setCycles] = useState(620)
  const [cli, setCli] = useState<string>('addis')

  const car = FLEET.find((f) => f.id === vid)!
  const climate = CLIMATES.find((c) => c.id === cli)!
  const m = useMemo(() => modelSoH(years, cycles, climate.temp), [years, cycles, climate.temp])
  const grade = gradeOf(m.soh)

  const book = car.price * bookFactor(years, km)
  const bf = batteryFactor(m.soh)
  const adjusted = book * bf
  const gap = book - adjusted

  return (
    <Section className="pt-14">
      <SectionHead eyebrow="Degradation & Valuation" title="Put a number on the battery before you lend against it.">
        Move the sliders. State of health follows a square-root calendar-fade law with an Arrhenius temperature term, plus linear cycle fade — the method behind the certificate. The collateral figures show what a battery-blind valuation misses.
      </SectionHead>

      <Reveal>
        <div className="grid overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[0.86fr_1.14fr]">
          <div className="grid content-start gap-7 border-b bg-muted/40 p-7 lg:border-r lg:border-b-0">
            <div>
              <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">Vehicle</span>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Vehicle">
                {FLEET.map((f) => (
                  <button key={f.id} role="radio" aria-checked={f.id === vid} onClick={() => setVid(f.id)}
                    className={cn('cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all',
                      f.id === vid ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:border-primary hover:text-foreground')}>
                    {f.name.replace('BYD ', '')}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: 'Age', value: years, set: setYears, min: 0, max: 10, step: 0.5, disp: `${years} ${years === 1 ? 'year' : 'years'}`, hint: 'Calendar fade grows with the square root of time.' },
              { label: 'Odometer', value: km, set: setKm, min: 0, max: 200_000, step: 1000, disp: `${fmt(km)} km`, hint: 'Drives market depreciation — not battery health.' },
              { label: 'Charge cycles', value: cycles, set: setCycles, min: 0, max: 2000, step: 10, disp: `${fmt(cycles)} cycles`, hint: 'Equivalent full cycles. A commuter adds ~150/year; a taxi, ~600.' },
            ].map((s) => (
              <div key={s.label} className="grid gap-2.5">
                <div className="flex items-baseline justify-between gap-4">
                  <Label>{s.label}</Label>
                  <output className="font-mono text-sm text-teal tabular">{s.disp}</output>
                </div>
                <Slider value={[s.value]} min={s.min} max={s.max} step={s.step}
                  onValueChange={([v]: number[]) => s.set(v)} aria-label={s.label} />
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </div>
            ))}

            <div>
              <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">Climate</span>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Climate">
                {CLIMATES.map((c) => (
                  <button key={c.id} role="radio" aria-checked={c.id === cli} onClick={() => setCli(c.id)}
                    className={cn('flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                      c.id === cli ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:border-primary hover:text-foreground')}>
                    {c.label}<small className="font-mono text-xs opacity-70">{c.temp}°C</small>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{climate.note}</p>
            </div>
          </div>

          <div className="grid content-start gap-7 p-7">
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative size-32 shrink-0">
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ v: m.soh }]} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="v" cornerRadius={20} fill={GRADE_FILL[grade]} background={{ fill: 'oklch(0.916 0.011 251)' }} isAnimationActive />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <motion.span key={m.soh.toFixed(1)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
                  className="block font-mono text-4xl font-semibold tabular">{m.soh.toFixed(1)}%</motion.span>
                <span className="mt-1.5 block text-sm text-muted-foreground">estimated state of health</span>
                <Badge variant={grade.toLowerCase() as 'a'} className="mt-3">Grade {grade}</Badge>
              </div>
            </div>

            <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
              <Stat k="Usable capacity" v={`${(car.kwh * m.soh / 100).toFixed(1)} kWh`} s={`of ${car.kwh} kWh new`} />
              <Stat k="Estimated range" v={`${Math.round(car.range * m.soh / 100)} km`} s={`of ${car.range} km rated`} />
              <Stat k="Calendar fade" v={`−${m.calendar.toFixed(1)} pp`} s={`${years} yr at ${climate.temp}°C`} />
              <Stat k="Cycle fade" v={`−${m.cyclic.toFixed(1)} pp`} s={`${fmt(cycles)} full cycles`} />
            </div>

            <div className="grid gap-3 rounded-xl border p-5">
              <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">Collateral position</span>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Book residual <small className="block text-xs">battery ignored</small></span>
                <b className="font-mono tabular">{etb(book)}</b>
              </div>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Battery-adjusted residual</span>
                <b className="font-mono text-lg text-teal tabular">{etb(adjusted)}</b>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" role="img"
                aria-label={`Battery-adjusted residual is ${Math.round(bf * 100)}% of book residual.`}>
                <motion.i className="block h-full bg-teal" animate={{ width: `${bf * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-dashed pt-3 text-sm">
                <span className="text-muted-foreground">Unpriced exposure</span>
                <b className="font-mono text-lg text-primary tabular">{etb(gap)}</b>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Indicative model using RISIQ's published method. Vehicle prices are indicative Addis retail. A certificate replaces this estimate with a measurement.
            </p>
            <Button asChild variant="outline" className="w-fit"><a href="/verify">Verify a real certificate</a></Button>
          </div>
        </div>
      </Reveal>

      <div className="mt-20">
        <SectionHead eyebrow="Test Comparison" title="Fifteen minutes, or four hours?">
          Both tests end in the same signed certificate. Play either run to see what the Rapid Check trades away.
        </SectionHead>
        <Reveal><TestVisualizer /></Reveal>
      </div>
    </Section>
  )
}
