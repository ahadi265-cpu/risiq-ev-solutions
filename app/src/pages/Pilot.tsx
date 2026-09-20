import {
  ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LabelList, ReferenceArea,
} from 'recharts'
import { motion } from 'motion/react'
import { Landmark, PiggyBank, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Section, SectionHead } from '@/components/Layout'
import { Reveal, RevealGroup, revealItem } from '@/components/Reveal'
import { CompareMatrix } from '@/components/CompareMatrix'
import { BriefingModal } from '@/components/BriefingModal'
import { PILOT, fmt, type Grade } from '@/lib/data'

const TEAL = 'oklch(0.596 0.113 183.3)'
const AMBER = 'oklch(0.523 0.135 62.4)'
const GRID = 'oklch(0.916 0.011 251)'
const MUTED = 'oklch(0.503 0.028 257)'

const axis = { stroke: GRID, tick: { fill: MUTED, fontSize: 11, fontFamily: 'var(--font-mono)' } }
const tooltipStyle = {
  contentStyle: {
    borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)',
    boxShadow: '0 10px 28px rgb(15 27 45 / 0.14)', fontSize: 13,
  },
}

const BANDS: { g: Grade; min: number; max: number; fill: string }[] = [
  { g: 'A', min: 92, max: 100, fill: 'oklch(0.517 0.146 149.1 / 0.055)' },
  { g: 'B', min: 85, max: 92, fill: 'oklch(0.511 0.096 186.4 / 0.055)' },
  { g: 'C', min: 78, max: 85, fill: 'oklch(0.523 0.135 62.4 / 0.055)' },
  { g: 'D', min: 70, max: 78, fill: 'oklch(0.487 0.192 27.6 / 0.06)' },
]

const KPIS = [
  { k: 'Vehicles certified', v: '10', s: 'Five BYD models, all locked imports' },
  { k: 'Mean state of health', v: '89.2%', s: 'Across the whole ten-vehicle portfolio' },
  { k: 'Spread, best to worst', v: '22.3 pp', s: '97.1% down to 74.8% — same fleet' },
  { k: "Odometer's predictive power", v: 'r = −0.04', s: 'Mileage explains almost none of the variance' },
]

const INVITE = [
  { icon: Landmark, t: 'Commercial banks', s: '3 places', d: 'Value the battery at origination and at resale, so a five-year loan is written against collateral you can model.' },
  { icon: PiggyBank, t: 'Micro-finance institutions', s: '3 places', d: 'Screen the batteries your borrowers depend on to earn. A degraded pack is a missed repayment before it is a repossession.' },
  { icon: ShieldCheck, t: 'Insurers', s: '3 places', d: 'An independently measured state of health at underwriting, and again at claim, settles disputes before they start.' },
]

export default function Pilot() {
  const sorted = [...PILOT].sort((a, b) => b.soh - a.soh)
  const byGap = [...PILOT].sort((a, b) => a.rated - a.meas - (b.rated - b.meas))

  return (
    <>
      <Section className="pt-14">
        <Reveal>
          <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-amber uppercase">
            <span className="size-1.5 rounded-full bg-amber ring-3 ring-amber/20" />Live Pilot · Addis Ababa
          </span>
          <h1 className="mt-5 max-w-[19ch] text-4xl font-bold tracking-tight md:text-6xl">Ten BYDs. Ninety days. One standard.</h1>
          <p className="mt-6 max-w-[56ch] text-lg text-muted-foreground">
            In late October 2026, RISIQ puts ten BYD electric vehicles through a full battery-certification cycle in Addis Ababa — and hands the results to the institutions that carry the risk.
          </p>
        </Reveal>
      </Section>

      <Section muted className="pt-0">
        <SectionHead eyebrow="What You Receive" title="A portfolio view, not a pile of PDFs." />
        <Reveal className="mb-8">
          <div className="rounded-xl border border-amber/25 bg-amber/6 px-6 py-5 text-sm text-amber">
            <b className="font-semibold">Illustrative fleet.</b> These figures show the shape of the report a pilot partner receives — modelled on a representative ten-vehicle portfolio. They are not measurements. Real readings begin when the pilot runs in late October 2026.
          </div>
        </Reveal>

        <RevealGroup className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((k) => (
            <motion.div key={k.k} variants={revealItem}>
              <Card className="h-full">
                <CardContent>
                  <span className="font-mono text-[0.68rem] tracking-[0.13em] text-muted-foreground uppercase">{k.k}</span>
                  <span className="mt-3 block font-mono text-3xl font-semibold">{k.v}</span>
                  <span className="mt-3 block text-sm text-muted-foreground">{k.s}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>

        <Reveal>
          <Tabs defaultValue="scatter">
            <TabsList>
              <TabsTrigger value="scatter">Mileage vs health</TabsTrigger>
              <TabsTrigger value="ranked">Portfolio ranked</TabsTrigger>
              <TabsTrigger value="range">Rated vs measured</TabsTrigger>
            </TabsList>

            <TabsContent value="scatter">
              <Card>
                <CardContent>
                  <h3 className="text-lg font-semibold">Mileage does not predict battery health</h3>
                  <p className="mt-2 max-w-[62ch] text-sm text-muted-foreground">
                    Each dot is one vehicle. If the odometer told you what a battery was worth, these dots would form a line. They do not.
                  </p>
                  <div className="mt-6 h-[420px] w-full">
                    <ResponsiveContainer>
                      <ScatterChart margin={{ top: 10, right: 24, bottom: 28, left: 4 }}>
                        {BANDS.map((b) => (
                          <ReferenceArea key={b.g} y1={b.min} y2={b.max} fill={b.fill} stroke="none"
                            label={{ value: `Grade ${b.g}`, position: 'insideTopLeft', fontSize: 10.5, fill: MUTED, fontFamily: 'var(--font-mono)' }} />
                        ))}
                        <CartesianGrid stroke={GRID} />
                        <XAxis type="number" dataKey="odo" domain={[0, 100000]} tickCount={6} {...axis}
                          tickFormatter={(v: number) => fmt(v)}
                          label={{ value: 'Odometer · km', position: 'insideBottom', offset: -18, fill: MUTED, fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                        <YAxis type="number" dataKey="soh" domain={[70, 100]} {...axis} tickFormatter={(v: number) => `${v}%`} />
                        <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: '4 4' }}
                          formatter={(v, n) => [n === 'soh' ? `${v}%` : fmt(Number(v)), n === 'soh' ? 'State of health' : 'Odometer']}
                          labelFormatter={() => ''} />
                        <Scatter data={PILOT} fill={TEAL} shape="circle" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
                    <b className="text-foreground">Read this:</b> P04 has covered 71,500 km and grades A at 93.8%. P10 has covered 29,700 km — under half the distance — and grades D at 74.8%.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ranked">
              <Card>
                <CardContent>
                  <h3 className="text-lg font-semibold">The portfolio, ranked</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Sorted by measured state of health, against the grade thresholds the certificate uses.</p>
                  <div className="mt-6 h-[420px] w-full">
                    <ResponsiveContainer>
                      <BarChart data={sorted} margin={{ top: 24, right: 60, bottom: 8, left: 4 }}>
                        <CartesianGrid stroke={GRID} vertical={false} />
                        <XAxis dataKey="id" {...axis} />
                        <YAxis domain={[70, 100]} {...axis} tickFormatter={(v: number) => `${v}%`} />
                        <Tooltip {...tooltipStyle} cursor={{ fill: 'oklch(0.216 0.031 258 / 0.04)' }}
                          formatter={(v) => [`${v}%`, 'State of health']} />
                        {[92, 85, 78].map((y, i) => (
                          <ReferenceLine key={y} y={y} stroke={GRID} strokeDasharray="4 4"
                            label={{ value: `${['A', 'B', 'C'][i]} ≥ ${y}`, position: 'right', fontSize: 10.5, fill: MUTED, fontFamily: 'var(--font-mono)' }} />
                        ))}
                        <Bar dataKey="soh" radius={[4, 4, 0, 0]} maxBarSize={46}>
                          {sorted.map((r) => <Cell key={r.id} fill={TEAL} />)}
                          <LabelList dataKey="soh" position="top" fontSize={10.5} fill={MUTED} fontFamily="var(--font-mono)" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
                    <b className="text-foreground">Read this:</b> four vehicles grade A, three B, two C and one D. A lender treating this fleet as one risk class is over-lending on three of them.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="range">
              <Card>
                <CardContent>
                  <h3 className="text-lg font-semibold">Rated range versus measured range</h3>
                  <p className="mt-2 text-sm text-muted-foreground">What the brochure promises, next to what the battery actually delivers today.</p>
                  <div className="mt-6 h-[420px] w-full">
                    <ResponsiveContainer>
                      <BarChart data={byGap} layout="vertical" margin={{ top: 8, right: 40, bottom: 24, left: 30 }}>
                        <CartesianGrid stroke={GRID} horizontal={false} />
                        <XAxis type="number" domain={[0, 560]} {...axis}
                          label={{ value: 'Range · km', position: 'insideBottom', offset: -14, fill: MUTED, fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                        <YAxis type="category" dataKey="id" {...axis} width={44} />
                        <Tooltip {...tooltipStyle} cursor={{ fill: 'oklch(0.216 0.031 258 / 0.04)' }}
                          formatter={(v, n) => [`${v} km`, n === 'meas' ? 'Measured' : 'Rated']} />
                        <Bar dataKey="rated" fill={AMBER} radius={[0, 4, 4, 0]} maxBarSize={11} name="rated" />
                        <Bar dataKey="meas" fill={TEAL} radius={[0, 4, 4, 0]} maxBarSize={11} name="meas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
                    <b className="text-foreground">Read this:</b> the shortfall runs from 12 km on the healthiest car to 108 km on the weakest — the part of the asset a valuation currently misses.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Reveal>

        <Reveal className="mt-8">
          <details className="max-w-full overflow-hidden rounded-xl border bg-card">
            <summary className="cursor-pointer px-6 py-4 text-sm font-semibold">View the underlying data</summary>
            {/* the scroller must not widen the page on phones: cap it to the card and scroll inside */}
            <div className="max-w-full overflow-x-auto px-6 pb-6 [scrollbar-width:thin]">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left font-mono text-[0.68rem] tracking-wider text-muted-foreground uppercase">
                  <tr>{['Vehicle', 'Model', 'Odometer', 'SoH', 'Grade', 'Rated', 'Measured'].map((th) => <th key={th} className="border-b py-3 pr-4 font-medium">{th}</th>)}</tr>
                </thead>
                <tbody className="tabular">
                  {PILOT.map((r) => (
                    <tr key={r.id}>
                      <td className="border-b py-3 pr-4">{r.id}</td>
                      <td className="border-b py-3 pr-4">{r.model}</td>
                      <td className="border-b py-3 pr-4 font-mono">{fmt(r.odo)} km</td>
                      <td className="border-b py-3 pr-4 font-mono">{r.soh}%</td>
                      <td className="border-b py-3 pr-4"><Badge variant={r.grade.toLowerCase() as 'a'}>{r.grade}</Badge></td>
                      <td className="border-b py-3 pr-4 font-mono">{r.rated} km</td>
                      <td className="border-b py-3 pr-4 font-mono">{r.meas} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </Reveal>
      </Section>

      <Section>
        <SectionHead eyebrow="The Invitation" title="Three kinds of institution. Three founding places each.">
          Participation costs nothing — what we ask for is access and an honest verdict on the certificate.
        </SectionHead>
        <RevealGroup className="grid gap-6 md:grid-cols-3">
          {INVITE.map(({ icon: Icon, t, s, d }) => (
            <motion.div key={t} variants={revealItem}>
              <Card className="h-full transition-all hover:-translate-y-1.5 hover:shadow-lg">
                <CardContent className="flex h-full flex-col">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                  <Badge variant="outline" className="mt-5 border-amber/30 text-amber">{s}</Badge>
                  <h3 className="mt-3 text-xl font-semibold">{t}</h3>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{d}</p>
                  <div className="mt-6"><BriefingModal trigger={<Button className="w-full">Claim a place</Button>} /></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </RevealGroup>
      </Section>

      <Section>
        <SectionHead eyebrow="The Landscape" title="Built for the market Ethiopia actually has.">
          Toggle to just the rows where the approaches diverge.
        </SectionHead>
        <Reveal><CompareMatrix /></Reveal>
      </Section>

      <Section muted>
        <SectionHead eyebrow="Common Questions" title="Answers before you ask." />
        <Reveal>
          <Accordion type="single" collapsible defaultValue="q0" className="max-w-[54rem]">
            {[
              { q: 'Does this work on locked Chinese imports?', a: 'Yes — that is the whole design. RISIQ measures real delivered energy at the charging socket, so no manufacturer unlock, OBD access or dealer tool is required.' },
              { q: 'How accurate is the fast test?', a: 'A Reference Test targets ±3%. The 15-minute Rapid Check carries a wider band, labelled on the certificate, until per-model accuracy is validated against a minimum sample count.' },
              { q: 'What happens if the network drops mid-test?', a: 'The rig buffers telemetry locally and forwards it once the link returns. Offline operation with zero data loss is a design requirement, not an afterthought.' },
              { q: 'Who can verify a certificate?', a: 'Anyone. Each certificate carries a QR code resolving to a public endpoint that re-displays the signed record — in under two seconds, from the registry rather than the PDF.' },
            ].map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Section>
    </>
  )
}
