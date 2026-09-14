import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { QrCode, Search, ShieldCheck, Loader2, XCircle, Check, AlertTriangle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Section } from '@/components/Layout'
import { Reveal } from '@/components/Reveal'
import { cn } from '@/lib/utils'
import { CERTIFICATES, clamp, hashStr, mulberry32 } from '@/lib/data'

/* one hue, light→dark; validated for monotone lightness and light-end contrast */
const RAMP = ['#3cc4ae', '#1eab97', '#12897c', '#0d6b61', '#084f47']
const COLS = 12, ROWS = 8, CELLS = COLS * ROWS

const STEPS = [
  'Locating certificate in the registry',
  'Verifying issuer signature',
  'Confirming quality gates passed at issue',
  'Record verified',
]

/** Cells diverge as a pack ages, so spread widens as health falls. Values derive
 *  from the id, so one certificate always draws the same map. */
function cellMap(id: string, soh: number) {
  const rnd = mulberry32(hashStr(id))
  const spread = 1.1 + (100 - soh) * 0.13
  return Array.from({ length: CELLS }, () =>
    clamp(soh + (rnd() + rnd() + rnd() - 1.5) * spread, 35, 100))
}

export default function Verify() {
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState<'idle' | 'running' | 'done' | 'missing'>('idle')
  const [step, setStep] = useState(-1)
  const [cid, setCid] = useState('')
  const timers = useRef<number[]>([])

  const run = (raw: string) => {
    const id = raw.trim().toUpperCase()
    if (!id) return
    timers.current.forEach(clearTimeout); timers.current = []
    setCid(id); setStep(-1); setPhase('running')
    STEPS.forEach((_, i) => timers.current.push(
      window.setTimeout(() => setStep(i), 600 * (i + 1))))
    timers.current.push(window.setTimeout(
      () => setPhase(CERTIFICATES[id] ? 'done' : 'missing'), 600 * (STEPS.length + 0.4)))
  }

  const scan = () => {
    const ids = Object.keys(CERTIFICATES)
    const pick = ids[Math.floor(Math.random() * ids.length)]
    setQuery(pick); run(pick)
  }

  const cert = phase === 'done' ? CERTIFICATES[cid] : null

  return (
    <Section className="pt-14">
      <div className="mb-12 text-center">
        <span className="font-mono text-xs tracking-[0.16em] text-primary uppercase">Cryptographic transparency</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Live certificate <span className="text-gradient">verification engine</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[60ch] text-muted-foreground">
          Verify a battery-health report instantly against the public registry — by certificate ID, or by simulating a scan of the QR code printed on it.
        </p>
      </div>

      <Reveal>
        <div className="bg-grid rounded-3xl border p-6 md:p-10">
          <form className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border bg-card/80 p-2 backdrop-blur
            focus-within:border-primary/50 focus-within:ring-glow"
            onSubmit={(e) => { e.preventDefault(); run(query) }}>
            <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
            <label htmlFor="cert-id" className="sr-only">Certificate ID</label>
            <Input id="cert-id" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="RISIQ-0001" autoComplete="off" spellCheck={false}
              className="h-10 flex-1 border-0 bg-transparent font-mono focus-visible:ring-0" />
            <Button type="button" variant="ghost" size="icon" onClick={scan} title="Simulate QR scan">
              <QrCode /><span className="sr-only">Simulate QR scan</span>
            </Button>
            <Button type="submit">Verify now</Button>
          </form>
          <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
            Sample demos:{' '}
            {Object.entries(CERTIFICATES).map(([id, c], i, arr) => (
              <span key={id}>
                <button type="button" onClick={() => { setQuery(id); run(id) }}
                  className="cursor-pointer font-semibold text-primary underline-offset-4 hover:underline">
                  Grade {c.grade} ({id})
                </button>
                {i < arr.length - 1 && <span className="mx-2 text-border">|</span>}
              </span>
            ))}
          </p>
        </div>
      </Reveal>

      {phase !== 'idle' && (
        <ol className="mt-7 grid gap-2.5" aria-live="polite">
          {STEPS.map((s, i) => {
            const done = phase === 'done' || step > i
            const now = step === i && phase === 'running'
            const fail = phase === 'missing' && step === i
            return (
              <li key={s} className={cn('flex items-center gap-3 text-sm transition-colors',
                done || now ? 'text-foreground' : 'text-muted-foreground')}>
                <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2',
                  done && 'border-teal bg-teal text-white', fail && 'border-destructive bg-destructive text-white',
                  !done && !fail && 'border-border')}>
                  {done && <Check className="size-3" strokeWidth={3} />}
                  {fail && <XCircle className="size-3" />}
                  {now && <Loader2 className="size-3 animate-spin text-primary" />}
                </span>
                {s}
              </li>
            )
          })}
        </ol>
      )}

      {/* Keyed remount + CSS entry — a stalled Motion tween once left this card at opacity 0. */}
      {phase === 'missing' && (
        <div key={cid} className="animate-rise mt-7 rounded-xl border border-destructive/25 bg-destructive/5 p-6">
          <b className="block">No certificate found for “{cid}”</b>
          <p className="mt-1.5 text-sm text-muted-foreground">Check the ID printed under the QR code, or scan the code directly. Only certificates issued by RISIQ resolve here.</p>
        </div>
      )}
      {cert && <CertCard key={cid} id={cid} cert={cert} />}
    </Section>
  )
}

function CertCard({ id, cert }: { id: string; cert: typeof CERTIFICATES[string] }) {
  const soh = cert.stateOfHealth
  const cells = useMemo(() => cellMap(id, soh), [id, soh])
  const lo = Math.min(...cells), hi = Math.max(...cells)
  const weakest = cells.indexOf(lo)
  const [sel, setSel] = useState<number | null>(null)
  const idx = (v: number) => clamp(Math.floor(((v - lo) / (hi - lo || 1)) * RAMP.length), 0, RAMP.length - 1)

  return (
    <div className="animate-rise mt-7 grid gap-7 rounded-2xl border bg-gradient-to-br from-card to-muted/40 p-8 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-dashed pb-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-grade-a/30 bg-grade-a/10 px-3 py-1 font-mono text-[0.68rem] tracking-wider text-grade-a uppercase">
            <ShieldCheck className="size-3.5" />Signed &amp; verified
          </span>
          <h3 className="mt-3 text-2xl font-semibold">{cert.vehicle}</h3>
          <span className="mt-1.5 block font-mono text-sm text-muted-foreground">{id}</span>
        </div>
        <div className="grid justify-items-center gap-2.5">
          <span className="font-mono text-4xl font-semibold tabular">{soh}%</span>
          <Badge variant={cert.grade.toLowerCase() as 'a'}>Grade {cert.grade}</Badge>
        </div>
      </div>

      <dl className="grid gap-0">
        {([['Test type', cert.testType], ['Test date', cert.testDate],
           ['Usable capacity', `${cert.usableCapacityKwh} kWh`], ['Estimated range', `${cert.estimatedRangeKm} km`],
           ['Test location', cert.location], ['Registry status', cert.status]] as const).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b py-2.5 text-sm">
            <dt className="text-muted-foreground">{k}</dt><dd className="font-mono">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3">
        <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">Anomaly flags</span>
        {cert.flags.length === 0 ? (
          <p className="flex items-center gap-2.5 rounded-xl border border-grade-a/30 bg-grade-a/8 px-4 py-3 text-sm">
            <Check className="size-4 shrink-0 text-grade-a" strokeWidth={3} />
            <span><b>None raised.</b> <span className="text-muted-foreground">All four quality gates passed at issue with no cell, temperature or plausibility anomalies.</span></span>
          </p>
        ) : (
          <ul className="grid gap-2">
            {cert.flags.map((f) => (
              <li key={f.text} className={cn('flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm',
                f.level === 'warning' ? 'border-grade-d/30 bg-grade-d/8' : 'border-amber/30 bg-amber/8')}>
                {f.level === 'warning'
                  ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-grade-d" />
                  : <Info className="mt-0.5 size-4 shrink-0 text-amber" />}
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">Cell-level degradation</span>
          <span className="flex items-center gap-1">
            <small className="font-mono text-xs text-muted-foreground">{lo.toFixed(0)}%</small>
            {RAMP.map((c) => <i key={c} className="block h-2.5 w-5" style={{ background: c }} />)}
            <small className="font-mono text-xs text-muted-foreground">{hi.toFixed(0)}%</small>
          </span>
        </div>
        <div className="grid grid-cols-12 gap-1" role="img"
          aria-label={`${CELLS} cells span ${lo.toFixed(1)}% to ${hi.toFixed(1)}% state of health.`}>
          {cells.map((v, i) => (
            <motion.button key={i} type="button" onClick={() => setSel(sel === i ? null : i)}
              whileHover={{ scale: 1.22, zIndex: 1 }}
              className={cn('animate-pop aspect-square cursor-pointer rounded-[3px]',
                i === weakest && 'ring-2 ring-amber', sel === i && 'ring-2 ring-foreground')}
              style={{ background: RAMP[idx(v)], animationDelay: `${i * 6}ms` }}
              aria-label={`Cell ${i + 1}, ${v.toFixed(1)} percent`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {sel !== null
            ? <><b className="text-foreground">Cell {sel + 1}</b> — {cells[sel].toFixed(1)}% of nominal, module {Math.floor(sel / COLS) + 1} of {ROWS}.</>
            : <><b className="text-foreground">Weakest cell {weakest + 1}</b> at {lo.toFixed(1)}%, {(soh - lo).toFixed(1)} pp below pack average. Select any cell to inspect it.</>}
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border bg-muted/40 p-5">
        <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">Cryptographic status</span>
        <code className="font-mono text-xs break-all text-teal">
          sha256:{(hashStr(id + soh).toString(16) + hashStr(cert.vehicle).toString(16)).slice(0, 40)}
        </code>
        <ul className="grid gap-1.5 text-sm text-muted-foreground">
          {['Signature valid — issuer RISIQ EV Solutions',
            `Record unchanged since ${cert.testDate}`,
            'Any edit to a downloaded PDF breaks this signature'].map((l) => (
            <li key={l} className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-grade-a" strokeWidth={3} />{l}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
