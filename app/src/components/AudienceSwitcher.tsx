import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Building2, Landmark, Ship, Scale, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Audience = {
  id: string; label: string; icon: typeof Building2
  title: string; body: string; points: string[]
  stat: { v: string; k: string }; cta: { to: string; label: string }
}

const AUDIENCES: Audience[] = [
  { id: 'insurers', label: 'Insurers', icon: Building2,
    title: 'Price the risk you already carry.',
    body: 'Every EV policy in Addis is underwritten blind to the battery — the single most expensive part to replace. A measured state of health at underwriting, and again at claim, turns that unknown into a number.',
    points: ['Independent, dated SoH record at underwriting', 'Settle battery-related claims against a signed measurement', 'Tier premiums by grade A–D, not by odometer'],
    stat: { v: 'A–D', k: 'one grade per policy' },
    cta: { to: '/pilot', label: 'See the insurer pilot' } },
  { id: 'banks', label: 'Banks & MFIs', icon: Landmark,
    title: 'Lend against collateral you can actually model.',
    body: 'On a five-year EV loan the battery is roughly a third of what the car is worth — and the only part whose value nobody checks. RISIQ gives your credit committee a battery-adjusted residual at origination and at every re-test.',
    points: ['Battery-adjusted residual value at origination', 'Scheduled re-tests at 12 and 24 months on the same car', 'Repossession valuations that hold up in a dispute'],
    stat: { v: '35%', k: 'of car value sits in the pack' },
    cta: { to: '/tools', label: 'Open the collateral calculator' } },
  { id: 'importers', label: 'Importers', icon: Ship,
    title: 'Prove the pack before it reaches the showroom.',
    body: 'BYD, Changan, Jetour — the cars arriving in Ethiopia are locked to their manufacturers’ tools. RISIQ measures at the charging socket, so every import can be certified on arrival, no OEM unlock required.',
    points: ['Works on locked Chinese imports without OEM software', 'Certificate on arrival, after the heat of the Djibouti–Afar corridor', 'Price and warrant each car by measured grade'],
    stat: { v: 'Any EV', k: 'no OEM unlock needed' },
    cta: { to: '/how-it-works', label: 'How the socket test works' } },
  { id: 'regulators', label: 'Regulators', icon: Scale,
    title: 'An independent standard for a national fleet.',
    body: 'Ethiopia has moved faster on EVs than any country in Africa. A trusted, public battery-health record lets the resale market, lenders and insurers grow with it — without waiting on manufacturers.',
    points: ['One method, one grade scale across every brand', 'Public registry — anyone can verify a certificate in seconds', 'Supports resale-market trust on the road to 500,000 EVs'],
    stat: { v: '< 2 s', k: 'public verification' },
    cta: { to: '/contact', label: 'Talk to us' } },
]

export function AudienceSwitcher() {
  const [id, setId] = useState(AUDIENCES[0].id)
  const a = AUDIENCES.find((x) => x.id === id)!
  const Icon = a.icon

  return (
    <div className="grid gap-8">
      <div role="tablist" aria-label="Who this is for"
        className="relative flex flex-wrap gap-1 rounded-full border bg-muted p-1 sm:inline-flex sm:w-fit">
        {AUDIENCES.map((x) => {
          const on = x.id === id
          return (
            <button key={x.id} role="tab" type="button" aria-selected={on} onClick={() => setId(x.id)}
              className={cn('relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors',
                on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {/* transform-only shared-layout pill; text stays visible regardless */}
              {on && <motion.span layoutId="aud-pill" aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-card shadow-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              {x.label}
            </button>
          )
        })}
      </div>

      {/* keyed remount + CSS entry: never left at opacity 0 by a stalled tween */}
      <div key={a.id} role="tabpanel" className="animate-rise grid gap-8 rounded-3xl border bg-card p-8 shadow-sm md:p-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-primary uppercase">
            <Icon className="size-4" />For {a.label}
          </span>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{a.title}</h3>
          <p className="mt-4 max-w-[60ch] text-muted-foreground">{a.body}</p>
          <ul className="mt-6 grid gap-2.5">
            {a.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-teal" strokeWidth={3} />{p}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-8"><Link to={a.cta.to}>{a.cta.label}<ArrowRight /></Link></Button>
        </div>
        <div className="grid content-center gap-4">
          <div className="bg-grid rounded-2xl border p-7">
            <span className="block font-mono text-5xl font-semibold text-gradient tabular md:text-6xl">{a.stat.v}</span>
            <span className="mt-2 block text-sm text-muted-foreground">{a.stat.k}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">
            <img src="img/certificate-risiq.png" alt="" aria-hidden width={2000} height={2540}
              className="w-14 shrink-0 rounded-md shadow-md" loading="lazy" />
            <span>The same signed certificate, whichever seat you sit in — a code on it lets anyone confirm it is genuine.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
