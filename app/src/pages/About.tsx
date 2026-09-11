import { motion } from 'motion/react'
import { Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Section, SectionHead } from '@/components/Layout'
import { Reveal, RevealGroup, revealItem } from '@/components/Reveal'

const EDUCATION = [
  { logo: 'bahir-dar.png', degree: 'BSc, Electrical Engineering', school: 'Bahir Dar University · Ethiopia', years: '2005–09' },
  { logo: 'aalto.svg', degree: 'MSc, Communications Engineering', school: 'Aalto University · Finland', years: '2011–14' },
  { logo: 'ghent.svg', degree: 'PhD, Telecommunications Engineering', school: 'Ghent University · Belgium', years: '2014–19' },
  { logo: 'ams-mark.svg', degree: 'Executive MBA', school: 'Antwerp Management School · Belgium', years: '2020–22' },
]

const TEAM = [
  { initials: 'NA', tone: 'bg-teal text-white', name: 'Natnael Abu', role: 'Embedded Engineer',
    edu: 'Electrical Engineering · Debre Markos University',
    owns: 'Owns the rig.', d: 'Meter integration and calibration, the 1 Hz sampling firmware on the charge path, charge control, and the local buffer that keeps a test valid when the network drops mid-session.' },
  { initials: 'IA', tone: 'bg-amber text-white', name: 'Ikram Awol', role: 'Backend Engineer',
    edu: 'Software Engineering · Addis Ababa University',
    owns: 'Owns the certification platform.', d: 'Telemetry ingestion, the State-of-Health computation service and its quality gates, certificate signing, and the registry every issued certificate is checked against.' },
  { initials: 'AA', tone: 'bg-ink text-white', name: 'Anteneh Addisu', role: 'DevOps & Infrastructure Engineer',
    edu: 'Software Engineering · Addis Ababa University',
    owns: 'Owns the infrastructure.', d: 'Deployment, monitoring and the uptime of the public verification endpoint — the address every scanned QR code resolves to, which has to answer for the life of the certificate.' },
]

const ADVISORS = [
  { name: 'Niels Tiben', role: 'Chief Technology Officer, Eniris', kind: 'Technical',
    d: 'Advises on architecture: how a measurement platform is built so it still answers years later — device management, telemetry ingestion, and the operational design behind SmartgridOne.' },
  { name: 'Cyprian', role: 'Senior Developer, Eniris', kind: 'Technical',
    d: 'Day-to-day engineering review of RISIQ’s ingestion and certification services, and the integration patterns Eniris has proven across 500+ vendor-independent devices.' },
  { name: 'Addis Alemayehou', role: 'Founder, Kazana Fund & 251 Communications', kind: 'Strategic',
    d: 'Chairman of Kazana Group and General Partner at Kazana Fund, one of Ethiopia’s leading venture platforms. Founder of 251 Communications and co-founder of KANA TV.' },
  { name: 'Mesfin Bezu', role: 'Vice President, Dashen Bank', kind: 'Strategic',
    d: 'A senior executive at one of Ethiopia’s largest private banks, bringing a practitioner’s view of Ethiopian lending, collateral and risk — the perspective a bank-grade certificate needs.' },
]


export default function About() {
  return (
    <>
      <Section className="pt-14">
        <Reveal>
          <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-amber uppercase">
            <span className="size-1.5 rounded-full bg-amber ring-3 ring-amber/20" />About RISIQ
          </span>
          <h1 className="mt-5 max-w-[18ch] text-4xl font-bold tracking-tight md:text-6xl">
            Certifying the batteries behind Ethiopia's electric future.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg text-muted-foreground">
            RISIQ EV Solutions is building the independent trust layer Ethiopia's EV market does not have yet — starting with a battery-health certificate every institution can rely on.
          </p>
        </Reveal>
      </Section>

      <Section muted className="pt-0">
        <div className="grid gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHead eyebrow="Why Ethiopia, Why Now" title="A nation went electric — almost overnight.">
              In January 2024 Ethiopia became the first country on earth to ban the import of petrol and diesel cars — a ban since extended to knock-down kits and trucks. Here, EVs are not a trend, they are the law.
            </SectionHead>
            <p className="text-sm text-muted-foreground">
              Sources: IEA policy database · UNECA — Ethiopia National E-Mobility Strategy 2025–2030 · press reporting, 2024–2026.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="h-full">
              <CardContent>
                <Badge variant="outline" className="border-teal/30 text-teal">The opening</Badge>
                <p className="mt-4 text-muted-foreground">
                  Zero independent, multi-brand battery certifiers operate in East Africa today. Socket measurement needs no manufacturer's permission, so it works on the exact locked imports flooding Addis — and every certificate deepens a proprietary Ethiopian dataset no foreign entrant can copy.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Leadership" title="An operator at the crossroads of energy, engineering & Ethiopia." />
        <Reveal>
          <Card>
            <CardContent className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
              <div className="flex flex-col">
                <div className="flex items-start gap-5">
                  <span className="grid size-16 shrink-0 place-items-center rounded-full bg-amber font-mono text-lg font-semibold text-white">AK</span>
                  <div>
                    <h3 className="text-xl font-semibold">Abdulfetah Khalid</h3>
                    <p className="mt-1 text-sm text-amber">Founder &amp; CEO</p>
                  </div>
                </div>
                <p className="mt-6 max-w-[58ch] text-muted-foreground">
                  A telecommunications engineer by training — four degrees across Ethiopia, Finland and Belgium, ending in a doctorate on network performance and mathematical modelling. The same discipline now points at battery measurement.
                </p>
                <p className="mt-4 max-w-[58ch] text-muted-foreground">
                  Built automotive and juice-manufacturing companies from the ground up in Addis Ababa as part of the family behind RISIQ Group, then held an executive position at Eniris before returning home to found RISIQ EV Solutions.
                </p>
                <blockquote className="mt-auto flex gap-3 border-l-2 border-amber pt-8 pl-5 text-lg italic">
                  <Quote className="mt-1 size-5 shrink-0 text-amber" />
                  <span>This is a market that rewards people who can build hard things locally. That is exactly the job I have done before.</span>
                </blockquote>
              </div>

              <aside className="lg:border-l lg:pl-10">
                <span className="flex items-center gap-3 font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">
                  Education<span className="h-px flex-1 bg-border" />
                </span>
                <ul className="mt-4 grid gap-3">
                  {EDUCATION.map((e) => (
                    <li key={e.degree}
                      className="group flex items-center gap-5 rounded-xl border p-4 transition-all duration-300 hover:translate-x-1 hover:shadow-sm">
                      <span className="grid h-14 w-[72px] shrink-0 place-items-center">
                        <img src={`img/logos/${e.logo}`} alt={e.school.split(' · ')[0]} loading="lazy"
                          className="max-h-full max-w-full object-contain" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <b className="block text-sm leading-tight">{e.degree}</b>
                        <small className="mt-1 block font-mono text-xs text-muted-foreground">{e.school}</small>
                      </div>
                      <span className="shrink-0 rounded-full border px-2.5 py-1 font-mono text-xs text-muted-foreground">{e.years}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </CardContent>
          </Card>
        </Reveal>
      </Section>

      <Section muted>
        <SectionHead eyebrow="Engineering Team" title="Three engineers, three layers, one certificate.">
          A certificate is only as good as the rig that measured it, the service that computed it, and the endpoint that still answers when someone scans the QR code two years later.
        </SectionHead>
        <RevealGroup className="grid gap-6 md:grid-cols-3">
          {TEAM.map((m) => (
            <motion.div key={m.name} variants={revealItem}>
              <Card className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                <CardContent>
                  <div className="flex items-start gap-4">
                    <span className={`grid size-12 shrink-0 place-items-center rounded-full font-mono text-sm font-semibold ${m.tone}`}>{m.initials}</span>
                    <div>
                      <h3 className="font-semibold">{m.name}</h3>
                      <p className="mt-0.5 text-sm font-medium text-teal">{m.role}</p>
                      <p className="mt-1.5 font-mono text-xs text-muted-foreground">{m.edu}</p>
                    </div>
                  </div>
                  <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
                    <b className="text-foreground">{m.owns}</b> {m.d}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>
      </Section>

      <Section>
        <SectionHead eyebrow="Advisors" title="Counsel from inside Eniris, and across Ethiopian finance." />
        <RevealGroup className="grid gap-6 md:grid-cols-2">
          {ADVISORS.map((a) => (
            <motion.div key={a.name} variants={revealItem}>
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold">{a.name}</h3>
                    <Badge variant="outline" className={a.kind === 'Technical' ? 'border-teal/30 text-teal' : 'border-amber/30 text-amber'}>{a.kind}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.role}</p>
                  <p className="mt-4 text-sm text-muted-foreground">{a.d}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>
      </Section>

    </>
  )
}
