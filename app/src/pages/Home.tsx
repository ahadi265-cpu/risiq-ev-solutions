import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Plug, Crosshair, Timer, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Section, SectionHead } from '@/components/Layout'
import { Reveal, RevealGroup, revealItem } from '@/components/Reveal'

const CAPS = [
  { icon: Plug, title: 'Socket-side measurement', note: 'no OEM unlock needed' },
  { icon: Crosshair, title: '±3% reference accuracy', note: 'Class 0.5S metering' },
  { icon: Timer, title: '15-minute rapid check', note: 'at your yard or depot' },
  { icon: ShieldCheck, title: 'QR-verified certificate', note: 'public registry < 2 s' },
]

const STATS = [
  { v: '2024', l: 'World-first ban on petrol & diesel car imports' },
  { v: '115,000', l: 'EVs on the road today, up from under 10,000 in 2023' },
  { v: '500,000', l: 'EV import target by 2030 under the National E-Mobility Strategy' },
  { v: '$6B/yr', l: 'Fuel-import bill the switch is designed to end' },
]

export default function Home() {
  const reduce = useReducedMotion()
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[oklch(0.22_0.04_255)] py-24 text-white md:py-32">
        <div aria-hidden className="pointer-events-none absolute -inset-x-24 -top-1/3 h-[130%] -z-10 opacity-70
          [background:radial-gradient(38%_44%_at_18%_22%,oklch(0.53_0.21_27/0.34),transparent_70%),radial-gradient(34%_40%_at_82%_68%,oklch(0.6_0.11_183/0.28),transparent_70%)]" />
        <div className="mx-auto max-w-[1440px] px-6">
          <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="max-w-[62ch]">
            <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-amber uppercase">
              <span className="size-1.5 rounded-full bg-amber ring-3 ring-amber/25" />EV Battery Intelligence &amp; Certification
            </span>
            <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl md:leading-[1.03]">
              The battery truth behind Ethiopia's electric future.
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg text-white/70">
              Independent, engineering-grade EV battery-health certification — built for the locked, imported fleet now filling the streets of Addis Ababa.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/pilot">Register for the Pilot</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white hover:text-ink">
                <Link to="/tools">Open the tools</Link>
              </Button>
            </div>
          </motion.div>

          <RevealGroup className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {CAPS.map(({ icon: Icon, title, note }) => (
              <motion.div key={title} variants={revealItem}
                className="group flex items-center gap-4 bg-[oklch(0.2_0.035_255)]/80 p-5 transition-colors hover:bg-primary/15">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/6 text-teal transition-colors group-hover:text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <b className="block text-sm font-semibold">{title}</b>
                  <small className="mt-0.5 block font-mono text-xs text-white/45">{note}</small>
                </div>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <Section>
        <RevealGroup className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <motion.div key={s.v} variants={revealItem} className="bg-card p-7">
              <span className="block font-mono text-3xl font-semibold text-amber tabular md:text-4xl">{s.v}</span>
              <span className="mt-3 block text-sm text-muted-foreground">{s.l}</span>
            </motion.div>
          ))}
        </RevealGroup>
      </Section>

      <Section muted>
        <SectionHead eyebrow="What We Offer" title="Two tests. One certificate everyone can trust.">
          From a quick dealer-lot check to the accuracy benchmark banks rely on — every result ends in the same signed, verifiable document.
        </SectionHead>
        <RevealGroup className="grid gap-6 md:grid-cols-3">
          {[
            { t: 'RISIQ Rapid Check', tag: '~15 min', d: 'A short partial-charge measurement mapped to full State-of-Health by models trained on our own Ethiopian reference dataset.' },
            { t: 'RISIQ Reference Test', tag: 'Gold standard', d: 'A full charge session measured end-to-end with a revenue-grade calibrated meter — targeting ±3% accuracy.' },
            { t: 'RISIQ Certificate', tag: 'The deliverable', d: 'A signed, QR-verifiable document with State-of-Health, usable capacity, range and a clear A–D grade.' },
          ].map((c) => (
            <motion.div key={c.t} variants={revealItem}>
              <Card className="h-full transition-all hover:-translate-y-1.5 hover:shadow-lg">
                <CardContent className="flex h-full flex-col">
                  <span className="mb-4 w-fit rounded-full border border-teal/25 bg-teal/8 px-3 py-1 font-mono text-[0.68rem] tracking-wider text-teal uppercase">{c.tag}</span>
                  <h3 className="text-xl font-semibold">{c.t}</h3>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{c.d}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>
      </Section>

      <Section>
        <Reveal>
          <div className="rounded-3xl border bg-[oklch(0.22_0.04_255)] px-8 py-16 text-center text-white md:px-16">
            <h2 className="mx-auto max-w-[20ch] text-3xl font-semibold md:text-4xl">Let's run a 90-day certification pilot in Addis.</h2>
            <p className="mx-auto mt-5 max-w-[52ch] text-white/70">Ten BYD vehicles, late October 2026. Founding places open to banks, micro-finance institutions and insurers.</p>
            <Button asChild size="lg" className="mt-8"><Link to="/pilot">See the pilot <ArrowRight /></Link></Button>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
