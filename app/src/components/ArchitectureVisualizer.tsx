import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Plug, Cloud, QrCode, ArrowRight, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Mode = {
  id: string; label: string; icon: typeof Plug; tagline: string; blurb: string
  specs: { k: string; v: string }[]
  nodes: string[]
  points: string[]
}

const MODES: Mode[] = [
  {
    id: 'rig', label: 'Socket Measurement Rig', icon: Plug,
    tagline: 'The part that touches the car',
    blurb: 'A portable unit that sits between the charge point and the car. It watches the electricity going in, second by second, so the reading comes from the car\'s behaviour rather than from what the car says about itself.',
    specs: [
      { k: 'Where it goes', v: 'Any standard socket' },
      { k: 'Time on the car', v: '15 minutes' },
      { k: 'Needs from the OEM', v: 'Nothing' },
      { k: 'If the network drops', v: 'Keeps measuring' },
    ],
    nodes: ['Charge point', 'RISIQ rig', 'Vehicle socket'],
    points: ['Works on locked imports no dealer tool can open.', 'Stores readings locally and sends them once the link returns.'],
  },
  {
    id: 'cloud', label: 'Cloud Analytics Engine', icon: Cloud,
    tagline: 'The part that does the thinking',
    blurb: 'Readings arrive from the rig and are turned into a health figure: how much the battery actually holds today against what it held when new. Every run is checked before it is allowed to become a certificate.',
    specs: [
      { k: 'Checks per run', v: '4 quality gates' },
      { k: 'Accuracy target', v: '±3%' },
      { k: 'Failed run', v: 'No certificate issued' },
      { k: 'Built with', v: 'Eniris platform patterns' },
    ],
    nodes: ['Rig telemetry', 'Analytics engine', 'Signed record'],
    points: ['A run that fails a check produces nothing, never a worse number.', 'Every result is traceable back to its raw measurement.'],
  },
  {
    id: 'verify', label: 'QR Certificate Verification', icon: QrCode,
    tagline: 'The part your customer sees',
    blurb: 'The certificate carries a code. Anyone — a buyer, a credit officer, a court — can scan it and see the original record. Change anything on the document and the check stops matching.',
    specs: [
      { k: 'Time to verify', v: 'About 2 seconds' },
      { k: 'Who can check', v: 'Anyone, no login' },
      { k: 'If the PDF is edited', v: 'Verification fails' },
      { k: 'Record lives', v: 'On the public registry' },
    ],
    nodes: ['Printed QR', 'Public registry', 'Verified record'],
    points: ['No account, no app — a phone camera is enough.', 'The document is a copy; the registry is the original.'],
  },
]

export function ArchitectureVisualizer() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const mode = MODES[active]
  const Icon = mode.icon

  return (
    <Card className="glass overflow-hidden">
      <CardContent className="p-0">
        {/* mode switcher */}
        <div role="tablist" aria-label="Product architecture" className="grid border-b sm:grid-cols-3">
          {MODES.map((m, i) => {
            const on = i === active
            const MIcon = m.icon
            return (
              <button key={m.id} role="tab" aria-selected={on} onClick={() => setActive(i)}
                className={cn('relative cursor-pointer p-5 text-left transition-colors',
                  i < MODES.length - 1 && 'sm:border-r', on ? 'bg-accent/50' : 'hover:bg-accent/30')}>
                {on && !reduce && (
                  <motion.span layoutId="arch-underline"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <span className={cn('grid size-9 place-items-center rounded-lg transition-colors',
                  on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                  <MIcon className="size-4" />
                </span>
                <b className={cn('mt-3 block text-sm', !on && 'text-muted-foreground')}>{m.label}</b>
                <small className="mt-0.5 block text-xs text-muted-foreground">{m.tagline}</small>
              </button>
            )
          })}
        </div>

        {/* animated panel */}
        <div key={mode.id} className="animate-rise grid gap-8 p-7 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="text-xl font-semibold">{mode.label}</h3>
                <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground">{mode.blurb}</p>
              </div>
            </div>

            {/* flow diagram — the three nodes this stage connects */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {mode.nodes.map((n, i) => (
                <span key={n} className="flex items-center gap-2">
                  <span
                    className={cn('rounded-lg border px-3 py-2 font-mono text-xs transition-transform duration-300 hover:-translate-y-0.5',
                      i === 1 ? 'border-primary/40 bg-primary/8 text-primary' : 'bg-card text-muted-foreground')}>
                    {n}
                  </span>
                  {i < mode.nodes.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
                </span>
              ))}
            </div>

            <ul className="mt-6 grid gap-2.5">
              {mode.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={3} />{pt}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid content-start gap-px overflow-hidden rounded-xl border bg-border">
            {mode.specs.map((sp) => (
              <div key={sp.k} className="flex items-baseline justify-between gap-4 bg-card p-4 transition-colors hover:bg-accent/40">
                <span className="text-sm text-muted-foreground">{sp.k}</span>
                <b className="text-right font-mono text-sm">{sp.v}</b>
              </div>
            ))}
            <div className="bg-card p-4">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Stage {active + 1} of {MODES.length}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
