import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Plug, Gauge, Sigma, FileSignature, Check, MoveRight } from 'lucide-react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  { n: '01', icon: Plug, t: 'Plug in', at: '00:00', h: 'Direct physical socket interface',
    d: 'The rig connects in line at the car’s normal charging socket. Nothing is fitted to the vehicle, and no manufacturer tool, password or unlock is needed.',
    k: ['Works on locked BYD, Changan and Jetour imports', 'Workshop, importer yard or fleet depot'] },
  { n: '02', icon: Gauge, t: 'Measure', at: '03:00', h: 'Revenue-grade metering at 1 Hz',
    d: 'A Class 0.5S meter samples the energy actually crossing into the pack once a second, while the car’s own battery data is collected wherever it allows.',
    k: ['Buffered on the rig — a dropped link never voids a run', 'The reference every BMS reading is calibrated against'] },
  { n: '03', icon: Sigma, t: 'Compute', at: '12:00', h: 'Gate, integrate, calibrate',
    d: 'Four quality gates must pass or no certificate is issued. Delivered energy is integrated over true time, corrected for charger losses, and cross-checked against RISIQ’s calibrated database.',
    k: ['A failed gate produces no certificate, never a worse number', 'BMS figure calibrated, not taken at face value'] },
  { n: '04', icon: FileSignature, t: 'Certify', at: '15:00', h: 'Signed and published',
    d: 'The record is cryptographically signed and posted to the public registry on the spot. The QR code on the printed certificate resolves to that record in under two seconds.',
    k: ['Any edit to the document breaks verification', 'One A–D grade scale across every brand'] },
]

/**
 * Pinned horizontal sequence: on desktop the section pins for the height of
 * its track and vertical scroll scrubs the four panels sideways. On phones and
 * under reduced motion it is a plain vertical stack — nothing is hidden or
 * repositioned by JS, so the copy is always reachable.
 */
export function WorkflowScroller() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const sec = section.current!, tr = track.current!
      const dist = () => tr.scrollWidth - sec.clientWidth
      const tween = gsap.to(tr, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6,
          anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
            setIdx(Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length + 0.0001)))
          },
        },
      })
      return () => { tween.scrollTrigger?.kill(); tween.kill() }
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={section} aria-labelledby="wf-title"
      className="relative isolate overflow-hidden border-y bg-muted/60 lg:h-dvh lg:flex lg:flex-col lg:justify-center">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-16 lg:pt-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[46rem]">
            <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-amber uppercase">
              <span className="size-1.5 rounded-full bg-amber ring-3 ring-amber/20" />How It Works · 15 minutes
            </span>
            <h2 id="wf-title" className="mt-4 text-3xl font-semibold md:text-[2.6rem] md:leading-[1.1]">From plug to certificate, in four steps.</h2>
          </div>
          <div className="hidden items-center gap-3 font-mono text-xs text-muted-foreground lg:flex">
            <span className="tabular">{STEPS[idx].n} / 04</span>
            <span className="relative h-1 w-40 overflow-hidden rounded-full bg-border">
              <span ref={bar} className="absolute inset-0 origin-left rounded-full bg-brand" style={{ transform: 'scaleX(0)' }} />
            </span>
            <MoveRight className="size-4" />
            <span>scroll</span>
          </div>
        </div>
      </div>

      {/* the track: a column on phones, a sideways row on desktop */}
      <div ref={track} className="mt-10 flex w-max flex-col gap-6 px-6 pb-16 will-change-transform lg:mt-12 lg:flex-row lg:items-stretch lg:gap-8 lg:pr-[calc(50vw-22rem)] lg:pb-0 lg:pl-[max(1.5rem,calc((100vw-1440px)/2+1.5rem))]">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const on = i === idx
          return (
            <article key={s.n} className={cn('glass relative grid w-[calc(100vw-3rem)] max-w-[44rem] shrink-0 gap-6 rounded-3xl border p-7 transition-colors duration-500 md:p-9 lg:w-[min(64vw,52rem)] lg:grid-cols-[1fr_auto]',
              on && 'lg:border-brand/40 lg:shadow-[0_24px_70px_-30px_color-mix(in_oklch,var(--brand)_60%,transparent)]')}>
              <div>
                <span className="font-mono text-[0.68rem] tracking-[0.16em] text-brand uppercase">Step {s.n} · {s.at}</span>
                <h3 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{s.t}</h3>
                <p className="mt-2 text-lg font-medium">{s.h}</p>
                <p className="mt-4 max-w-[52ch] text-muted-foreground">{s.d}</p>
                <ul className="mt-6 grid gap-2.5">
                  {s.k.map((k) => (
                    <li key={k} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-teal" strokeWidth={3} />{k}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid content-center justify-items-center gap-4 lg:w-52">
                <span className={cn('grid size-28 place-items-center rounded-3xl border transition-all duration-500',
                  on ? 'border-brand/40 bg-brand text-white shadow-[0_0_60px_-10px_color-mix(in_oklch,var(--brand)_70%,transparent)]' : 'bg-card text-brand')}>
                  <Icon className="size-12" strokeWidth={1.6} />
                </span>
                <span className="font-mono text-6xl font-bold text-gradient tabular">{s.n}</span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
