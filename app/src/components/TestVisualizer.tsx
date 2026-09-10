import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Play, RotateCcw, Plug, Gauge, ShieldCheck, Sigma, FileSignature } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type RunKey = 'rapid' | 'reference'

const RUNS: Record<RunKey, {
  label: string; minutes: number; window: number; band: string; source: string
  steps: { icon: typeof Plug; title: string; detail: string }[]
}> = {
  rapid: {
    label: 'Rapid Check', minutes: 15, window: 24.7, band: '±6.0%', source: 'DC 60 kW charger',
    steps: [
      { icon: Plug, title: 'Rig in line at the socket', detail: 'Between the charge source and the vehicle inlet.' },
      { icon: Gauge, title: 'Partial-window charge', detail: '24.7 pp of charge observed at 1 Hz.' },
      { icon: ShieldCheck, title: 'Four quality gates', detail: 'Window, data gaps, temperature, plausibility.' },
      { icon: Sigma, title: 'Model-mapped to full SoH', detail: 'Mapped against the Ethiopian reference dataset.' },
      { icon: FileSignature, title: 'Sign & publish', detail: 'Signed record posted to the public registry.' },
    ],
  },
  reference: {
    label: 'Reference Test', minutes: 241, window: 46.0, band: '±3.0%', source: 'AC 7.2 kW wall box',
    steps: [
      { icon: Plug, title: 'Rig in line at the socket', detail: 'Between the charge source and the vehicle inlet.' },
      { icon: Gauge, title: 'Full-window controlled charge', detail: '46.0 pp of charge observed end to end.' },
      { icon: ShieldCheck, title: 'Four quality gates', detail: 'Window, data gaps, temperature, plausibility.' },
      { icon: Sigma, title: 'Integrate & extrapolate', detail: 'Energy integrated, charger losses corrected.' },
      { icon: FileSignature, title: 'Sign & publish', detail: 'Signed record posted to the public registry.' },
    ],
  },
}

const clock = (mins: number) => {
  const s = Math.round(mins * 60)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`
}

function Run({ run }: { run: (typeof RUNS)[RunKey] }) {
  const reduce = useReducedMotion()
  const [progress, setProgress] = useState(1)
  const [playing, setPlaying] = useState(false)
  const raf = useRef(0)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const play = () => {
    cancelAnimationFrame(raf.current)
    if (reduce) { setProgress(1); return }
    setPlaying(true); setProgress(0)
    let t0: number | null = null
    const DUR = 4200
    const tick = (ts: number) => {
      if (t0 === null) t0 = ts
      const q = Math.min((ts - t0) / DUR, 1)
      setProgress(q)
      if (q < 1) raf.current = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    raf.current = requestAnimationFrame(tick)
  }

  const stage = Math.min(run.steps.length - 1, Math.floor(progress * run.steps.length))

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tabular rounded-lg border bg-muted px-3 py-1.5">
            {clock(run.minutes * progress)}
          </span>
          <span className="text-sm text-muted-foreground">of {clock(run.minutes)}</span>
        </div>
        <Button onClick={play} disabled={playing} size="sm">
          {playing ? <><RotateCcw className="animate-spin" />Running…</> : <><Play />Play the run</>}
        </Button>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full border bg-muted">
        <motion.i
          className="block h-full bg-gradient-to-r from-primary to-amber"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: reduce ? 0 : 0.12, ease: 'linear' }}
        />
      </div>

      <ol className="grid gap-3 md:grid-cols-5">
        {run.steps.map((s, i) => {
          const on = progress > 0 && i <= stage
          const Icon = s.icon
          return (
            <li key={s.title}
              className={cn('rounded-xl border p-4 transition-colors duration-300',
                on ? 'border-primary/30 bg-primary/5' : 'bg-card')}>
              <span className={cn('grid size-9 place-items-center rounded-lg transition-colors duration-300',
                on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                <Icon className="size-4" />
              </span>
              <b className={cn('mt-3 block text-sm leading-tight transition-colors',
                on ? 'text-foreground' : 'text-muted-foreground')}>{s.title}</b>
              <small className="mt-1.5 block text-xs text-muted-foreground">{s.detail}</small>
            </li>
          )
        })}
      </ol>

      <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
        {[
          { k: 'Duration', v: run.minutes < 60 ? `${run.minutes} min` : `${(run.minutes / 60).toFixed(1)} h`, s: run.source },
          { k: 'Measured window', v: `${run.window.toFixed(1)} pp`, s: 'of charge observed' },
          { k: 'Confidence band', v: run.band, s: run.band === '±3.0%' ? 'reference accuracy' : 'model-mapped' },
        ].map((f) => (
          <div key={f.k} className="bg-card p-4">
            <span className="block text-xs text-muted-foreground">{f.k}</span>
            <b className="mt-1.5 block font-mono text-lg tabular">{f.v}</b>
            <small className="mt-0.5 block text-xs text-muted-foreground">{f.s}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TestVisualizer() {
  return (
    <Card>
      <CardContent>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Fifteen minutes, or four hours?</h3>
            <p className="mt-2 max-w-[62ch] text-sm text-muted-foreground">
              Both end in the same signed certificate. What differs is how much of the charge window RISIQ actually watched — and therefore how tight the confidence band can honestly be.
            </p>
          </div>
          <Badge variant="outline" className="border-teal/30 text-teal">Socket-side · any brand</Badge>
        </div>
        <Tabs defaultValue="rapid">
          <TabsList>
            <TabsTrigger value="rapid">Rapid Check</TabsTrigger>
            <TabsTrigger value="reference">Reference Test</TabsTrigger>
          </TabsList>
          <TabsContent value="rapid"><Run run={RUNS.rapid} /></TabsContent>
          <TabsContent value="reference"><Run run={RUNS.reference} /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
