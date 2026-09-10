import { motion } from 'motion/react'
import { ShieldCheck, Landmark, Truck, Building2, Gavel, Wrench, Receipt, Cpu } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Section, SectionHead } from '@/components/Layout'
import { Reveal, RevealGroup, revealItem } from '@/components/Reveal'
import { CompareMatrix } from '@/components/CompareMatrix'
import { BriefingModal } from '@/components/BriefingModal'
import { Button } from '@/components/ui/button'

const ROLES = [
  { id: 'insurers', label: 'Insurers', icon: ShieldCheck,
    title: 'Price the risk you are already carrying.',
    lead: "You underwrite the cars you insure without ever seeing the battery inside them. Today there is no way to price that risk at policy issue or at claim — so policies become guesses, and mispriced risk and fraud slip straight through.",
    points: ['Price battery risk accurately at underwriting and at claim.', 'Launch new EV insurance and battery-warranty products.', 'Cut claims disputes and battery-related fraud.'] },
  { id: 'banks', label: 'Banks & MFIs', icon: Landmark,
    title: 'Lend against an asset you can finally value.',
    lead: "You have lent against cars for five-year terms — against a battery that can lose half its value in two. Unpriceable collateral makes financing the single biggest barrier to EV adoption.",
    points: ['Value the asset at origination and at resale.', 'Size loans and residual values with confidence.', 'De-risk EV lending at scale, not deal by deal.'] },
  { id: 'importers', label: 'Importers & Dealers', icon: Truck,
    title: 'Sell faster, at a premium, with proof.',
    lead: 'Grey-market imports, no OEM service centres, no proof of health. Buyers hesitate, disputes follow, and good used EVs sit unsold.',
    points: ['Intake QC — know exactly what you are bringing in.', 'Warranty analytics across your whole intake.', 'Every certificate gets a permanent link you can embed in a listing.'] },
  { id: 'trade', label: 'Ministry of Trade', icon: Building2,
    title: 'Screen every battery before it enters the market.',
    lead: 'Thousands of EVs cross the border each year under the import ban’s replacement flow, with no independent way to confirm the pack inside a "new" import is actually new, undamaged and stable.',
    points: ['Verify battery stability and health at the point of entry.', 'Catch degraded packs sold as new before they reach a buyer.', 'An independent, manufacturer-agnostic import-screening standard.'] },
  { id: 'transport', label: 'Ministry of Transport', icon: Gavel,
    title: 'Know which batteries are still fit for the road.',
    lead: 'An EV has no engine to inspect, but nobody currently checks the part that actually degrades. An annual battery-health check lets the state confirm a car is still safe before licensing it for another year.',
    points: ['An annual check tied to roadworthiness and re-licensing.', 'Flag severely degraded packs before they become a safety risk.', 'A national fitness record for every EV battery, not just its mileage.'] },
]

const MODEL = [
  { icon: Wrench, n: '01', t: 'We deploy & maintain', d: 'RISIQ installs and services the certification rig at your site. Nothing to buy, no manufacturer tools to license.' },
  { icon: Cpu, n: '02', t: 'You certify on demand', d: 'Your existing team runs a test in minutes and issues a certificate — no battery specialists needed.' },
  { icon: Receipt, n: '03', t: 'Pay as you certify', d: 'A modest per-certificate fee plus a simple rig subscription — billed locally, in birr, via Telebirr.' },
]

export default function Partners() {
  return (
    <>
      <Section className="pt-14">
        <Reveal>
          <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-amber uppercase">
            <span className="size-1.5 rounded-full bg-amber ring-3 ring-amber/20" />For Partners
          </span>
          <h1 className="mt-5 max-w-[18ch] text-4xl font-bold tracking-tight md:text-6xl">
            One certificate. Value for every institution.
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg text-muted-foreground">
            RISIQ certifies EV batteries on behalf of the institutions that carry the risk — the lenders financing the cars, the insurers covering them, and the agencies responsible for what is imported and what stays on the road.
          </p>
        </Reveal>
      </Section>

      <Section muted className="pt-0">
        <Reveal>
          <Tabs defaultValue="insurers">
            <TabsList className="flex-wrap">
              {ROLES.map((r) => <TabsTrigger key={r.id} value={r.id}>{r.label}</TabsTrigger>)}
            </TabsList>
            {ROLES.map((r) => {
              const Icon = r.icon
              return (
                <TabsContent key={r.id} value={r.id}>
                  <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                    <div>
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                      <h2 className="mt-5 text-3xl font-semibold md:text-4xl">{r.title}</h2>
                      <p className="mt-4 max-w-[58ch] text-muted-foreground">{r.lead}</p>
                      <ul className="mt-7 grid gap-3">
                        {r.points.map((p) => (
                          <li key={p} className="flex gap-3 text-sm">
                            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" />
                            <span className="text-muted-foreground">{p}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8"><BriefingModal trigger={<Button>Discuss this with us</Button>} /></div>
                    </div>
                    <Card className="bg-card">
                      <CardContent>
                        <Badge variant="outline" className="border-teal/30 text-teal">Why it changes things</Badge>
                        <p className="mt-4 text-sm text-muted-foreground">
                          A signed, independently measured state-of-health figure — not a self-reported BMS number — gives your team a real variable to work with, on the exact locked, imported EVs already on Ethiopian roads.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </Reveal>
      </Section>

      <Section>
        <SectionHead eyebrow="The Model" title="Simple to adopt — no capex, no training burden." />
        <RevealGroup className="grid gap-6 md:grid-cols-3">
          {MODEL.map(({ icon: Icon, n, t, d }) => (
            <motion.div key={n} variants={revealItem}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-teal/10 text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs text-amber">{n}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-[70ch] text-muted-foreground">
            The rig pays for itself quickly. From there the certificate is almost pure trust — and pure margin — shared with the partners who move first.
          </p>
        </Reveal>
      </Section>

      <Section muted>
        <SectionHead eyebrow="The Landscape" title="Built for the market Ethiopia actually has.">
          Toggle to just the rows where the approaches diverge.
        </SectionHead>
        <Reveal><CompareMatrix /></Reveal>
      </Section>

      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHead eyebrow="Technology Partnership" title="European energy engineering, applied in Addis.">
              RISIQ builds its measurement hardware and certification platform in technology partnership with Eniris — a leading European energy-management-system provider whose SmartgridOne platform manages more than 150,000 installations through 500+ vendor-independent hardware integrations.
            </SectionHead>
            <p className="max-w-[58ch] text-muted-foreground">
              Reading true delivered energy from equipment nobody controls is exactly the problem Eniris has spent its life solving. RISIQ points it at a new asset class: the locked, imported battery.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border bg-card p-6 shadow-xl" data-parallax="-5">
              <img src="img/partnership-mark.png" width={1920} height={1500} loading="lazy"
                alt="RISIQ Tech — Partnering for Innovation, empowered by Eniris"
                className="w-full rounded-lg" />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
