import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ExternalLink, AlertTriangle, Info, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CellHeatmap } from '@/components/CellHeatmap'
import { SohGauge } from '@/components/HeroCertificate'
import { CERTIFICATES } from '@/lib/data'
import { Benchmark } from '@/components/Benchmark'
import { cn } from '@/lib/utils'
import { useTilt } from '@/lib/useTilt'

const IDS = Object.keys(CERTIFICATES)

/** Full-screen certificate inspector: switch between the three sample
 *  certificates and hover the cell map. Opened from the hero CTA. */
export function CertificateInspector({ trigger, open, onOpenChange }: {
  trigger?: ReactNode; open?: boolean; onOpenChange?: (o: boolean) => void
}) {
  const [id, setId] = useState(IDS[0])
  const cert = CERTIFICATES[id]
  const tilt = useTilt({ max: 7 })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="h-[min(92dvh,900px)] w-[min(96vw,1240px)] max-w-none overflow-y-auto p-0 md:p-0">
        <div className="grid gap-8 p-6 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4 pr-10">
            <div>
              <span className="font-mono text-xs tracking-[0.16em] text-primary uppercase">Certificate inspector</span>
              <DialogTitle className="mt-2 text-2xl font-semibold md:text-3xl">What a RISIQ certificate contains.</DialogTitle>
              <DialogDescription className="mt-2 max-w-[60ch]">
                Three sample records from the registry. Hover the cell map to read individual cells; click to pin one.
              </DialogDescription>
            </div>
            <div className="grid gap-3">
              {/* live diagnostic rail — the chrome a bench instrument would show */}
              <ul className="flex flex-wrap items-center gap-2">
                {([['Registry online', 'grade-a'], ['Signature valid', 'grade-a'], ['Calibrated', 'teal']] as const).map(([t, tone]) => (
                  <li key={t} className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6rem] tracking-wider uppercase',
                    tone === 'teal' ? 'border-teal/30 bg-teal/10 text-teal' : 'border-grade-a/30 bg-grade-a/10 text-grade-a')}>
                    <span className="relative grid size-1.5 place-items-center">
                      <span className={cn('absolute inset-0 rounded-full motion-safe:animate-ping', tone === 'teal' ? 'bg-teal/70' : 'bg-grade-a/70')} />
                      <span className={cn('size-1.5 rounded-full', tone === 'teal' ? 'bg-teal' : 'bg-grade-a')} />
                    </span>{t}
                  </li>
                ))}
              </ul>
              <div role="tablist" aria-label="Sample certificate" className="flex gap-1 rounded-full border bg-muted p-1 justify-self-end">
              {IDS.map((x) => (
                <button key={x} role="tab" type="button" aria-selected={x === id} onClick={() => setId(x)}
                  className={cn('cursor-pointer rounded-full px-3.5 py-1.5 font-mono text-xs transition-all',
                    x === id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  Grade {CERTIFICATES[x].grade}
                </button>
              ))}
              </div>
            </div>
          </div>

          {/* keyed so the gauge re-counts and the map re-pops for each sample */}
          <div key={id} className="animate-rise grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div {...tilt.bind}
              className={cn('relative grid content-start gap-6 rounded-2xl border bg-gradient-to-br from-card to-muted/40 p-6 shadow-xl',
                tilt.active && '[transform-style:preserve-3d]')}>
              {tilt.glare && <motion.span aria-hidden style={{ background: tilt.glare }} className="pointer-events-none absolute inset-0 z-10 rounded-2xl mix-blend-overlay" />}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-grade-a/30 bg-grade-a/10 px-3 py-1 font-mono text-[0.68rem] tracking-wider text-grade-a uppercase">
                    <ShieldCheck className="size-3.5" />Signed &amp; verified
                  </span>
                  <h3 className="mt-3 text-xl font-semibold">{cert.vehicle}</h3>
                  <span className="mt-1 block font-mono text-sm text-muted-foreground">{id}</span>
                </div>
                <Badge variant={cert.grade.toLowerCase() as 'a'}>Grade {cert.grade}</Badge>
              </div>
              <SohGauge value={cert.stateOfHealth} size={150} stroke={11} delay={150} className="mx-auto" />
              <dl className="grid">
                {([['Test type', cert.testType], ['Test date', cert.testDate],
                   ['Usable capacity', `${cert.usableCapacityKwh} kWh`], ['Estimated range', `${cert.estimatedRangeKm} km`],
                   ['Location', cert.location], ['Registry status', cert.status]] as const).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b py-2 text-sm">
                    <dt className="text-muted-foreground">{k}</dt><dd className="font-mono">{v}</dd>
                  </div>
                ))}
              </dl>
              <Benchmark level={cert.benchmark} vehicle={cert.vehicle} />
              <div className="grid gap-2">
                <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">Anomaly flags</span>
                {cert.flags.length === 0
                  ? <p className="flex items-center gap-2 text-sm"><Check className="size-4 text-grade-a" strokeWidth={3} />None raised — all quality gates passed at issue.</p>
                  : cert.flags.map((f) => (
                    <p key={f.text} className="flex items-start gap-2 text-sm">
                      {f.level === 'warning' ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-grade-d" /> : <Info className="mt-0.5 size-4 shrink-0 text-amber" />}
                      {f.text}
                    </p>
                  ))}
              </div>
            </motion.div>

            <div className="grid content-start gap-6">
              <CellHeatmap id={id} soh={cert.stateOfHealth} />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4 text-sm">
                <span className="text-muted-foreground">Every certificate resolves publicly in under two seconds.</span>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/v/${id}`}>Open in the verification engine<ExternalLink /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
