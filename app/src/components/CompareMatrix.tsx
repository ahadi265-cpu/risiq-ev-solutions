import { useMemo, useState } from 'react'
import { Check, X, Minus, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Verdict = 'yes' | 'no' | 'partial'
type Row = {
  capability: string
  note: string
  risiq: { v: Verdict; t: string }
  obd: { v: Verdict; t: string }
  fleet: { v: Verdict; t: string }
}

const ROWS: Row[] = [
  { capability: 'Measurement source', note: 'Where the number actually comes from.',
    risiq: { v: 'yes', t: 'Independent precision meter at the charging socket' },
    obd:   { v: 'partial', t: "The vehicle's own battery computer, read over OBD" },
    fleet: { v: 'partial', t: 'OEM / telematics data feeds from the vehicle' } },
  { capability: 'Works on locked Chinese imports', note: 'BYD, Changan, Jetour — the fleet Ethiopia actually has.',
    risiq: { v: 'yes', t: 'Works — no OEM access needed' },
    obd:   { v: 'no',  t: 'Frequently blocked by encrypted BMS protocols' },
    fleet: { v: 'no',  t: 'Requires manufacturer data cooperation' } },
  { capability: "Independent of the car's self-report", note: 'Can the vehicle overstate its own health?',
    risiq: { v: 'yes', t: 'Fully — energy is measured, not asked for' },
    obd:   { v: 'partial', t: 'Depends on BMS honesty and per-model decoding' },
    fleet: { v: 'no',  t: 'Built on vehicle-reported telemetry' } },
  { capability: 'Presence in East Africa', note: 'Someone on the ground who can actually run the test.',
    risiq: { v: 'yes', t: 'Addis Ababa — built for this market' },
    obd:   { v: 'no',  t: 'None' },
    fleet: { v: 'no',  t: 'None' } },
  { capability: 'Works with unreliable connectivity', note: 'A dropped link must not invalidate a result.',
    risiq: { v: 'yes', t: 'Offline store-and-forward by design' },
    obd:   { v: 'partial', t: 'Varies by tool' },
    fleet: { v: 'no',  t: 'Cloud-dependent' } },
  { capability: 'Primary output', note: 'What the institution actually receives.',
    risiq: { v: 'yes', t: 'Signed, QR-verifiable certificate for banks & insurers' },
    obd:   { v: 'partial', t: 'Battery certificate for the European used-car market' },
    fleet: { v: 'no',  t: 'Fleet monitoring dashboards & analytics' } },
  { capability: 'Billing & currency', note: 'Whether an Ethiopian partner can actually pay.',
    risiq: { v: 'yes', t: 'Locally in birr, via Telebirr' },
    obd:   { v: 'no',  t: 'EUR / USD, European channels' },
    fleet: { v: 'no',  t: 'Enterprise SaaS contracts' } },
]

const COLS = [
  { id: 'risiq', label: 'RISIQ', sub: 'socket measurement', hero: true },
  { id: 'obd',   label: 'OBD / BMS certifiers', sub: 'AVILOO, TWAICE class', hero: false },
  { id: 'fleet', label: 'Fleet analytics', sub: 'telematics platforms', hero: false },
] as const

const ICON: Record<Verdict, typeof Check> = { yes: Check, no: X, partial: Minus }
const TONE: Record<Verdict, string> = {
  yes: 'text-teal bg-teal/10 border-teal/25',
  no: 'text-destructive bg-destructive/8 border-destructive/20',
  partial: 'text-amber bg-amber/10 border-amber/25',
}

export function CompareMatrix() {
  const [onlyDiff, setOnlyDiff] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  const rows = useMemo(
    () => (onlyDiff ? ROWS.filter((r) => r.risiq.v !== r.obd.v || r.risiq.v !== r.fleet.v) : ROWS),
    [onlyDiff]
  )

  return (
    <Card>
      <CardContent>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">How RISIQ compares</h3>
            <p className="mt-2 max-w-[64ch] text-sm text-muted-foreground">
              Battery diagnostics is a proven category in Europe. None of it is built for the market Ethiopia actually has: locked Chinese imports, intermittent connectivity, and institutions that need a certificate rather than a dashboard.
            </p>
          </div>
          <button
            onClick={() => setOnlyDiff((v) => !v)}
            aria-pressed={onlyDiff}
            className={cn('cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all',
              onlyDiff ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:border-primary hover:text-foreground')}
          >
            Only where we differ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="w-[26%] border-b p-3 text-left font-mono text-[0.68rem] tracking-wider text-muted-foreground uppercase">
                  Capability
                </th>
                {COLS.map((c) => (
                  <th key={c.id}
                    className={cn('border-b p-3 text-left align-bottom',
                      c.hero && 'bg-teal/5 border-x border-t border-teal/25 rounded-t-lg')}>
                    <span className={cn('block font-semibold', c.hero ? 'text-teal' : 'text-foreground')}>{c.label}</span>
                    <span className="mt-0.5 block font-mono text-[0.66rem] tracking-wide text-muted-foreground uppercase">{c.sub}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* CSS entrance on mount (project rule): a Motion opacity tween once left these rows invisible */}
              {rows.map((r) => (
                <tr key={r.capability}
                  onMouseEnter={() => setActive(r.capability)} onMouseLeave={() => setActive(null)}
                  className={cn('animate-rise transition-colors', active === r.capability && 'bg-muted/50')}>
                  <th scope="row" className="border-b p-3 text-left align-top font-medium">
                    {r.capability}
                    <span className="mt-1 flex items-start gap-1.5 text-xs font-normal text-muted-foreground">
                      <Info className="mt-0.5 size-3 shrink-0" />{r.note}
                    </span>
                  </th>
                  {(['risiq', 'obd', 'fleet'] as const).map((k) => {
                    const cell = r[k]
                    const Icon = ICON[cell.v]
                    const hero = k === 'risiq'
                    return (
                      <td key={k} className={cn('border-b p-3 align-top', hero && 'bg-teal/5 border-x border-teal/25')}>
                        <span className={cn('mb-1.5 inline-flex size-5 items-center justify-center rounded-full border', TONE[cell.v])}>
                          <Icon className="size-3" strokeWidth={3} />
                        </span>
                        <span className={cn('block text-[0.82rem] leading-snug', hero ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                          {cell.t}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-4">
          {([['yes', 'Fully supported'], ['partial', 'Partial / conditional'], ['no', 'Not supported']] as const).map(([v, label]) => {
            const Icon = ICON[v]
            return (
              <span key={v} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={cn('inline-flex size-4 items-center justify-center rounded-full border', TONE[v])}>
                  <Icon className="size-2.5" strokeWidth={3} />
                </span>{label}
              </span>
            )
          })}
          <span className="ml-auto text-xs text-muted-foreground">
            Category comparison from public product documentation, 2026. Columns describe typical architectures, not any single product.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
