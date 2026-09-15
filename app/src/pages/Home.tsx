import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  Plug, Crosshair, Timer, ShieldCheck, ArrowRight,
  QrCode, ScanLine, Cpu, FileCheck2, Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Section, SectionHead } from '@/components/Layout'
import { Reveal, RevealGroup, revealItem } from '@/components/Reveal'
import { LogoMarquee } from '@/components/LogoMarquee'
import { OdometerProof } from '@/components/OdometerProof'
import { BriefingModal } from '@/components/BriefingModal'
import { CountUp } from '@/components/CountUp'
import { HeroCertificate } from '@/components/HeroCertificate'
import { CertificateInspector } from '@/components/CertificateInspector'
import { SocketSimulator } from '@/components/SocketSimulator'
import { AudienceSwitcher } from '@/components/AudienceSwitcher'

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
  { v: '2024', n: 2024, l: 'The year Ethiopia became the first country to ban petrol and diesel car imports' },
  { v: '115,000', n: 115000, l: 'Electric cars on Ethiopian roads today, up from under 10,000 in 2023' },
  { v: '500,000', n: 500000, l: 'The national target for electric vehicles by 2030' },
  { v: '$6B', n: 6, prefix: '$', suffix: 'B', l: 'Annual fuel import bill the switch is designed to end' },
]

const STEPS = [
  { icon: Plug, n: '01', t: 'Plug in', d: 'We connect our equipment to the car’s normal charging socket. Nothing is fitted to the vehicle itself.' },
  { icon: ScanLine, n: '02', t: 'Measure', d: 'We charge the car under controlled conditions and measure exactly how much energy the battery actually accepts.' },
  { icon: Cpu, n: '03', t: 'Compute', d: 'That measurement tells us how much capacity the battery has left, compared with when it was new.' },
  { icon: FileCheck2, n: '04', t: 'Certify', d: 'You get the certificate on the spot, with a code anyone can scan to confirm it is genuine.' },
]

export default function Home() {
  const reduce = useReducedMotion()
  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="bg-grid relative isolate overflow-hidden py-24 md:py-32 lg:py-36">
        <div aria-hidden className="pointer-events-none absolute -inset-x-24 -top-1/3 h-[130%] -z-10
          [background:radial-gradient(42%_46%_at_16%_22%,oklch(0.62_0.21_29/0.13),transparent_68%),radial-gradient(36%_42%_at_86%_72%,oklch(0.75_0.14_60/0.12),transparent_70%)]" />
        <div className="mx-auto grid max-w-[1440px] items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-rise">
            <span className="flex items-center gap-3 font-mono text-sm font-semibold tracking-[0.18em] text-brand uppercase">
              <span className="size-2 rounded-full bg-brand ring-4 ring-brand/20" />EV Battery Intelligence &amp; Certification
            </span>
            <h1 className="mt-7 text-[3.4rem] leading-[1.02] font-bold tracking-tight md:text-[5rem] lg:text-[5.8rem]">
              Know what the car is<br className="hidden md:block" />
              <span className="text-gradient">really worth.</span>
            </h1>
            <p className="mt-8 max-w-[52ch] text-xl text-muted-foreground md:text-2xl md:leading-snug">
              On an electric car, the battery is half the value — and the odometer tells you nothing about it. RISIQ gives you an independent, verifiable battery report in fifteen minutes, so you can buy, lend and insure with confidence.
            </p>
            <div className="mt-11 flex flex-wrap gap-4">
              <BriefingModal trigger={<Button size="lg" className="h-14 rounded-lg bg-brand px-9 text-base hover:bg-brand-dark">Book a pilot briefing</Button>} />
              <CertificateInspector trigger={
                <Button size="lg" variant="outline" className="h-14 rounded-lg px-9 text-base"><ShieldCheck />Sample certificate demo</Button>} />
            </div>
            <p className="mt-8 font-mono text-sm tracking-wide text-muted-foreground">
              Part of RISIQ Group · in technology partnership with Eniris
            </p>
          </div>

          {/* the product itself — a live card, not a stock photo. Hover to tilt. */}
          <div className="animate-rise-cert relative mx-auto w-full max-w-[520px]">
            <div aria-hidden className="absolute -inset-12 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,oklch(0.62_0.21_29/0.14),transparent)] blur-2xl" />
            <motion.div data-parallax="-6"
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              <HeroCertificate className="max-w-[520px]" />
            </motion.div>
            <span className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 font-mono text-xs text-primary shadow-xl">
              <QrCode className="size-3.5" />Scan to verify · &lt; 2 s
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[1440px] px-6">
          <RevealGroup className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((m) => (
              <motion.div key={m.k} variants={revealItem}
                className="glow-card group rounded-2xl border bg-card/80 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8">
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
        </div>
      </section>

      {/* ------------------------------------------------ market context */}
      <Section className="py-16">
        <RevealGroup className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <motion.div key={s.v} variants={revealItem} className="bg-card p-7 transition-colors hover:bg-accent/40">
              <span className="block font-mono text-3xl font-semibold text-amber tabular md:text-4xl">
                {s.n !== undefined
                  ? <CountUp to={s.n} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} />
                  : s.v}
              </span>
              <span className="mt-3 block text-sm text-muted-foreground">{s.l}</span>
            </motion.div>
          ))}
        </RevealGroup>
        <p className="mt-6 max-w-[80ch] text-sm text-muted-foreground">
          Powered by the Grand Ethiopian Renaissance Dam — abundant, low-cost hydropower to charge an entire national fleet.
          <span className="text-muted-foreground/70"> Sources: IEA policy database · UNECA National E-Mobility Strategy 2025–2030.</span>
        </p>
      </Section>

      {/* ------------------------------------------------- the blind spot */}
      <Section muted>
        <SectionHead eyebrow="The Blind Spot" title="Two cars. Same mileage. Very different value.">
          Electric motors barely wear out. Batteries do — and they are roughly half what the car is worth. Two cars can show the same number on the dash and be thousands of dollars apart.
        </SectionHead>
        <Reveal><OdometerProof /></Reveal>
      </Section>

      {/* ------------------------------------------- socket vs OBD simulator */}
      <Section>
        <SectionHead eyebrow="Why The Socket" title="Locked cars can refuse a question. They cannot refuse electricity.">
          Most EVs arriving in Ethiopia encrypt the diagnostic port a normal reader depends on. Switch between the two methods to see why RISIQ measures at the plug instead.
        </SectionHead>
        <Reveal><SocketSimulator /></Reveal>
      </Section>

      {/* ------------------------------------------------ audience router */}
      <Section>
        <SectionHead eyebrow="You Are" title="Who this is for.">
          Every electric car in Addis sits on somebody's books. Pick your seat at the table — the certificate is the same, what it unlocks is not.
        </SectionHead>
        <Reveal><AudienceSwitcher /></Reveal>
      </Section>

      <LogoMarquee />

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
                ['A real health score', 'Measured from the car itself — not a number the car claims about its own battery.'],
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
            <Button asChild className="mt-8"><Link to="/verify"><QrCode />Try the live verification demo</Link></Button>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border bg-card p-4 shadow-xl" data-parallax="-4">
              <img src="img/certificate-risiq.png" width={2000} height={2540}
                alt="Sample RISIQ battery-health certificate showing 94% state of health and Grade A"
                className="w-full rounded-xl" loading="lazy" />
            </div>
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
