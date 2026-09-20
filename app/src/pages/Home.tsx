import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  Plug, Crosshair, Timer, ShieldCheck, ArrowRight, QrCode, ScanLine, Cpu, FileCheck2, Lock,
  Building2, Landmark, Ship, Scale, CarFront, BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Section, SectionHead } from '@/components/Layout'
import { Reveal, RevealGroup, revealItem } from '@/components/Reveal'
import { LogoMarquee } from '@/components/LogoMarquee'
import { BlindSpotExplorer } from '@/components/BlindSpotExplorer'
import { BriefingModal } from '@/components/BriefingModal'
import { CountUp } from '@/components/CountUp'
import { HeroCertificate } from '@/components/HeroCertificate'
import { CertificateInspector } from '@/components/CertificateInspector'
import { SocketSimulator } from '@/components/SocketSimulator'
import { AudienceSwitcher } from '@/components/AudienceSwitcher'
import { ServiceTabs } from '@/components/ServiceTabs'
import { CalibrationFlow } from '@/components/CalibrationFlow'
import { BydFocus, GradeLegend } from '@/components/BydFocus'
import { CompatibilitySearch } from '@/components/CompatibilitySearch'

/* the playable test run is its own chunk; it mounts below the fold */
const TestVisualizer = lazy(() => import('@/components/TestVisualizer').then((m) => ({ default: m.TestVisualizer })))
import { cn } from '@/lib/utils'

const CAPS = [
  { icon: Plug, title: 'Socket-side measurement', note: 'no OEM unlock needed' },
  { icon: Crosshair, title: '±3% reference accuracy', note: 'Class 0.5S metering' },
  { icon: Timer, title: '15-minute rapid check', note: 'at your yard or depot' },
  { icon: ShieldCheck, title: 'QR-verified certificate', note: 'public registry < 2 s' },
]

type Metric = { k: string; v?: string; n?: number; prefix?: string; u: string; d: string }
const METRICS: Metric[] = [
  { k: 'Time per car', n: 15, u: 'min', d: 'At your yard, with no downtime' },
  { k: 'Accuracy', n: 3, prefix: '±', u: '%', d: 'Measured, never self-reported' },
  { k: 'Cars we can test', v: 'Any', u: 'EV', d: 'Including locked imports' },
  { k: 'To verify one', n: 2, u: 'sec', d: 'Scan the code, see the record' },
]

type Stat = { v: string; l: string; n?: number; prefix?: string; suffix?: string }
const STATS: Stat[] = [
  { v: '2024', l: 'The year Ethiopia became the first country to ban petrol and diesel car imports' },
  { v: '115,000', n: 115000, l: 'Electric cars on Ethiopian roads today, up from under 10,000 in 2023' },
  { v: '500,000', n: 500000, l: 'The national target for electric vehicles by 2030' },
  { v: '$6B', n: 6, prefix: '$', suffix: 'B', l: 'Annual fuel import bill the switch is designed to end' },
]
/* eniris-style stacked tiles: soft, brand, ink, card */
const TONES = [
  { box: 'bg-brand-soft border border-brand/15', num: 'text-brand', txt: 'text-foreground/80' },
  { box: 'bg-brand text-white', num: 'text-white', txt: 'text-white/85' },
  { box: 'bg-ink text-white', num: 'text-amber', txt: 'text-white/80' },
  { box: 'bg-card border', num: 'text-amber', txt: 'text-muted-foreground' },
]

const STEPS = [
  { icon: Plug, n: '01', t: 'Plug in', d: 'We connect our equipment to the car’s normal charging socket. Nothing is fitted to the vehicle itself.' },
  { icon: ScanLine, n: '02', t: 'Measure', d: 'We charge the car under controlled conditions and measure exactly how much energy the battery actually accepts.' },
  { icon: Cpu, n: '03', t: 'Compute', d: 'That measurement tells us how much capacity the battery has left, compared with when it was new.' },
  { icon: FileCheck2, n: '04', t: 'Certify', d: 'You get the certificate on the spot, with a code anyone can scan to confirm it is genuine.' },
]

/* The hero's audience rail — the same four seats the switcher below offers. */
const QUICK = [
  { id: 'buyers', label: 'Buyers & sellers', sub: 'Ask for the certificate', icon: CarFront },
  { id: 'insurers', label: 'Insurers', sub: 'Price the risk you carry', icon: Building2 },
  { id: 'banks', label: 'Banks & MFIs', sub: 'Collateral you can model', icon: Landmark },
  { id: 'importers', label: 'Importers', sub: 'Prove the pack on arrival', icon: Ship },
  { id: 'regulators', label: 'Regulators', sub: 'One national standard', icon: Scale },
]
/* Audience impact switcher: the rail rewrites the hero message and preselects the switcher below. */
const HERO_COPY: Record<string, { eyebrow: string; body: string; stat?: [string, string]; cta?: string }> = {
  default: { eyebrow: 'EV Battery Intelligence & Certification',
    body: 'On an electric car, the battery is half the value — and the odometer tells you nothing about it. RISIQ certifies the batteries of BYD and other Chinese EVs on Ethiopian roads: an independent, verifiable report in fifteen minutes, so you can buy, lend and insure with confidence.' },
  buyers: { eyebrow: 'For buyers & sellers', stat: ['50%', 'of a used EV’s value is the battery'], cta: 'Book a buyer briefing',
    body: 'A used Atto 3 is priced on mileage and paintwork — the battery, half its value, stays invisible. Ask for the RISIQ certificate: one scan shows the measured, calibrated health, and a certified car sells faster at a fair price.' },
  insurers: { eyebrow: 'For insurers', stat: ['A–D', 'one grade per policy'], cta: 'Book an insurer briefing',
    body: 'Every EV policy in Addis is underwritten blind to the battery, the most expensive part to replace. RISIQ gives you a measured state of health at underwriting and again at claim, so risk is priced and disputes settle on a number.' },
  banks: { eyebrow: 'For banks & MFIs', stat: ['35%', 'of collateral value sits in the pack'], cta: 'Book a lender briefing',
    body: 'On a five-year EV loan the battery is roughly a third of the collateral — and the only part nobody checks. RISIQ gives your credit committee a measured, calibrated state of health at origination and at every re-test.' },
  importers: { eyebrow: 'For importers', stat: ['Any EV', 'certified on arrival, no OEM unlock'], cta: 'Book an importer briefing',
    body: 'BYD, Changan, Jetour — locked to the manufacturer’s tools. RISIQ certifies each import at the charging socket on arrival, so you price and warrant every car by its measured grade, no OEM unlock required.' },
  regulators: { eyebrow: 'For regulators', stat: ['< 2 s', 'public verification of any certificate'], cta: 'Talk to us about a standard',
    body: 'Ethiopia went electric faster than any country in Africa. One independent grade scale across every brand — publicly verifiable in seconds — lets lenders, insurers and the resale market grow with the fleet.' },
}

export default function Home() {
  const reduce = useReducedMotion()
  const [aud, setAud] = useState<string>('default')
  const copy = HERO_COPY[aud]
  const pickAudience = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setAud(id)
    window.dispatchEvent(new CustomEvent('risiq:audience', { detail: id }))
  }
  return (
    <>
      {/* ------------------------------------------ hero: full-bleed brand band */}
      <section className="hero-band relative isolate overflow-hidden text-white">
        <div aria-hidden className="hero-grid absolute inset-0 -z-10" />
        <div aria-hidden className="hero-orb absolute -top-48 right-[28%] -z-10 size-[36rem] rounded-full" />
        <div aria-hidden className="hero-orb hero-orb-b absolute -bottom-56 left-[14%] -z-10 size-[32rem] rounded-full" />
        {/* watermark emblem, the way eniris fades its mark behind the headline */}
        <svg aria-hidden viewBox="0 0 100 100"
          className="pointer-events-none absolute top-1/2 -left-[16%] -z-10 size-[min(120vw,1100px)] -translate-y-1/2 text-white/[0.07]">
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="9" strokeDasharray="200 40" strokeLinecap="round" transform="rotate(120 50 50)" />
          <path d="M55 22 L38 54 h12 l-5 24 L64 46 H52 z" fill="currentColor" />
        </svg>

        <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-6 pt-20 pb-16 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28 lg:pb-20">
          <div className="animate-rise">
            <span key={aud} className="animate-rise flex items-center gap-3 font-mono text-sm font-semibold tracking-[0.18em] text-white/85 uppercase">
              <span className="size-2 rounded-full bg-white ring-4 ring-white/25" />{copy.eyebrow}
            </span>
            <h1 className="mt-7 text-[2.9rem] leading-[1.02] font-bold tracking-tight sm:text-[3.6rem] md:text-[5rem] lg:text-[5.8rem]">
              Know what the car is<br className="hidden md:block" />{' '}
              <span className="relative inline-block">
                really worth.
                <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" fill="none"
                  className="absolute -bottom-1 left-0 h-[0.22em] w-full text-white/60 md:-bottom-2">
                  <path d="M4 14 C 80 5, 170 3, 296 10" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
                    vectorEffect="non-scaling-stroke" pathLength={1} className="draw-line" />
                </svg>
              </span>
            </h1>
            <p key={`p-${aud}`} className="animate-rise mt-8 max-w-[52ch] text-xl text-white/85 md:text-2xl md:leading-snug">
              {copy.body}
              {copy.stat && (
                <span className="mt-4 flex items-baseline gap-2.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 backdrop-blur">
                  <b className="font-mono text-2xl font-semibold text-white">{copy.stat[0]}</b>
                  <span className="text-sm text-white/80">{copy.stat[1]}</span>
                </span>
              )}
              {aud !== 'default' && (
                <a href="#audience" onClick={(e) => { e.preventDefault(); document.getElementById('audience')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                  className="mt-3 block text-base font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                  See what the certificate unlocks for you ↓
                </a>
              )}
            </p>
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Why RISIQ">
              {['Independent — no OEM tool needed', 'Built for BYD & Chinese imports', 'QR-verified in under 2 s', 'Made in Addis Ababa'].map((t) => (
                <li key={t} className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                  <BadgeCheck className="size-3.5" />{t}
                </li>
              ))}
            </ul>
            <div className="mt-11 flex flex-wrap gap-4">
              <BriefingModal trigger={
                <Button key={aud} size="lg" className="animate-rise h-14 rounded-lg bg-white px-9 text-base text-brand shadow-xl hover:bg-white hover:text-brand-dark">{copy.cta ?? 'Book a pilot briefing'}</Button>} />
              <CertificateInspector trigger={
                <Button size="lg" variant="outline" className="h-14 rounded-lg border-white/35 bg-white/10 px-9 text-base text-white hover:border-white hover:bg-white hover:text-brand">
                  <ShieldCheck />Live verification demo
                </Button>} />
            </div>
            <p className="mt-8 font-mono text-sm tracking-wide text-white/65">
              Part of RISIQ Group · in technology partnership with Eniris
            </p>
          </div>

          {/* the product itself — a live card, not a stock photo. Hover to tilt. */}
          <div className="animate-rise-cert relative mx-auto w-full max-w-[520px]">
            <div aria-hidden className="absolute -inset-12 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,oklch(1_0_0/0.22),transparent)] blur-2xl" />
            <motion.div data-parallax="-6"
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              <HeroCertificate className="max-w-[520px]" />
            </motion.div>
            <span className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 font-mono text-xs text-primary shadow-xl">
              <QrCode className="size-3.5" />Scan to verify · &lt; 2 s
            </span>
            {/* floating statistics — transform-only float, CSS entrance, desktop only (the metric row serves phones) */}
            {([
              { k: 'Rapid Check', n: 15, u: 'min', cls: '-top-6 -left-10 lg:-left-16', dur: 6.5 },
              { k: 'Accuracy', n: 3, prefix: '±', u: '%', cls: 'top-[38%] -right-8 lg:-right-14', dur: 7.5 },
              { k: 'Verification', n: 2, prefix: '< ', u: 's', cls: '-bottom-2 right-6 lg:-right-4', dur: 8 },
            ] as const).map((f, i) => (
              <motion.div key={f.k} aria-hidden
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: f.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                className={cn('animate-rise absolute z-20 hidden rounded-2xl border border-white/30 bg-white/90 px-4 py-3 text-slate-900 shadow-xl backdrop-blur md:block', f.cls)}
                style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
                <span className="block font-mono text-[0.6rem] tracking-[0.16em] text-slate-500 uppercase">{f.k}</span>
                <span className="mt-0.5 flex items-baseline gap-1 font-mono text-2xl font-semibold text-[#e2231a]">
                  <CountUp to={f.n} prefix={'prefix' in f ? f.prefix : ''} duration={1200} /><span className="text-sm text-slate-500">{f.u}</span>
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* audience rail — eniris puts its four segments here; ours are the four seats */}
        <div className="relative border-t border-white/15 bg-black/10">
          <ul className="mx-auto grid max-w-[1440px] grid-cols-2 divide-white/10 px-6 md:grid-cols-5 md:divide-x">
            {QUICK.map(({ id, label, sub, icon: Icon }) => (
              <li key={id}>
                <a href="#audience" onClick={pickAudience(id)} aria-pressed={aud === id}
                  className={cn('group flex items-center gap-4 rounded-lg py-5 pr-4 outline-none transition-colors hover:text-white focus-visible:ring-[3px] focus-visible:ring-white/60 md:justify-center md:py-6',
                    aud === id && 'bg-white/10')}>
                  <Icon className="size-7 shrink-0 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-white" strokeWidth={1.6} />
                  <span className="leading-tight">
                    <b className="block text-base font-semibold md:text-[1.05rem]">{label}</b>
                    <small className="block text-xs text-white/65">{sub}</small>
                  </span>
                  <ArrowRight className="ml-auto size-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:ml-2" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LogoMarquee />

      {/* --------------------------------------------------------- metrics */}
      <Section className="py-16 md:py-20">
        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <motion.div key={m.k} variants={revealItem}
              className="glow-card group rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8">
              <span className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">{m.k}</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-semibold text-gradient md:text-5xl">
                  {m.n !== undefined ? <CountUp to={m.n} prefix={m.prefix ?? ''} duration={1100} /> : m.v}
                </span>
                <span className="font-mono text-base text-muted-foreground">{m.u}</span>
              </div>
              <span className="mt-3 block text-[0.95rem] text-muted-foreground">{m.d}</span>
            </motion.div>
          ))}
        </RevealGroup>
      </Section>

      {/* ------------------------------------------- the fleet Ethiopia has */}
      <Section className="pt-4">
        <SectionHead eyebrow="Built For Ethiopia’s Fleet" title="Made for the cars on Ethiopian roads. BYD first.">
          Most electric cars in Addis are BYDs, locked to the manufacturer’s tools. Pick a model to see what a plain OBD reader gets — and what RISIQ meters at the socket.
        </SectionHead>
        <Reveal><BydFocus /></Reveal>
        <Reveal className="mt-10"><CompatibilitySearch /></Reveal>
      </Section>

      {/* ----------------------------------------------------- what we offer */}
      <Section muted>
        <SectionHead eyebrow="What We Offer" title="Two tests, one certificate, a registry behind it.">
          Pick the test that fits the decision. Both end in the same signed document, and both work on cars the manufacturer has locked.
        </SectionHead>
        <Reveal><ServiceTabs /></Reveal>
      </Section>

      {/* ------------------------------------------------- the blind spot */}
      <Section>
        <SectionHead eyebrow="The Blind Spot" title="Two cars. Same mileage. Very different value.">
          Electric motors barely wear out. Batteries do — and they are roughly half what the car is worth. Move the odometer and switch the life the car has lived: the dash reads the same, the battery does not.
        </SectionHead>
        <Reveal><BlindSpotExplorer /></Reveal>
      </Section>

      {/* ------------------------------------------- socket vs OBD simulator */}
      <Section muted>
        <SectionHead eyebrow="Why The Socket" title="Locked cars can refuse a question. They cannot refuse electricity.">
          Most EVs arriving in Ethiopia encrypt the diagnostic port a normal reader depends on. RISIQ measures at the plug — and where the car does share its own battery data, every reading is cross-checked against our calibrated database. Switch between the two methods to see the difference.
        </SectionHead>
        <Reveal><SocketSimulator /></Reveal>
      </Section>

      {/* ------------------------------------------- calibration: two sources, one number */}
      <Section muted>
        <SectionHead eyebrow="Calibrated, Not Assumed" title="Two sources. One calibrated number.">
          A battery’s own computer can be optimistic. Our meter cannot. RISIQ collects both, then checks every BMS reading against its own calibrated database of measured packs before a grade is issued.
        </SectionHead>
        <Reveal><CalibrationFlow /></Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link to="/how-it-works">How the calibration works</Link></Button>
          </div>
        </Reveal>
      </Section>

      {/* ------------------------------------------------ audience router */}
      <Section id="audience">
        <SectionHead eyebrow="You Are" title="Who this is for.">
          Every electric car in Addis sits on somebody's books. Pick your seat at the table — the certificate is the same, what it unlocks is not.
        </SectionHead>
        <Reveal><AudienceSwitcher /></Reveal>
      </Section>

      {/* ------------------------------------------- market context + photo */}
      <Section>
        <SectionHead eyebrow="Why Ethiopia, Why Now" title="A nation went electric, almost overnight.">
          Ethiopia has moved faster on EVs than any country in Africa. The cars are already here; the trust layer around their batteries is not.
        </SectionHead>
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <RevealGroup className="grid gap-4 sm:grid-cols-2">
            {STATS.map((s, i) => (
              <motion.div key={s.v} variants={revealItem}
                className={cn('flex flex-col justify-between rounded-2xl p-7 transition-transform duration-300 hover:-translate-y-1', TONES[i].box)}>
                <span className={cn('block font-mono text-4xl font-semibold tabular md:text-[2.75rem]', TONES[i].num)}>
                  {s.n !== undefined
                    ? <CountUp to={s.n} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} />
                    : s.v}
                </span>
                <span className={cn('mt-5 block text-sm leading-snug', TONES[i].txt)}>{s.l}</span>
              </motion.div>
            ))}
          </RevealGroup>
          <Reveal delay={0.1} className="relative min-h-[380px] overflow-hidden rounded-2xl border shadow-xl">
            <img src="img/addis-sunset.jpg" width={1280} height={720} loading="lazy" data-parallax="-5"
              alt="Addis Ababa skyline at dusk"
              className="absolute inset-0 size-full scale-[1.12] object-cover" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,oklch(0.18_0.03_255/0.92))]" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-9">
              <span className="font-mono text-xs tracking-[0.16em] text-amber uppercase">Addis Ababa</span>
              <p className="mt-2 max-w-[48ch] text-lg leading-snug font-medium md:text-xl">
                Powered by the Grand Ethiopian Renaissance Dam — abundant, low-cost hydropower to charge an entire national fleet.
              </p>
              <p className="mt-3 text-xs text-white/60">Sources: IEA policy database · UNECA National E-Mobility Strategy 2025–2030.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------ how it works */}
      <Section muted>
        <SectionHead eyebrow="How It Works" title="How it works, in four steps.">
          We come to your yard. Fifteen minutes later you have a report you can show a customer, a credit committee, or a court.
        </SectionHead>
        <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, n, t, d }) => (
            <motion.div key={n} variants={revealItem}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                <CardContent className="flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-teal/10 text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs text-amber">{n}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{t}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{d}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>
        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPS.map(({ icon: Icon, title, note }) => (
            <motion.div key={title} variants={revealItem}
              className="flex items-center gap-3 rounded-xl border bg-card/60 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal/10 text-teal">
                <Icon className="size-4" />
              </span>
              <div>
                <b className="block text-sm">{title}</b>
                <small className="font-mono text-xs text-muted-foreground">{note}</small>
              </div>
            </motion.div>
          ))}
        </RevealGroup>
        <Reveal className="mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-xl font-semibold">Watch a fifteen-minute run</h3>
            <span className="text-sm text-muted-foreground">Play it — or switch to the network-drop tab to see store-and-forward.</span>
          </div>
          <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl border bg-muted" />}><TestVisualizer /></Suspense>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0 text-teal" />
            <span><b className="text-foreground">Built for Addis.</b> If the cellular network drops mid-test, the rig stores the data and forwards it when the link returns — a dropped connection never invalidates a result.</span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link to="/tools">Open the battery tools</Link></Button>
            <Button asChild variant="outline"><Link to="/pilot">See the October pilot</Link></Button>
          </div>
        </Reveal>
      </Section>

      {/* ------------------------------------------------- what we issue */}
      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHead eyebrow="What We Issue" title="What you get.">
              One clear document. A health score, an A–D grade, what the battery can still hold, and how far it will really go — with a code anyone can scan to check it is genuine.
            </SectionHead>
            <ul className="grid gap-4">
              {[
                ['A real health score', 'Measured from the car itself and cross-checked against our calibrated database — never just a number the car claims about its own battery.'],
                ['Impossible to fake', 'Change one detail on the document and the check stops working.'],
                ['Anyone can check it', 'Scan the code with a phone and see the original record in seconds.'],
                ['Holds up in a dispute', 'An independent, dated record if a loan defaults or a sale goes wrong.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-teal" />
                  <span className="text-sm"><b className="text-foreground">{t}</b> — <span className="text-muted-foreground">{d}</span></span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <span className="font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">What the grade means</span>
              <GradeLegend className="mt-3" />
            </div>
            <Button asChild className="mt-8"><Link to="/verify"><QrCode />Try the live verification demo</Link></Button>
          </Reveal>
          <Reveal delay={0.1}>
            {/* the live certificate with hotspot callouts — hover to tilt, numbers explain the fields */}
            <div className="relative mx-auto w-full max-w-[460px] pt-4">
              <HeroCertificate className="max-w-[460px]" />
              {([
                { x: 50, y: 22 }, { x: 50, y: 37 }, { x: 88, y: 51 }, { x: 10, y: 93 },
              ] as const).map((m, i) => (
                <span key={i} aria-hidden className="pointer-events-none absolute z-20 hidden size-7 -translate-x-1/2 -translate-y-1/2 place-items-center md:grid" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
                  <span className="absolute inset-0 rounded-full bg-brand opacity-50 motion-safe:animate-ping" />
                  <span className="relative grid size-6 place-items-center rounded-full border-2 border-white bg-brand font-mono text-[0.7rem] font-bold text-white shadow">{i + 1}</span>
                </span>
              ))}
            </div>
            <ol className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {[
                ['State of health', 'Measured at the socket and calibrated — the share of the original capacity the pack still holds.'],
                ['Grade A–D', 'One plain-language scale, the same for every brand and every institution.'],
                ['Usable capacity & range', 'What the battery can still hold, and how far the car will really go.'],
                ['QR verification', 'Scan it: the code resolves to the signed record in the RISIQ registry in under two seconds.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3 rounded-xl border bg-card/80 p-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand font-mono text-[0.7rem] font-bold text-white">{i + 1}</span>
                  <span className="text-xs leading-snug"><b className="block text-[0.8rem]">{t}</b><span className="text-muted-foreground">{d}</span></span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------------ FAQ */}
      <Section muted>
        <SectionHead eyebrow="Common Questions" title="Answers before you ask." />
        <Reveal>
          <Accordion type="single" collapsible defaultValue="q0" className="max-w-[56rem]">
            {[
              { q: 'Do you need the manufacturer’s cooperation, or access to the car’s software?', a: 'No. RISIQ measures the real energy flowing through the charging socket with its own calibrated meter, so the test works on locked imports — BYD, Changan, Jetour and others — without any OEM tool, password or unlock.' },
              { q: 'Do you use the car’s own battery data?', a: 'Yes, wherever the car allows it — but never on its own. Every BMS reading we collect is cross-checked against RISIQ’s own calibrated database of measured packs and corrected against the energy we actually measured at the socket. The car’s opinion is an input; the certificate carries the calibrated result.' },
              { q: 'How long does a test take?', a: 'The Rapid Check targets about 15 minutes on a partial charge window. The Reference Test runs a full charge session and is the accuracy benchmark, used for ground truth and high-stakes decisions like repossession valuations.' },
              { q: 'Can a certificate be forged or edited?', a: 'No. Every certificate is cryptographically signed at issue. Any edit breaks verification, and the QR code always resolves to the original signed record — so a bank never has to take a PDF at face value.' },
              { q: 'Which vehicles can you test?', a: 'Any battery-electric vehicle that accepts a standard AC or DC charge, regardless of brand, country of origin, or whether its onboard systems are locked.' },
              { q: 'What does it cost, and how do we pay?', a: 'Pilot pricing is per certificate, billed locally in birr via Telebirr, with rig rental available for high-volume partners. Book a briefing for the current rate card.' },
            ].map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------------ CTA */}
      <Section>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl px-8 py-20 text-center text-white md:px-16">
            <img src="img/addis-sunset.jpg" alt="" aria-hidden
              className="absolute inset-0 -z-20 size-full object-cover" loading="lazy" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,oklch(0.18_0.03_255/0.94),oklch(0.2_0.04_255/0.84)_55%,oklch(0.3_0.05_60/0.6))]" />
            <Badge variant="outline" className="border-white/25 text-amber">The Proposal</Badge>
            <h2 className="mx-auto mt-5 max-w-[22ch] text-3xl font-semibold md:text-5xl">
              Let's run a 90-day certification pilot in Addis.
            </h2>
            <p className="mx-auto mt-5 max-w-[56ch] text-white/70">
              Ten BYD vehicles, late October 2026. Founding places are open to banks, micro-finance institutions and insurers — at no cost.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <BriefingModal trigger={<Button size="lg">Book a pilot briefing</Button>} />
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white hover:text-ink">
                <Link to="/pilot">See the pilot <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
