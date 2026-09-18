import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, CalendarDays, UserRound, Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const ROLES = ['Commercial bank', 'Micro-finance institution', 'Insurer', 'Importer / dealer', 'Fleet operator', 'Government agency']
const SLOTS = ['09:00', '11:00', '14:00', '16:00']
const STEPS = [
  { id: 0, label: 'You', icon: UserRound },
  { id: 1, label: 'Slot', icon: CalendarDays },
  { id: 2, label: 'Confirm', icon: Building2 },
]

/** Next 10 weekdays — the pilot team only briefs Monday to Friday. */
function weekdays(count = 10) {
  const out: Date[] = []
  const d = new Date()
  while (out.length < count) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d))
  }
  return out
}

export function BriefingModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(ROLES[0])
  const [day, setDay] = useState<Date | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const days = useMemo(() => weekdays(10), [])
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canNext = step === 0 ? name.trim() && org.trim() && emailOk : step === 1 ? day && slot : true

  const reset = () => { setStep(0); setState('idle'); setDay(null); setSlot(null) }

  const submit = async () => {
    setState('sending')
    try {
      const res = await fetch('https://formsubmit.co/ajax/ahadi265@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, org, email, role,
          _subject: `Pilot briefing request — ${org}`,
          message: `Briefing requested for ${day?.toDateString()} at ${slot} (EAT).\nRole: ${role}`,
        }),
      })
      const j = await res.json().catch(() => ({}))
      setState(String(j?.success) === 'true' ? 'done' : 'error')
    } catch { setState('error') }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setTimeout(reset, 200) }}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="lg">Book a pilot briefing</Button>}
      </DialogTrigger>
      <DialogContent className="glass max-w-xl">
        <DialogHeader>
          <DialogTitle>Book a pilot briefing</DialogTitle>
          <DialogDescription>
            Thirty minutes with the team running the October pilot in Addis Ababa.
          </DialogDescription>
        </DialogHeader>

        {state !== 'done' && (
          <ol className="flex items-center gap-2" aria-label="Progress">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = i < step, now = i === step
              return (
                <li key={s.id} className="flex flex-1 items-center gap-2">
                  <span className={cn('grid size-8 shrink-0 place-items-center rounded-full border transition-colors',
                    done && 'border-teal bg-teal text-white',
                    now && 'border-primary bg-primary text-primary-foreground',
                    !done && !now && 'text-muted-foreground')}>
                    {done ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                  </span>
                  <span className={cn('text-xs font-medium', now ? 'text-foreground' : 'text-muted-foreground')}>{s.label}</span>
                  {i < STEPS.length - 1 && <span className={cn('h-px flex-1', done ? 'bg-teal' : 'bg-border')} />}
                </li>
              )
            })}
          </ol>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={state === 'done' ? 'done' : step}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }} className="min-h-[248px] py-2">

            {state === 'done' ? (
              <div className="grid place-items-center gap-3 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-teal/10 text-teal">
                  <Check className="size-6" strokeWidth={3} />
                </span>
                <b className="text-lg">Request received</b>
                <p className="max-w-[42ch] text-sm text-muted-foreground">
                  We'll confirm {day?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {slot} by email within one working day.
                </p>
              </div>
            ) : step === 0 ? (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bm-name">Full name</Label>
                  <Input id="bm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Abebe Bekele" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bm-org">Organisation</Label>
                  <Input id="bm-org" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Dashen Bank" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bm-email">Work email</Label>
                  <Input id="bm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={email.length > 0 && !emailOk} placeholder="you@bank.et" />
                </div>
                <div className="grid gap-2">
                  <Label>You are a…</Label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => (
                      <button key={r} type="button" onClick={() => setRole(r)} aria-pressed={role === r}
                        className={cn('cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                          role === r ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground hover:border-primary')}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : step === 1 ? (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Pick a day <span className="font-normal text-muted-foreground">· next two weeks, weekdays</span></Label>
                  <div className="grid grid-cols-5 gap-2">
                    {days.map((d) => {
                      const on = day?.toDateString() === d.toDateString()
                      return (
                        <button key={d.toISOString()} type="button" onClick={() => setDay(d)} aria-pressed={on}
                          className={cn('cursor-pointer rounded-lg border p-2 text-center transition-all',
                            on ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary')}>
                          <span className="block text-[0.6rem] uppercase opacity-70">
                            {d.toLocaleDateString(undefined, { weekday: 'short' })}
                          </span>
                          <span className="block font-mono text-base font-semibold tabular">{d.getDate()}</span>
                          <span className="block text-[0.6rem] opacity-70">
                            {d.toLocaleDateString(undefined, { month: 'short' })}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Time <span className="font-normal text-muted-foreground">· East Africa Time</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {SLOTS.map((t) => (
                      <button key={t} type="button" onClick={() => setSlot(t)} aria-pressed={slot === t}
                        disabled={!day}
                        className={cn('cursor-pointer rounded-full border px-4 py-2 font-mono text-sm transition-all disabled:opacity-40',
                          slot === t ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary')}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <dl className="grid gap-0 rounded-xl border">
                {[['Name', name], ['Organisation', org], ['Email', email], ['Role', role],
                  ['Date', day?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) ?? '—'],
                  ['Time', slot ? `${slot} EAT` : '—']].map(([k, v], i, a) => (
                  <div key={k} className={cn('flex justify-between gap-4 px-4 py-2.5 text-sm', i < a.length - 1 && 'border-b')}>
                    <dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </motion.div>
        </AnimatePresence>

        {state !== 'done' && (
          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft />Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Continue<ArrowRight /></Button>
            ) : (
              <Button onClick={submit} disabled={state === 'sending'}>
                {state === 'sending' ? <><Loader2 className="animate-spin" />Sending…</> : <>Request briefing<Check /></>}
              </Button>
            )}
          </div>
        )}
        {state === 'error' && (
          <p className="text-sm text-destructive">
            Could not send that — please email Khalid@risiqbs.com directly.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
