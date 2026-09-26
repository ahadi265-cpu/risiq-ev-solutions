import { useState } from 'react'
import { motion } from 'motion/react'
import { Mail, Phone, MapPin, Truck, Landmark, Building2, Check, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Section, SectionHead } from '@/components/Layout'
import { Reveal, RevealGroup, revealItem } from '@/components/Reveal'
import { cn } from '@/lib/utils'

const ROLES = ['Insurer', 'Bank / MFI', 'Importer / Dealer', 'Government — Trade', 'Government — Transport', 'Fleet operator', 'Other']

const ASKS = [
  { icon: Truck, t: 'Importers & fleets', d: 'Give us access to 20–50 vehicles and one charging site to certify.' },
  { icon: Landmark, t: 'Banks & insurers', d: 'Co-design one certificate-backed loan or insurance product on the pilot cohort.' },
  { icon: Building2, t: 'Government agencies', d: 'Ministry of Trade import screening on new arrivals, or Ministry of Transport annual roadworthiness checks.' },
]

export default function Contact() {
  const [name, setName] = useState(''); const [org, setOrg] = useState('')
  const [email, setEmail] = useState(''); const [role, setRole] = useState(ROLES[0])
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const ready = name.trim() && org.trim() && emailOk && message.trim()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) return
    setState('sending')
    try {
      const res = await fetch('https://formsubmit.co/ajax/ahadi265@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, org, email, role, message, _subject: `RISIQ pilot registration — ${org}` }),
      })
      const j = await res.json().catch(() => ({}))
      setState(String(j?.success) === 'true' ? 'done' : 'error')
    } catch { setState('error') }
  }

  return (
    <>
      <Section className="pt-14">
        <Reveal>
          <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-amber uppercase">
            <span className="size-1.5 rounded-full bg-amber ring-3 ring-amber/20" />Get In Touch
          </span>
          <h1 className="mt-5 max-w-[18ch] text-fluid-h1 font-bold tracking-tight">
            Let's build the standard — together.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg text-muted-foreground">
            A 90-day certification pilot in Addis Ababa: hundreds of certified vehicles, the first Ethiopian battery dataset, and EV risk you can finally price.
          </p>
        </Reveal>
      </Section>

      <Section muted className="pt-0">
        <RevealGroup className="grid gap-6 md:grid-cols-3">
          {ASKS.map(({ icon: Icon, t, d }) => (
            <motion.div key={t} variants={revealItem}>
              <Card className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                <CardContent>
                  <span className="grid size-11 place-items-center rounded-xl bg-amber/10 text-amber"><Icon className="size-5" /></span>
                  <h2 className="mt-5 text-lg font-semibold">{t}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHead eyebrow="Reach Us Directly" title="Addis Ababa, Ethiopia.">
              Tell us your role and what you'd like to certify, and we'll set up a live demo on a locked import from your own yard or depot.
            </SectionHead>
            <ul className="grid gap-4">
              {[
                { icon: Mail, label: 'Khalid@risiqbs.com', href: 'mailto:Khalid@risiqbs.com' },
                { icon: Phone, label: '+251 911 223 871', href: 'tel:+251911223871' },
                { icon: Phone, label: '+32 489 97 62 31', href: 'tel:+32489976231', note: 'Belgium' },
                { icon: MapPin, label: 'Addis Ababa, Ethiopia' },
              ].map((c) => {
                const Icon = c.icon
                const body = (
                  <>
                    <Icon className="size-5 shrink-0 text-teal" />
                    <span>{c.label}{c.note && <span className="ml-2 text-sm text-muted-foreground">({c.note})</span>}</span>
                  </>
                )
                return (
                  <li key={c.label}>
                    {c.href
                      ? <a href={c.href} className="flex items-center gap-3 transition-colors hover:text-teal">{body}</a>
                      : <span className="flex items-center gap-3">{body}</span>}
                  </li>
                )
              })}
            </ul>
            <p className="mt-8 text-sm text-muted-foreground">
              Abdulfetah Khalid · Founder &amp; CEO · RISIQ EV Solutions, part of RISIQ Group, in technology partnership with Eniris.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <Card>
              <CardContent>
                {state === 'done' ? (
                  <div className="grid place-items-center gap-3 py-16 text-center">
                    <span className="grid size-12 place-items-center rounded-full bg-teal/10 text-teal">
                      <Check className="size-6" strokeWidth={3} />
                    </span>
                    <b className="text-lg">Registered — thank you.</b>
                    <p className="max-w-[42ch] text-sm text-muted-foreground">
                      We'll confirm your pilot place by email shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="grid gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Register for the pilot</h2>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        Insurers, banks, importers and government agencies can register here to join when the pilot goes live in late October 2026.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="c-name">Full name</Label>
                      <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="c-org">Organisation</Label>
                      <Input id="c-org" value={org} onChange={(e) => setOrg(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="c-email">Email</Label>
                      <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={email.length > 0 && !emailOk} required />
                    </div>
                    <div className="grid gap-2">
                      <Label>I am a…</Label>
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
                    <div className="grid gap-2">
                      <Label htmlFor="c-msg">What would you like to certify or discuss?</Label>
                      <textarea id="c-msg" value={message} onChange={(e) => setMessage(e.target.value)} required rows={4}
                        className="rounded-lg border bg-card px-4 py-3 text-base outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm" />
                    </div>
                    <Button type="submit" disabled={!ready || state === 'sending'} className="w-full">
                      {state === 'sending' ? <><Loader2 className="animate-spin" />Sending…</> : 'Register for the pilot'}
                    </Button>
                    {state === 'error' && (
                      <p className="text-sm text-destructive">
                        Could not send that — please email Khalid@risiqbs.com directly.
                      </p>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
