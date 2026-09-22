import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Play, RotateCcw, Plug, Gauge, Sigma, FileSignature, Check, Wifi, WifiOff, Database, Cloud, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type Step = {
  icon: typeof Plug; at: string; title: string; blurb: string
  heading: string; detail: string; bullets: string[]
}
type Shared = Omit<Step, 'at'>
type Run = { label: string; minutes: number; window: number; band: string; source: string; steps: Step[] }

/* Four steps, the way the certificate is actually produced. */
/* Blurbs are written, not derived — splitting the detail on '.' once cut "Class 0.5S" to "A Class 0." */
const SHARED: Shared[] = [
  { icon: Plug, title: 'Plug in', blurb: 'The rig connects on the charge path itself — nothing is fitted to the car.', heading: 'Direct physical socket interface',
    detail: 'OBD dongles read a software estimate stored by the vehicle. RISIQ connects on the charge path itself and measures the electricity actually crossing into the pack, so nothing the car reports about itself can change the reading.',
    bullets: ['No dependence on OEM protocol authorisation.', 'Works on locked Chinese and Western EV models alike.'] },
  { icon: Gauge, title: 'Measure', blurb: 'A revenue-grade meter samples the energy flowing in, once a second.', heading: 'Revenue-grade measurement at 1 Hz',
    detail: 'A Class 0.5S meter samples voltage and current once a second across the charge window, while the vehicle’s own battery-computer data is collected wherever the car allows it — never required, never blocking.',
    bullets: ['Class 0.5S revenue-grade metering hardware.', 'Buffered locally, so a dropped link cannot void the run.'] },
  { icon: Sigma, title: 'Compute', blurb: 'Four quality gates, then the calibrated state of health.', heading: 'Gate, integrate, calibrate',
    detail: 'Four quality gates — charge window, data gaps, temperature band, plausibility — must all pass, or no certificate is issued. Delivered energy is then integrated over true elapsed time, corrected for charger losses, and the BMS reading is cross-checked against RISIQ’s calibrated database.',
    bullets: ['A failed gate produces no certificate, never a worse number.', 'The BMS figure is calibrated against what the socket measured.'] },
  { icon: FileSignature, title: 'Certify', blurb: 'A signed, QR-verifiable certificate is issued on the spot.', heading: 'Signed and published',
    detail: 'The record is cryptographically signed at issue and posted to the public registry. The QR code on the printed certificate resolves to that record, so a reader never has to trust the PDF in their hand.',
    bullets: ['Any edit to the document breaks verification.', 'Resolves publicly in under two seconds.'] },
]

const mk = (ats: string[]): Step[] => SHARED.map((s, i) => ({ ...s, at: ats[i] }))

const RUNS: Record<'rapid' | 'reference', Run> = {
  rapid: { label: 'Rapid Check', minutes: 15, window: 24.7, band: '±6.0%', source: 'DC 60 kW charger',
    steps: mk(['00:00', '03:00', '12:00', '15:00']) },
  reference: { label: 'Reference Test', minutes: 241, window: 46.0, band: '±3.0%', source: 'AC 7.2 kW wall box',
    steps: mk(['00:00', '00:05', '03:50', '04:01']) },
}

const clock = (mins: number) => {
  const s = Math.round(mins * 60)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`
}

/* Store-and-forward: the rig samples at 1 Hz into a local buffer and forwards
   to the cloud whenever a link exists. Cutting the link mid-run only grows the
   buffer; restoring it drains the backlog at CATCH_UP× the sample rate. The
   run itself never notices. */
const DUR = 5200, CATCH_UP = 4

function RunView({ run }: { run: Run }) {
  const reduce = useReducedMotion()
  const total = run.minutes * 60 // one sample per second
  const [progress, setProgress] = useState(1)
  const [synced, setSynced] = useState(total)
  const [online, setOnline] = useState(true)
  const [drops, setDrops] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [picked, setPicked] = useState<number | null>(0)
  const raf = useRef(0)
  const st = useRef({ synced: total, online: true, last: 0 })
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const play = () => {
    cancelAnimationFrame(raf.current)
    st.current = { synced: 0, online: true, last: 0 }
    setOnline(true); setDrops(0); setSynced(0)
    if (reduce) { setProgress(1); setSynced(total); return }
    setPlaying(true); setProgress(0); setPicked(null)
    let t0: number | null = null
    const tick = (ts: number) => {
      if (t0 === null) { t0 = ts; st.current.last = ts }
      const q = Math.min((ts - t0) / DUR, 1)
      const produced = q * total
      const dt = ((ts - st.current.last) / 1000) * (total / (DUR / 1000)); st.current.last = ts
      if (st.current.online) st.current.synced = Math.min(produced, st.current.synced + dt * CATCH_UP)
      setProgress(q); setSynced(st.current.synced)
      setPicked(Math.min(run.steps.length - 1, Math.floor(q * run.steps.length)))
      if (q < 1 || st.current.synced < produced) raf.current = requestAnimationFrame(tick); else setPlaying(false)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const toggleLink = () => {
    const next = !st.current.online
    st.current.online = next; setOnline(next)
    if (!next) setDrops((d) => d + 1)
  }

  const reached = Math.min(run.steps.length - 1, Math.floor(progress * run.steps.length))
  const active = picked ?? reached
  const step = run.steps[active]
  const Icon = step.icon
  const produced = Math.floor(progress * total)
  const buffered = Math.max(0, produced - Math.floor(synced))
  const done = progress >= 1 && buffered === 0 && !playing
  const NODES = [
    { icon: Gauge, k: 'Rig meter', v: produced, d: 'samples at 1 Hz' },
    { icon: Database, k: 'Local buffer', v: buffered, d: buffered ? 'held until the link returns' : 'empty' },
    { icon: Cloud, k: 'Cloud analytics', v: Math.floor(synced), d: 'received' },
  ]

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg border bg-muted px-3 py-1.5 font-mono text-sm tabular">{clock(run.minutes * progress)}</span>
          <span className="text-sm text-muted-foreground">of {clock(run.minutes)} · {run.source}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={toggleLink} disabled={!playing} size="sm" variant={online ? 'outline' : 'default'} aria-pressed={!online}>
            {online ? <><WifiOff />Simulate cellular network drop</> : <><Wifi />Restore the network</>}
          </Button>
          <Button onClick={play} disabled={playing} size="sm">
            {playing ? <><RotateCcw className="animate-spin" />Running…</> : <><Play />Play the run</>}
          </Button>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full border bg-muted">
        <motion.i className="block h-full rounded-full bg-gradient-to-r from-primary to-chart-3"
          animate={{ width: `${progress * 100}%` }} transition={{ duration: reduce ? 0 : 0.12, ease: 'linear' }} />
      </div>

      {/* clickable phase cards — 01 Plug in → 02 Measure → 03 Compute → 04 Certify */}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {run.steps.map((s, i) => {
          const done = progress > 0 && i <= reached
          const on = i === active
          const StepIcon = s.icon
          return (
            <li key={s.title}>
              <button type="button" onClick={() => setPicked(i)} aria-pressed={on}
                className={cn('h-full w-full cursor-pointer rounded-xl border p-4 text-left transition-all duration-300',
                  on ? 'border-primary bg-primary/10 ring-glow' : 'bg-card/60 hover:border-primary/40 hover:-translate-y-0.5')}>
                <div className="flex items-center justify-between">
                  <span className={cn('font-mono text-[0.66rem] tracking-wider uppercase', on ? 'text-primary' : 'text-muted-foreground')}>
                    {String(i + 1).padStart(2, '0')} · {s.at}
                  </span>
                  {done && !on ? <Check className="size-3.5 text-primary" strokeWidth={3} /> : <StepIcon className={cn('size-3.5', on ? 'text-primary' : 'text-muted-foreground')} />}
                </div>
                <b className={cn('mt-2 block text-base leading-tight', on ? 'text-foreground' : 'text-muted-foreground')}>{s.title}</b>
                <small className="mt-1.5 block text-xs text-muted-foreground">{s.blurb}</small>
              </button>
            </li>
          )
        })}
      </ol>

      {/* store-and-forward telemetry strip: rig → buffer → cloud */}
      <div className={cn('grid items-stretch gap-3 rounded-2xl border p-4 transition-colors duration-300 lg:grid-cols-[1fr_auto_1fr_auto_1fr]',
        !online ? 'border-destructive/40 bg-destructive/5' : buffered ? 'border-amber/40 bg-amber/6' : 'bg-card/40')}>
        {NODES.map((n, i) => {
          const NodeIcon = n.icon
          const hot = i === 1 && buffered > 0
          return (
            <div key={n.k} className="contents">
              <div className={cn('rounded-xl border p-4 transition-colors duration-300', hot ? 'border-amber bg-amber/10' : 'bg-card/70')}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.62rem] tracking-[0.13em] text-muted-foreground uppercase">{n.k}</span>
                  <NodeIcon className={cn('size-4', hot ? 'text-amber' : i === 2 && !online ? 'text-muted-foreground' : 'text-teal')} />
                </div>
                <b className={cn('mt-1.5 block font-mono text-2xl tabular', hot ? 'text-amber' : 'text-foreground')}>{n.v.toLocaleString()}</b>
                <small className="block text-xs text-muted-foreground">{n.d}</small>
              </div>
              {i < 2 && (
                <div className="hidden items-center lg:flex" aria-hidden>
                  <ArrowRight className={cn('size-5 transition-colors', i === 1 && !online ? 'text-destructive' : 'text-teal')} />
                </div>
              )}
            </div>
          )
        })}
        <p className="flex items-center gap-2.5 text-sm lg:col-span-5">
          {!online ? <WifiOff className="size-4 shrink-0 text-destructive" /> : done ? <Check className="size-4 shrink-0 text-grade-a" strokeWidth={3} /> : <Wifi className="size-4 shrink-0 text-teal" />}
          <span>
            {!online && <><b>Link down.</b> The meter keeps sampling; {buffered.toLocaleString()} samples are timestamped and held on the rig.</>}
            {online && buffered > 0 && <><b>Link restored.</b> Forwarding the backlog — {buffered.toLocaleString()} samples still to send.</>}
            {online && buffered === 0 && playing && <><b>Streaming live.</b> Cut the network at any point to see what happens.</>}
            {online && buffered === 0 && !playing && !done && <><b>Ready.</b> Play the run, then simulate a network drop mid-test.</>}
            {done && <><b>Complete.</b> {total.toLocaleString()} of {total.toLocaleString()} samples in the cloud{drops ? ` after ${drops} ${drops === 1 ? 'drop' : 'drops'}` : ''} — the quality gates run on the full series, not on what happened to arrive.</>}
          </span>
        </p>
      </div>

      {/* Active phase detail. Keyed so React remounts it on change, animated with
          CSS rather than AnimatePresence: mode="wait" holds the new panel back
          until the exit tween finishes, so a stalled loop leaves stale content. */}
      <div key={active} className="animate-rise rounded-2xl border bg-card/60 p-7">
        <span className="font-mono text-[0.68rem] tracking-[0.14em] text-primary uppercase">
          Step {String(active + 1).padStart(2, '0')} · {step.title}
        </span>
        <div className="mt-3 flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><Icon className="size-5" /></span>
          <div>
            <h4 className="text-xl font-semibold">{step.heading}</h4>
            <p className="mt-2.5 max-w-[70ch] text-sm text-muted-foreground">{step.detail}</p>
            <ul className="mt-4 grid gap-2">
              {step.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={3} />{b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: 'Duration', v: run.minutes < 60 ? `${run.minutes} min` : `${(run.minutes / 60).toFixed(1)} h`, d: run.source },
          { k: 'Measured window', v: `${run.window.toFixed(1)} pp`, d: 'of charge actually observed' },
          { k: 'Confidence band', v: run.band, d: run.band === '±3.0%' ? 'reference accuracy' : 'model-mapped' },
        ].map((f) => (
          <div key={f.k} className="rounded-xl border bg-card/60 p-4">
            <span className="font-mono text-[0.66rem] tracking-[0.13em] text-muted-foreground uppercase">{f.k}</span>
            <b className="mt-2 block font-mono text-2xl text-gradient tabular">{f.v}</b>
            <small className="mt-1 block text-xs text-muted-foreground">{f.d}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TestVisualizer() {
  return (
    <Card className="bg-card/50">
      <CardContent>
        <Tabs defaultValue="rapid">
          <TabsList className="flex-wrap">
            <TabsTrigger value="rapid">Rapid Check · 15 min</TabsTrigger>
            <TabsTrigger value="reference">Reference Test · 4 h</TabsTrigger>
          </TabsList>
          <TabsContent value="rapid"><RunView run={RUNS.rapid} /></TabsContent>
          <TabsContent value="reference"><RunView run={RUNS.reference} /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
