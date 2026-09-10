import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  Plug, Crosshair, Timer, ShieldCheck, ArrowRight, Landmark, PiggyBank,
  Building2, QrCode, ScanLine, Cpu, FileCheck2, Lock,
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

const AUDIENCE = [
  { icon: Landmark, t: 'Commercial banks', to: '/pilot',
    d: 'Value the battery at origination and at resale, so a five-year loan is written against collateral you can model — not a number nobody can check.' },
  { icon: PiggyBank, t: 'Micro-finance', to: '/pilot',
    d: 'Screen the batteries your borrowers depend on to earn. A degraded pack is a missed repayment long before it is a repossession.' },
  { icon: Building2, t: 'Insurers', to: '/pilot',
    d: 'Price the risk you already carry. An independently measured state of health at underwriting, and again at claim, settles disputes before they start.' },
]

const STEPS = [
  { icon: Plug, n: '01', t: 'Plug in', d: 'The rig goes in line between the charge source and the car’s own socket. Nothing is installed on the vehicle.' },
  { icon: ScanLine, n: '02', t: 'Measure', d: 'A Class 0.5S revenue-grade meter samples voltage and current at 1 Hz across a controlled charge.' },
  { icon: Cpu, n: '03', t: 'Compute', d: 'Energy is integrated over true elapsed time, corrected for charger losses, and extrapolated to the full window.' },
  { icon: FileCheck2, n: '04', t: 'Certify', d: 'Once every quality gate passes, a signed, QR-verifiable certificate is issued on the spot.' },
]

export default function Home() {
  const reduce = useReducedMotion()
  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative isolate overflow-hidden bg-[oklch(0.22_0.04_255)] py-20 text-white md:py-28">
        <div aria-hidden className="pointer-events-none absolute -inset-x-24 -top-1/3 h-[130%] -z-10 opacity-70
          [background:radial-gradient(38%_44%_at_18%_22%,oklch(0.53_0.21_27/0.34),transparent_70%),radial-gradient(34%_40%_at_82%_68%,oklch(0.6_0.11_183/0.28),transparent_70%)]" />
        <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-amber uppercase">
              <span className="size-1.5 rounded-full bg-amber ring-3 ring-amber/25" />EV Battery Intelligence &amp; Certification
            </span>
            <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-[4.2rem] md:leading-[1.02]">
              The battery truth behind Ethiopia's electric future.
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg text-white/70">
              Independent, engineering-grade EV battery-health certification — built for the locked, imported fleet now filling the streets of Addis Ababa.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <BriefingModal trigger={<Button size="lg">Book a pilot briefing</Button>} />
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white hover:text-ink">
                <Link to="/verify">Verify a certificate</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/45">
              Part of RISIQ Group · in technology partnership with Eniris
            </p>
          </motion.div>

          {/* the product itself, not a stock photo */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[440px]">
            <div aria-hidden className="absolute -inset-8 -z-10 rounded-[2rem] bg-white/5 blur-2xl" />
            <motion.img
              src="img/certificate-risiq.png"
              alt="A RISIQ battery-health certificate: 94% state of health, Grade A, with a QR code for public verification"
              width={2000} height={2540}
              data-parallax="-6"
              animate={reduce ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.5)]" />
            <span className="absolute -bottom-3 -left-3 flex items-center gap-2 rounded-full border border-white/15 bg-[oklch(0.22_0.04_255)] px-4 py-2 font-mono text-xs text-teal shadow-lg">
              <QrCode className="size-3.5" />Scan to verify · &lt; 2 s
            </span>
          </motion.div>
        </div>

        <div className="mx-auto max-w-[1440px] px-6">
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

      {/* ------------------------------------------------ market context */}
      <Section className="py-16">
        <RevealGroup className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <motion.div key={s.v} variants={revealItem} className="bg-card p-7">
              <span className="block font-mono text-3xl font-semibold text-amber tabular md:text-4xl">{s.v}</span>
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
        <SectionHead eyebrow="The Blind Spot" title="For an EV, the odometer tells you almost nothing.">
          An electric motor has one moving part and can outlast the whole car. The battery cannot — and it is 40–50% of the vehicle's value. Same mileage, same price on paper, wildly different batteries.
        </SectionHead>
        <Reveal><OdometerProof /></Reveal>
      </Section>

      {/* ------------------------------------------------ audience router */}
      <Section>
        <SectionHead eyebrow="You Are" title="The institutions carrying Ethiopia's EV risk.">
          Every electric vehicle on an Addis road sits on somebody's balance sheet. The founding-cohort invitation is addressed to Ethiopia's leading banks, insurers and micro-finance institutions.
        </SectionHead>
        <RevealGroup className="grid gap-6 md:grid-cols-3">
          {AUDIENCE.map(({ icon: Icon, t, d, to }) => (
            <motion.div key={t} variants={revealItem}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl">
                <CardContent className="flex h-full flex-col">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-teal">{t}</h3>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{d}</p>
                  <Link to={to} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal">
                    More information
                    <span className="grid size-7 place-items-center rounded-full border transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-teal group-hover:text-white">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>
      </Section>

      <LogoMarquee />

      {/* ------------------------------------------------------ how it works */}
      <Section muted>
        <SectionHead eyebrow="How It Works" title="Fifteen minutes, at your site.">
          No OEM cooperation. No workshop downtime. A precision measurement, and a signed certificate.
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
            <SectionHead eyebrow="What We Issue" title="A certificate institutions can underwrite.">
              Every RISIQ test ends in one thing: a verifiable document that turns an invisible battery into a number you can lend against, insure, and sell on.
            </SectionHead>
            <ul className="grid gap-4">
              {[
                ['A measured State-of-Health %', 'Grounded in precision electrical measurement — not a figure the car reports about itself.'],
                ['Tamper-evident & signed', 'Cryptographically sealed. Edit the PDF and verification breaks.'],
                ['QR-verifiable in under 2 seconds', 'Anyone can scan and confirm against the public registry.'],
                ['Dispute-grade evidence', 'An independent, timestamped record for a default, a claim, or a resale disagreement.'],
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
