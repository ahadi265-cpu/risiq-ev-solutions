import { useMemo, useState } from 'react'
import { Search, Lock, LockOpen, Unlock, Check, Timer, PlugZap, CarFront, BadgeCheck, FlaskConical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Stage, GLASS, GLASS_HOVER } from '@/components/Stage'
import { COMPAT, FIELD_BADGE, filterCompat, type ObdStatus } from '@/lib/data'
import { carAssetFor } from '@/lib/cars'
import { CarPhoto } from '@/components/CarPhoto'
import { cn } from '@/lib/utils'

const OBD: Record<ObdStatus, { icon: typeof Lock; label: string; cls: string }> = {
  locked:   { icon: Lock,     label: 'OBD BMS protocol: encrypted / locked', cls: 'border-amber/30 bg-amber/10 text-amber' },
  partial:  { icon: LockOpen, label: 'OBD BMS protocol: partial, model-specific', cls: 'border-amber/30 bg-amber/10 text-amber' },
  readable: { icon: Unlock,   label: 'OBD BMS protocol: readable · still cross-checked', cls: 'border-teal/30 bg-teal/10 text-teal' },
}

/** Real-time compatibility checker: type a make or model, get the three
 *  answers a buyer or lender wants — does the socket test work, what does a
 *  plain OBD reader get, and how long does it take. Every EV that charges is
 *  supported; the list names the ones we see on East African roads. */
export function CompatibilitySearch() {
  const [q, setQ] = useState('')
  const [pick, setPick] = useState<string | null>(null)
  const hits = useMemo(() => filterCompat(q), [q])
  const sel = COMPAT.find((c) => `${c.make} ${c.model}` === pick) ?? hits[0]

  return (
    <Stage>
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <section aria-label="Find your vehicle" className={cn(GLASS, GLASS_HOVER, 'rounded-2xl p-5 md:p-6')}>
          <label htmlFor="compat-q" className="flex items-center gap-2 text-sm font-semibold"><CarFront className="size-4 text-teal" />Is my car supported?</label>
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-1.5 focus-within:border-teal/50 focus-within:shadow-[0_0_25px_rgba(0,242,254,0.18)]">
            <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
            <Input id="compat-q" value={q} onChange={(e) => { setQ(e.target.value); setPick(null) }} placeholder="Search a make or model — BYD, Deepal, Leaf…"
              autoComplete="off" spellCheck={false} className="h-10 flex-1 border-0 bg-transparent focus-visible:ring-0" />
          </div>
          <ul className="mt-3 grid gap-1.5" role="listbox" aria-label="Matching vehicles">
            {hits.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-muted-foreground">
                Not in our list yet — but if it charges, we can test it. <b className="text-foreground">Socket measurement works on any EV.</b>
              </li>
            )}
            {hits.map((c) => {
              const key = `${c.make} ${c.model}`, on = sel && `${sel.make} ${sel.model}` === key
              const asset = carAssetFor(c.make, c.model)
              return (
                <li key={key}>
                  <button type="button" role="option" aria-selected={!!on} onClick={() => setPick(key)}
                    className={cn('flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      on ? 'border-teal/50 bg-teal/10 shadow-[0_0_25px_rgba(0,242,254,0.12)]' : 'border-slate-800/80 hover:border-teal/40 hover:bg-slate-800/40 hover:shadow-[0_0_30px_rgba(0,242,254,0.15)]')}>
                    <span className="grid h-8 w-14 shrink-0 place-items-center">
                      {asset
                        ? <img src={asset.src} width={asset.w} height={asset.h} alt="" loading="lazy" decoding="async" className="max-h-8 w-auto max-w-full object-contain" />
                        : <CarFront className="size-5 text-muted-foreground/60" strokeWidth={1.5} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-mono text-[0.66rem] tracking-wider text-muted-foreground uppercase">{c.make}</span> <b>{c.model}</b>
                      {c.field && (
                        <span className={cn('ml-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 align-middle font-mono text-[0.58rem] font-semibold tracking-wider uppercase',
                          c.field.status === 'certified' ? 'bg-grade-a/15 text-grade-a' : 'bg-amber/15 text-amber')}>
                          {c.field.status === 'certified' ? <BadgeCheck className="size-3" /> : <FlaskConical className="size-3" />}
                          {c.field.status === 'certified' ? 'Field-tested' : 'Validating'}
                        </span>
                      )}
                    </span>
                    <span className="hidden font-mono text-xs text-muted-foreground sm:block">{c.seg}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {!q && <p className="mt-2 text-xs text-muted-foreground">Showing the models most common in Addis. Search for others.</p>}
        </section>

        {sel && (
          <section key={`${sel.make}${sel.model}`} aria-label={`${sel.make} ${sel.model} compatibility`} className={cn(GLASS, GLASS_HOVER, 'animate-rise grid content-start gap-4 rounded-2xl p-5 md:p-6')}>
            <CarPhoto asset={carAssetFor(sel.make, sel.model)} make={sel.make} model={sel.model} />
            <div>
              <span className="font-mono text-[0.66rem] tracking-[0.14em] text-muted-foreground uppercase">{sel.make} · {sel.seg}</span>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">{sel.model}</h3>
              <span className="mt-1 block font-mono text-sm text-muted-foreground tabular-nums">Pack {sel.kwh} · rated</span>
            </div>
            <ul className="grid gap-2">
              <li className="flex items-center gap-2.5 rounded-xl border border-teal/30 bg-teal/10 px-3.5 py-2.5 text-sm font-medium text-teal">
                <PlugZap className="size-4 shrink-0" />Socket measurement: 100% supported
              </li>
              {(() => { const o = OBD[sel.obd]; const Icon = o.icon; return (
                <li className={cn('flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium', o.cls)}>
                  <Icon className="size-4 shrink-0" />{o.label}
                </li>
              ) })()}
              <li className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/50 px-3.5 py-2.5 text-sm font-medium">
                <Timer className="size-4 shrink-0 text-teal" />Est. Rapid Test: 15 min · Reference Test ≈ 4 h
              </li>
            </ul>
            {sel.field && (() => {
              const f = sel.field, ok = f.status === 'certified'
              return (
                <div className={cn('rounded-xl border p-4', ok ? 'border-grade-a/40 bg-grade-a/10' : 'border-amber/40 bg-amber/10')}>
                  <span className={cn('inline-flex items-center gap-1.5 font-mono text-[0.66rem] font-semibold tracking-wider uppercase', ok ? 'text-grade-a' : 'text-amber')}>
                    {ok ? <BadgeCheck className="size-3.5 shrink-0" /> : <FlaskConical className="size-3.5 shrink-0" />}
                    {ok ? FIELD_BADGE : 'Validation in progress — Addis Ababa field programme'}
                  </span>
                  <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {([['Supported test type', f.tests], ['Pack architecture', f.architecture], ['Voltage platform', f.platform], ['Certification confidence', f.confidence]] as const).map(([k, v]) => (
                      <div key={k}>
                        <dt className="font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground uppercase">{k}</dt>
                        <dd className="mt-0.5 text-sm font-medium tabular">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-muted-foreground">{f.note}</p>
                </div>
              )
            })()}
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-teal" strokeWidth={3} />
              Whatever the port allows, every BMS reading is cross-checked against RISIQ’s calibrated database; the certificate carries the calibrated result.
            </p>
          </section>
        )}
      </div>
    </Stage>
  )
}
