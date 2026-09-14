import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Play, RotateCcw, Plug, Gauge, ShieldCheck, Sigma, FileSignature, Check, Wifi, WifiOff, Database, Cloud, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type Step = {
  icon: typeof Plug; at: string; title: string; blurb: string
  heading: string; detail: string; bullets: string[]
}
type Run = { label: string; minutes: number; window: number; band: string; source: string; steps: Step[] }

const SHARED: Omit<Step, 'at' | 'blurb'>[] = [
  { icon: Plug, title: 'Direct socket hookup', heading: 'Direct physical socket interface',
    detail: 'OBD dongles read a software estimate stored by the vehicle. RISIQ connects on the charge path itself and measures the electricity actually crossing into the pack, so nothing the car reports about itself can change the reading.',
    bullets: ['No dependence on OEM protocol authorisation.', 'Works on locked Chinese and Western EV models alike.'] },
  { icon: Gauge, title: 'Controlled charge', heading: 'Revenue-grade measurement at 1 Hz',
    detail: 'A Class 0.5S meter samples voltage and current once a second across the charge window, while an opportunistic OBD logger reads whatever standard PIDs the vehicle happens to expose — never required, never blocking.',
    bullets: ['Class 0.5S revenue-grade metering hardware.', 'Buffered locally, so a dropped link cannot void the run.'] },
  { icon: ShieldCheck, title: 'Quality gates', heading: 'Four gates, all must pass',
    detail: 'A run that fails any gate does not silently produce a worse number — it produces no certificate at all and is routed to manual review.',
    bullets: ['Charge window, data gaps, temperature band, plausibility.', 'Failures are surfaced, never smoothed over.'] },
  { icon: Sigma, title: 'Compute state of health',
    heading: 'Integrate, correct, extrapolate',
    detail: 'Delivered energy is integrated over true elapsed time, corrected for charger conversion losses, then extrapolated from the measured state-of-charge window to full usable capacity.',
    bullets: ['Charger losses corrected, not assumed away.', 'Confidence band widens honestly on a partial window.'] },
  { icon: FileSignature, title: 'Certificate generation', heading: 'Signed and published',
    detail: 'The record is cryptographically signed at issue and posted to the public registry. The QR code on the printed certificate resolves to that record, so a reader never has to trust the PDF in their hand.',
    bullets: ['Any edit to the document breaks verification.', 'Resolves publicly in under two seconds.'] },
]

const mk = (ats: string[]): Step[] =>
  SHARED.map((s, i) => ({ ...s, at: ats[i], blurb: s.detail.split('.')[0] + '.' }))

const RUNS: Record<'rapid' | 'reference', Run> = {
  rapid: { label: 'Rapid Check', minutes: 15, window: 24.7, band: '±6.0%', source: 'DC 60 kW charger',
    steps: mk(['00:00', '03:00', '10:00', '13:00', '15:00']) },
  reference: { label: 'Reference Test', minutes: 241, window: 46.0, band: '±3.0%', source: 'AC 7.2 kW wall box',
    steps: mk(['00:00', '00:05', '03:40', '03:55', '04:01']) },
}

const clock = (mins: number) => {
  const s = Math.round(mins * 60)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`
}

function RunView({ run }: { run: Run }) {
  const reduce = useReducedMotion()
  const [progress, setProgress] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [picked, setPicked] = useState<number | null>(0)
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const play = () => {
    cancelAnimationFrame(raf.current)
    if (reduce) { setProgress(1); return }
    setPlaying(true); setProgress(0); setPicked(null)
    let t0: number | null = null
    const DUR = 5200
    const tick = (ts: number) => {
      if (t0 === null) t0 = ts
      const q = Math.min((ts - t0) / DUR, 1)
      setProgress(q)
      setPicked(Math.min(run.steps.length - 1, Math.floor(q * run.steps.length)))
      if (q < 1) raf.current = requestAnimationFrame(tick); else setPlaying(false)
    }
    raf.current = requestAnimationFrame(tick)
  }

  const reached = Math.min(run.steps.length - 1, Math.floor(progress * run.steps.length))
  const active = picked ?? reached
  const step = run.steps[active]
  const Icon = step.icon

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg border bg-muted px-3 py-1.5 font-mono text-sm tabular">{clock(run.minutes * progress)}</span>
          <span className="text-sm text-muted-foreground">of {clock(run.minutes)} · {run.source}</span>
        </div>
        <Button onClick={play} disabled={playing} size="sm">
          {playing ? <><RotateCcw className="animate-spin" />Running…</> : <><Play />Play the run</>}
        </Button>
      </div>

      <div className="h-2 overflow-hidden rounded-full border bg-muted">
        <motion.i className="block h-full rounded-full bg-gradient-to-r from-primary to-chart-3"
          animate={{ width: `${progress * 100}%` }} transition={{ duration: reduce ? 0 : 0.12, ease: 'linear' }} />
      </div>

      {/* clickable phase cards */}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {run.steps.map((s, i) => {
          const done = progress > 0 && i <= reached
          const on = i === active
          return (
            <li key={s.title}>
              <button type="button" onClick={() => setPicked(i)} aria-pressed={on}
                className={cn('h-full w-full cursor-pointer rounded-xl border p-4 text-left transition-all duration-300',
                  on ? 'border-primary bg-primary/10 ring-glow' : 'bg-card/60 hover:border-primary/40 hover:-translate-y-0.5')}>
                <div className="flex items-center justify-between">
                  <span className={cn('font-mono text-[0.66rem] tracking-wider uppercase',
                    on ? 'text-primary' : 'text-muted-foreground')}>
                    Step {String(i + 1).padStart(2, '0')} ({s.at})
                  </span>
                  {done && !on && <Check className="size-3.5 text-primary" strokeWidth={3} />}
                </div>
                <b className={cn('mt-2 block text-sm leading-tight', on ? 'text-foreground' : 'text-muted-foreground')}>{s.title}</b>
                <small className="mt-1.5 block text-xs text-muted-foreground">{s.blurb}</small>
              </button>
            </li>
          )
        })}
      </ol>

      {/* Active phase detail. Keyed so React remounts it on change, animated with
          CSS rather than AnimatePresence: mode="wait" holds the new panel back
          until the exit tween finishes, so a stalled loop leaves stale content. */}
      <div key={active} className="animate-rise rounded-2xl border bg-card/60 p-7">
          <span className="font-mono text-[0.68rem] tracking-[0.14em] text-primary uppercase">
            Active phase: step {String(active + 1).padStart(2, '0')}
          </span>
          <div className="mt-3 flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              <Icon className="size-5" />
            </span>
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

/* Store-and-forward: the rig samples at 1 Hz into a local buffer and forwards
   to the cloud whenever a link exists. Cutting the link mid-run only grows the
   buffer; restoring it drains the backlog. The run itself never notices. */
const RUN_S = 15 * 60, DUR = 12_000, CATCH_UP = 4 /* backlog drains at 4× the sample rate */

function OfflineView() {
  const reduce = useReducedMotion()
  const [t, setT] = useState(0)          // simulated seconds elapsed
  const [synced, setSynced] = useState(0)
  const [online, setOnline] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [drops, setDrops] = useState(0)
  const raf = useRef(0)
  const state = useRef({ t: 0, synced: 0, online: true, last: 0 })
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const play = () => {
    cancelAnimationFrame(raf.current)
    state.current = { t: 0, synced: 0, online: true, last: 0 }
    setT(0); setSynced(0); setOnline(true); setDrops(0)
    if (reduce) { setT(RUN_S); setSynced(RUN_S); return }
    setPlaying(true)
    const tick = (ts: number) => {
      const st = state.current
      if (!st.last) st.last = ts
      const dt = (ts - st.last) / 1000 * (RUN_S / (DUR / 1000)); st.last = ts
      st.t = Math.min(RUN_S, st.t + dt)
      if (st.online) st.synced = Math.min(st.t, st.synced + dt * CATCH_UP)
      setT(st.t); setSynced(st.synced)
      if (st.t < RUN_S || st.synced < st.t) raf.current = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const toggle = () => {
    const next = !state.current.online
    state.current.online = next; setOnline(next)
    if (!next) setDrops((d) => d + 1)
  }

  const produced = Math.floor(t)
  const buffered = Math.max(0, produced - Math.floor(synced))
  const done = t >= RUN_S && buffered === 0
  const NODES = [
    { icon: Gauge, k: 'Rig meter', v: produced, d: 'samples at 1 Hz' },
    { icon: Database, k: 'Local buffer', v: buffered, d: buffered ? 'held until link returns' : 'empty' },
    { icon: Cloud, k: 'Cloud analytics', v: Math.floor(synced), d: 'received' },
  ]

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg border bg-muted px-3 py-1.5 font-mono text-sm tabular">{clock(t / 60)}</span>
          <span className="text-sm text-muted-foreground">of {clock(15)} · Rapid Check, DC 60 kW</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={toggle} disabled={!playing} size="sm" variant={online ? 'outline' : 'default'}>
            {online ? <><WifiOff />Cut the network</> : <><Wifi />Restore the network</>}
          </Button>
          <Button onClick={play} disabled={playing} size="sm">
            {playing ? <><RotateCcw className="animate-spin" />Running…</> : <><Play />Play the run</>}
          </Button>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full border bg-muted">
        <motion.i className="block h-full rounded-full bg-gradient-to-r from-primary to-chart-3"
          animate={{ width: `${(t / RUN_S) * 100}%` }} transition={{ duration: reduce ? 0 : 0.12, ease: 'linear' }} />
      </div>

      <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {NODES.map((n, i) => {
          const Icon = n.icon
          const hot = i === 1 && buffered > 0
          return (
            <div key={n.k} className="contents">
              <div className={cn('rounded-xl border p-5 transition-colors duration-300',
                hot ? 'border-amber bg-amber/8' : 'bg-card/60')}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.66rem] tracking-[0.13em] text-muted-foreground uppercase">{n.k}</span>
                  <Icon className={cn('size-4', hot ? 'text-amber' : 'text-primary')} />
                </div>
                <b className={cn('mt-2 block font-mono text-3xl tabular', hot ? 'text-amber' : 'text-gradient')}>{n.v.toLocaleString()}</b>
                <small className="mt-1 block text-xs text-muted-foreground">{n.d}</small>
              </div>
              {i < 2 && (
                <div className="hidden items-center lg:flex" aria-hidden>
                  <ArrowRight className={cn('size-5 transition-colors', i === 1 && !online ? 'text-destructive' : 'text-muted-foreground')} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={cn('flex flex-wrap items-center gap-3 rounded-xl border px-5 py-4 text-sm transition-colors duration-300',
        !online ? 'border-destructive/40 bg-destructive/5' : done ? 'border-grade-a/40 bg-grade-a/8' : 'bg-card/60')}>
        {!online ? <WifiOff className="size-4 shrink-0 text-destructive" /> : done ? <Check className="size-4 shrink-0 text-grade-a" strokeWidth={3} /> : <Wifi className="size-4 shrink-0 text-teal" />}
        <span>
          {!online && <><b>Link down.</b> The meter keeps sampling; {buffered.toLocaleString()} samples are timestamped and held on the rig.</>}
          {online && buffered > 0 && <><b>Link restored.</b> Forwarding the backlog — {buffered.toLocaleString()} samples still to send.</>}
          {online && buffered === 0 && !done && t > 0 && <><b>Streaming live.</b> Cut the network at any point to see what happens.</>}
          {online && t === 0 && <><b>Ready.</b> Play the run, then cut the network mid-test.</>}
          {done && <><b>Complete.</b> {RUN_S.toLocaleString()} of {RUN_S.toLocaleString()} samples in the cloud{drops ? ` after ${drops} ${drops === 1 ? 'drop' : 'drops'}` : ''} — the quality gates run on the full series, not on what happened to arrive.</>}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: 'Timestamped where', v: 'On the rig', d: 'its own clock, not the network’s' },
          { k: 'Buffer capacity', v: '> 24 h', d: 'of 1 Hz samples, local flash' },
          { k: 'Effect on the result', v: 'None', d: 'a drop never voids a run' },
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
            <TabsTrigger value="rapid">Rapid Check</TabsTrigger>
            <TabsTrigger value="reference">Reference Test</TabsTrigger>
            <TabsTrigger value="offline"><WifiOff />Network drop</TabsTrigger>
          </TabsList>
          <TabsContent value="rapid"><RunView run={RUNS.rapid} /></TabsContent>
          <TabsContent value="reference"><RunView run={RUNS.reference} /></TabsContent>
          <TabsContent value="offline"><OfflineView /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
