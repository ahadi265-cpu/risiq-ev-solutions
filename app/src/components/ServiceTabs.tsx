import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Timer, Gauge, QrCode, Repeat, ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SohGauge, QrMark } from '@/components/HeroCertificate'
import { cn } from '@/lib/utils'

type Service = {
  id: 'rapid' | 'reference' | 'registry' | 'fleet'
  tab: string; icon: typeof Timer
  kicker: string; title: string; body: string
  points: string[]; facts: [string, string][]
  cta: { to: string; label: string }
}

const SERVICES: Service[] = [
  { id: 'rapid', tab: 'Rapid Check', icon: Timer,
    kicker: '15 minutes · at your site',
    title: 'A certificate in the time it takes to charge a phone.',
    body: 'The Rapid Check runs a short, controlled charge window at the socket and issues a signed certificate on the spot. It is the everyday test for showrooms, depots and loan origination.',
    points: ['Around 15 minutes on a partial charge window', 'Same A–D grade scale as the Reference Test', 'Confidence band of ±6%, stated on the certificate', 'BMS reading cross-checked against our calibrated database', 'Works on locked imports — no OEM tool, password or unlock'],
    facts: [['Duration', '≈ 15 min'], ['Confidence', '± 6%'], ['Source', 'DC 60 kW charger']],
    cta: { to: '/how-it-works', label: 'Watch a Rapid Check run' } },
  { id: 'reference', tab: 'Reference Test', icon: Gauge,
    kicker: 'Full charge window · ±3%',
    title: 'The accuracy benchmark, for decisions that end up in a dispute.',
    body: 'A full controlled charge session measured end to end. This is the ground truth behind the grade scale, and the test for repossession valuations, claims and anything a credit committee or a court may look at later.',
    points: ['Full state-of-charge window on an AC wall box', '±3% confidence band — the tightest we issue', 'BMS reading cross-checked against our calibrated database', 'Every quality gate must pass, or no certificate is issued', 'Anomaly flags for cell spread and the 80% warranty floor'],
    facts: [['Duration', '≈ 4 h'], ['Confidence', '± 3%'], ['Source', 'AC 7.2 kW wall box']],
    cta: { to: '/tools', label: 'Compare both tests' } },
  { id: 'registry', tab: 'Certificate & Registry', icon: QrCode,
    kicker: 'Signed · QR-verified · public',
    title: 'One document anyone can check in two seconds.',
    body: 'Each certificate is cryptographically signed at issue and published to the RISIQ registry. The QR code on the printed copy resolves to the original record, so nobody has to take a PDF at face value.',
    points: ['Health score, grade, usable capacity and estimated range', 'A benchmark against comparable BYDs in our calibrated database', 'Any edit to the document breaks verification', 'A badge and permanent link you can embed in a listing or a loan file', 'Anomaly flags carried on the record, not hidden in a footnote'],
    facts: [['Verify in', '< 2 s'], ['Tamper', 'Evident'], ['Access', 'Public']],
    cta: { to: '/verify', label: 'Try the live verification' } },
  { id: 'fleet', tab: 'Fleet Programme', icon: Repeat,
    kicker: 'For banks, insurers & fleets',
    title: 'The same car, re-tested at 12 and 24 months.',
    body: 'Portfolio partners get the rig deployed and maintained at their site, certify on demand, and re-test the same vehicles on a schedule — so a battery-adjusted residual exists at every point in the loan or policy.',
    points: ['Rig deployed and serviced by RISIQ — no capex', 'Your own team certifies in minutes, no specialists needed', 'Scheduled re-tests on the same vehicle at 12 and 24 months', 'A portfolio view of grades, not a pile of PDFs'],
    facts: [['Re-test', '12 · 24 mo'], ['Billing', 'Per certificate, in birr'], ['Setup', 'No capex']],
    cta: { to: '/partners', label: 'See the partner model' } },
]

function Chip({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'teal' | 'brand' }) {
  return (
    <span className={cn('rounded-full border px-3 py-1 font-mono text-xs tabular',
      tone === 'teal' && 'border-teal/30 bg-teal/10 text-teal',
      tone === 'brand' && 'border-brand/30 bg-brand/10 text-brand',
      tone === 'muted' && 'bg-card text-muted-foreground')}>
      {children}
    </span>
  )
}

/** The visual on the left of each panel — a live gauge, a QR, or a re-test path. */
function Visual({ id }: { id: Service['id'] }) {
  if (id === 'rapid' || id === 'reference') {
    const rapid = id === 'rapid'
    return (
      <div className="grid justify-items-center gap-5">
        <SohGauge value={rapid ? 86 : 94} size={172} stroke={11} delay={150} />
        <div className="flex flex-wrap justify-center gap-2">
          <Chip tone="brand">{rapid ? '00:15:00' : '04:01:00'}</Chip>
          <Chip tone="teal">{rapid ? '± 6%' : '± 3%'}</Chip>
          <Chip>{rapid ? 'Grade B sample' : 'Grade A sample'}</Chip>
        </div>
      </div>
    )
  }
  if (id === 'registry') {
    return (
      <div className="grid w-full justify-items-center gap-4">
        {/* how the certificate shows up inside a used-car listing */}
        <div className="w-full max-w-[400px] rounded-2xl border bg-card p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Used car listing · Bole, Addis Ababa</span><span className="font-mono">2024 · 18,400 km</span>
          </div>
          <b className="mt-1 block text-base">BYD Atto 3 — Extended Range</b>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-grade-a/30 bg-grade-a/8 p-3">
            <span className="size-14 shrink-0 text-ink dark:text-foreground"><QrMark seed="RISIQ-0001" /></span>
            <div className="min-w-0 leading-tight">
              <span className="flex items-center gap-1.5 font-mono text-[0.62rem] tracking-wider text-grade-a uppercase"><ShieldCheck className="size-3.5" />RISIQ certified</span>
              <b className="mt-0.5 block text-lg">94% · Grade A</b>
              <span className="block text-xs text-muted-foreground">Above average for Atto 3 · scan to verify</span>
            </div>
          </div>
        </div>
        <span className="font-mono text-xs text-teal">risiqevsolutions.com/v/RISIQ-0001</span>
      </div>
    )
  }
  // fleet: an illustrative re-test path for one vehicle
  const pts: [number, number, string, string][] = [[36, 42, 'New', '100%'], [160, 66, '12 mo', '97%'], [284, 96, '24 mo', '94%']]
  return (
    <div className="grid w-full justify-items-center gap-3">
      <svg viewBox="0 0 320 170" className="w-full max-w-[340px]" role="img" aria-label="Illustrative re-test path: 100% new, 97% at twelve months, 94% at twenty-four months">
        {[42, 66, 96, 126].map((y) => <line key={y} x1="20" x2="300" y1={y} y2={y} stroke="var(--border)" strokeDasharray="2 6" />)}
        <path d={`M ${pts.map((p) => `${p[0]} ${p[1]}`).join(' L ')}`} fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" pathLength={1} className="draw-line" />
        {pts.map(([x, y, k, v]) => (
          <g key={k}>
            <circle cx={x} cy={y} r="7" fill="var(--card)" stroke="var(--brand)" strokeWidth="3" />
            <text x={x} y={y - 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fontWeight="600" fill="var(--foreground)">{v}</text>
            <text x={x} y={152} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--muted-foreground)" letterSpacing="1">{k.toUpperCase()}</text>
          </g>
        ))}
      </svg>
      <Chip>Illustrative · one vehicle, three certificates</Chip>
    </div>
  )
}

/** eniris-style product switcher: underline tabs, a visual on one side and the
 *  offer on the other. Panels remount with a CSS entrance, per the project rule. */
export function ServiceTabs() {
  const [id, setId] = useState<Service['id']>('rapid')
  const s = SERVICES.find((x) => x.id === id)!
  const Icon = s.icon

  return (
    <div className="grid gap-10">
      <div role="tablist" aria-label="What RISIQ offers"
        className="grid grid-cols-2 border-b md:grid-cols-4">
        {SERVICES.map((x) => {
          const on = x.id === id
          const TabIcon = x.icon
          return (
            <button key={x.id} role="tab" type="button" aria-selected={on} onClick={() => setId(x.id)}
              className={cn('relative flex cursor-pointer items-center justify-center gap-2.5 rounded-lg px-3 py-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-base',
                on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <TabIcon className={cn('size-4.5 transition-colors', on ? 'text-brand' : 'text-muted-foreground')} />
              {x.tab}
              {on && <motion.span layoutId="svc-underline" aria-hidden className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-brand"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
            </button>
          )
        })}
      </div>

      <div key={s.id} role="tabpanel" className="animate-rise grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="bg-grid grid min-h-[340px] place-items-center rounded-3xl border bg-muted/40 p-8 md:p-12">
          <Visual id={s.id} />
        </div>
        <div>
          <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-brand uppercase">
            <Icon className="size-4" />{s.kicker}
          </span>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{s.title}</h3>
          <p className="mt-4 max-w-[60ch] text-muted-foreground">{s.body}</p>
          <ul className="mt-6 grid gap-2.5">
            {s.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-teal" strokeWidth={3} />{p}
              </li>
            ))}
          </ul>
          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t pt-6">
            {s.facts.map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[0.66rem] tracking-[0.14em] text-muted-foreground uppercase">{k}</dt>
                <dd className="mt-1 font-mono text-base font-semibold tabular">{v}</dd>
              </div>
            ))}
          </dl>
          <Button asChild className="mt-8 bg-brand hover:bg-brand-dark"><Link to={s.cta.to}>{s.cta.label}<ArrowRight /></Link></Button>
        </div>
      </div>
    </div>
  )
}
