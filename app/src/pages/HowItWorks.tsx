import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Plug, ScanLine, Cpu, FileCheck2, CircuitBoard, WifiOff, Check, X, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Section, SectionHead } from '@/components/Layout'
import { Reveal, RevealGroup, revealItem } from '@/components/Reveal'
import { TestVisualizer } from '@/components/TestVisualizer'
import { SocketSimulator } from '@/components/SocketSimulator'
import { ArchitectureVisualizer } from '@/components/ArchitectureVisualizer'
import { cn } from '@/lib/utils'

const STEPS = [
  { icon: Plug, n: '01', t: 'Plug in', d: 'An operator connects the rig at a workshop, importer yard or fleet depot — in line between the charge source and the vehicle socket. Nothing is installed on the car.' },
  { icon: ScanLine, n: '02', t: 'Measure', d: 'A Class 0.5S revenue-grade meter samples voltage and current at 1 Hz on the charge path, while an opportunistic OBD logger reads whatever standard PIDs the vehicle happens to expose.' },
  { icon: Cpu, n: '03', t: 'Compute', d: 'The cloud integrates delivered power over true elapsed time, corrects for charger conversion losses, and extrapolates usable capacity from the measured state-of-charge window.' },
  { icon: FileCheck2, n: '04', t: 'Certify', d: 'Once the result clears every quality gate, a signed, QR-verifiable certificate is issued on the spot — capacity, range, grade and confidence band included.' },
]

const GATES = [
  'State-of-charge window ≥ 10 percentage points for a reference test.',
  'No unexplained gaps greater than 5 seconds in the integrated series.',
  'Pack and ambient temperature inside a defined valid band, or flagged.',
  'Computed state of health within a plausible 40–105%, else routed to manual review.',
]

export default function HowItWorks() {
  return (
    <>
      <Section className="pt-14">
        <Reveal>
          <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-amber uppercase">
            <span className="size-1.5 rounded-full bg-amber ring-3 ring-amber/20" />How It Works
          </span>
          <h1 className="mt-5 max-w-[17ch] text-4xl font-bold tracking-tight md:text-6xl">
            Fifteen minutes, at your site — and it works offline.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg text-muted-foreground">
            RISIQ measures the real electricity flowing into the battery at the charging socket. No OBD unlock, no manufacturer cooperation, no workshop downtime.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {['Fast test ≈ 15 min', 'Reference accuracy ≤ 3%', 'Verification < 2 s', '0% data loss on network drop'].map((p) => (
              <Badge key={p} variant="outline" className="px-3 py-1.5">{p}</Badge>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section muted className="pt-0">
        <SectionHead eyebrow="The Process" title="Four steps, one certificate." />
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
      </Section>

      <Section>
        <SectionHead eyebrow="Why Socket-Side, Not BMS-Reported" title="Many locked imports report a number no one can check.">
          A BMS-reported figure is opaque, vendor-defined and frequently optimistic. Measuring real delivered energy at the connector gives an independent, physically grounded number — the one a bank or insurer can actually underwrite.
        </SectionHead>
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <Card className="h-full border-destructive/25 bg-destructive/5">
              <CardContent>
                <span className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive"><CircuitBoard className="size-5" /></span>
                <h3 className="mt-4 text-lg font-semibold">Reading the car's computer</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The common method asks the battery's own computer over the OBD port. That computer can read optimistically — or be reset to hide damage — and Chinese EVs encrypt it. No password, no reading.
                </p>
                <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-destructive">
                  <X className="size-4" strokeWidth={3} />Blind on Ethiopia's locked imports
                </span>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card className="h-full border-teal/25 bg-teal/5">
              <CardContent>
                <span className="grid size-10 place-items-center rounded-xl bg-teal/10 text-teal"><ScanLine className="size-5" /></span>
                <h3 className="mt-4 text-lg font-semibold">Measuring the electricity</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  RISIQ runs a controlled charge at the socket and measures the real energy flowing in with a precision meter. Electricity behaves the same in every car — so the test works on any locked, imported EV.
                </p>
                <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-teal">
                  <Check className="size-4" strokeWidth={3} />Works on every EV — no OEM access
                </span>
              </CardContent>
            </Card>
          </Reveal>
        </div>
        <Reveal className="mt-8"><SocketSimulator /></Reveal>
      </Section>

      <Section>
        <SectionHead eyebrow="The Three Pieces" title="What actually makes up the service.">
          One portable unit, one analysis engine, and a code your customer can check. Switch between them to see how each part works.
        </SectionHead>
        <Reveal><ArchitectureVisualizer /></Reveal>
      </Section>

      <Section muted>
        <SectionHead eyebrow="Watch A Test Run" title="A real certification run, end to end.">
          Play either test to see exactly what the 15-minute Rapid Check trades away against a full Reference Test.
        </SectionHead>
        <Reveal><TestVisualizer /></Reveal>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHead eyebrow="Quality Gates" title="Every result must earn its certificate.">
              A run that fails any gate does not quietly produce a worse number — it produces no certificate at all, and is routed to manual review.
            </SectionHead>
            <ul className="grid gap-4">
              {GATES.map((g) => (
                <li key={g} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-muted-foreground">{g}</span>
                </li>
              ))}
            </ul>
            <p className={cn('mt-8 flex items-start gap-3 rounded-xl border p-5 text-sm text-muted-foreground')}>
              <WifiOff className="mt-0.5 size-5 shrink-0 text-teal" />
              <span><b className="text-foreground">Built for Addis.</b> The rig buffers telemetry locally and forwards it once the link returns. Full offline operation with zero data loss is a design requirement, not an afterthought.</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border bg-card p-4 shadow-xl" data-parallax="-4">
              <img src="img/certificate-risiq.png" width={2000} height={2540} loading="lazy"
                alt="A RISIQ certificate showing state of health, usable capacity, estimated range, grade and a QR code"
                className="w-full rounded-xl" />
            </div>
            <Button asChild className="mt-6 w-full"><Link to="/verify"><QrCode />Verify a certificate live</Link></Button>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
