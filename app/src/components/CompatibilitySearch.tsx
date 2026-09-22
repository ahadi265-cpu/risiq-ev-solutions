import { useMemo, useState } from 'react'
import { Search, Lock, LockOpen, Unlock, Check, Timer, PlugZap, CarFront } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { COMPAT, type ObdStatus } from '@/lib/data'
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
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase()
    const list = s ? COMPAT.filter((c) => `${c.make} ${c.model} ${c.seg}`.toLowerCase().includes(s)) : COMPAT.filter((c) => c.common)
    return list.slice(0, 8)
  }, [q])
  const sel = COMPAT.find((c) => `${c.make} ${c.model}` === pick) ?? hits[0]

  return (
    <div className="grid gap-5 rounded-3xl border bg-card p-6 shadow-sm md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <label htmlFor="compat-q" className="flex items-center gap-2 text-sm font-semibold"><CarFront className="size-4 text-brand" />Is my car supported?</label>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border bg-background p-1.5 focus-within:border-brand/50 focus-within:ring-glow">
          <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
          <Input id="compat-q" value={q} onChange={(e) => { setQ(e.target.value); setPick(null) }} placeholder="Search a make or model — BYD, Deepal, Leaf…"
            autoComplete="off" spellCheck={false} className="h-10 flex-1 border-0 bg-transparent focus-visible:ring-0" />
        </div>
        <ul className="mt-3 grid gap-1" role="listbox" aria-label="Matching vehicles">
          {hits.length === 0 && (
            <li className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Not in our list yet — but if it charges, we can test it. <b className="text-foreground">Socket measurement works on any EV.</b>
            </li>
          )}
          {hits.map((c) => {
            const key = `${c.make} ${c.model}`, on = sel && `${sel.make} ${sel.model}` === key
            return (
              <li key={key}>
                <button type="button" role="option" aria-selected={!!on} onClick={() => setPick(key)}
                  className={cn('flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-sm outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    on ? 'border-brand bg-brand/5' : 'hover:border-brand/40 hover:bg-accent/40')}>
                  <span><span className="font-mono text-[0.66rem] tracking-wider text-muted-foreground uppercase">{c.make}</span> <b>{c.model}</b></span>
                  <span className="font-mono text-xs text-muted-foreground">{c.seg}</span>
                </button>
              </li>
            )
          })}
        </ul>
        {!q && <p className="mt-2 text-xs text-muted-foreground">Showing the models most common in Addis. Search for others.</p>}
      </div>

      {sel && (
        <div key={`${sel.make}${sel.model}`} className="animate-rise grid content-start gap-4 rounded-2xl border bg-muted/40 p-5 md:p-6">
          <div>
            <span className="font-mono text-[0.66rem] tracking-[0.14em] text-muted-foreground uppercase">{sel.make} · {sel.seg}</span>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight">{sel.model}</h3>
            <span className="mt-1 block font-mono text-sm text-muted-foreground">Pack {sel.kwh} · rated</span>
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
            <li className="flex items-center gap-2.5 rounded-xl border bg-card px-3.5 py-2.5 text-sm font-medium">
              <Timer className="size-4 shrink-0 text-brand" />Est. Rapid Test: 15 min · Reference Test ≈ 4 h
            </li>
          </ul>
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="mt-0.5 size-3.5 shrink-0 text-teal" strokeWidth={3} />
            Whatever the port allows, every BMS reading is cross-checked against RISIQ’s calibrated database; the certificate carries the calibrated result.
          </p>
        </div>
      )}
    </div>
  )
}
