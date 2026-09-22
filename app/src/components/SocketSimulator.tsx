import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)
import { Lock, Plug, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'obd' | 'socket'

const MODES: Record<Mode, { label: string; tag: string; ok: boolean; headline: string; body: string; readout: string }> = {
  obd: {
    label: 'Standard OBD reader', tag: 'Access denied · BMS encrypted', ok: false,
    headline: 'The dongle asks the car for a number. We never take that number as the verdict.',
    body: 'An OBD reader requests the battery computer’s own estimate over a diagnostic port. Many Chinese imports encrypt that channel, so a reader alone gets nothing. Where the car does answer, RISIQ records the BMS figure — then cross-checks it against our own calibrated database of measured packs before it can influence a certificate.',
    readout: '— — . —',
  },
  socket: {
    label: 'RISIQ socket measurement', tag: '100% direct electrical energy signal captured', ok: true,
    headline: 'We measure the electricity itself. Every car has to accept it.',
    body: 'RISIQ sits in line at the charging socket and meters the energy actually crossing into the pack with a Class 0.5S revenue-grade meter, sampled once a second. Nothing is asked of the car, so nothing can be encrypted, locked or optimistic — and this is the reference every BMS reading is calibrated against.',
    readout: '',
  },
}

/* Main bus: charger → RISIQ meter → charge port. Orthogonal, PCB-style. */
const BUS_IN = 'M 96 168 H 302'
const BUS_OUT = 'M 430 168 H 496 C 528 168, 532 145, 564 145 H 570'
/* one continuous run of the bus for the scroll-scrubbed signal (the meter covers the middle) */
const BUS_FULL = 'M 96 168 H 496 C 528 168, 532 145, 564 145 H 570'
const UPLINK = 'M 366 110 V 62 Q 366 48 380 48 H 596'
/* OBD request: dongle → up behind the dash → ECU in the cabin, where it is refused. */
const OBD_OUT = 'M 408 262 H 462 Q 478 262 478 246 V 128 Q 478 112 492 112 H 649'

const PARTICLES = 7
/* The car sits at translate(540 56): body x 560–740, charge port 570–588 × 136–154. */
const ECU: [number, number] = [665, 112]
const NODES: [number, number][] = [[96, 168], [302, 168], [430, 168], [496, 168], [570, 145]]

export function SocketSimulator({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const [mode, setMode] = useState<Mode>('socket')
  const [kwh, setKwh] = useState(0)
  const svg = useRef<SVGSVGElement>(null)
  const m = MODES[mode]
  const live = mode === 'socket'

  /* Scroll-scrubbed signal: as the diagram scrolls through the viewport the bright
     trace draws itself along the bus and a lead carrier physically travels it. */
  useEffect(() => {
    if (reduce || !live || !svg.current) return
    const ctx = gsap.context(() => {
      const draw = svg.current!.querySelector<SVGPathElement>('.scrub-draw')
      if (!draw) return
      const L = draw.getTotalLength()
      gsap.set(draw, { strokeDasharray: L, strokeDashoffset: L })
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg.current, start: 'top 88%', end: 'bottom 30%', scrub: 0.5 } })
      tl.to(draw, { strokeDashoffset: 0, ease: 'none' }, 0)
      tl.to('.scrub-carrier', { motionPath: { path: '#bus-full', align: '#bus-full', alignOrigin: [0.5, 0.5] }, ease: 'none' }, 0)
    }, svg)
    return () => ctx.revert()
  }, [reduce, live])

  // meter readout climbs while energy flows, resets when the mode changes
  useEffect(() => {
    setKwh(0)
    if (mode !== 'socket') return
    const id = window.setInterval(() => setKwh((v) => (v + 0.017) % 24.7), 100)
    return () => clearInterval(id)
  }, [mode])

  /** A glowing charge carrier riding one of the traces. */
  const carrier = (i: number, href: string, colour: string, dur: number, bounce = false) => (
    <circle key={`${href}-${i}`} r={bounce ? 5 : 4} fill={colour} style={{ filter: `drop-shadow(0 0 6px ${colour})` }}>
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${-(i * dur) / PARTICLES}s`}
        {...(bounce ? { keyPoints: '0;1;0', keyTimes: '0;0.5;1', calcMode: 'linear' as const } : {})}>
        <mpath href={href} />
      </animateMotion>
      {bounce && <animate attributeName="opacity" values="1;1;0.2;1" dur={`${dur}s`} repeatCount="indefinite" />}
    </circle>
  )

  return (
    <div className={cn('grid gap-6 rounded-3xl border bg-card p-6 shadow-sm md:p-8', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">Socket measurement simulator</span>
        <div role="tablist" aria-label="Measurement method" className="flex flex-wrap gap-1 rounded-full border bg-muted p-1">
          {(Object.keys(MODES) as Mode[]).map((k) => (
            <button key={k} role="tab" type="button" aria-selected={k === mode} onClick={() => setMode(k)}
              className={cn('flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50',
                k === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {MODES[k].ok ? <Check className="size-3.5 text-teal" strokeWidth={3} /> : <Lock className="size-3.5 text-destructive" />}
              {MODES[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-grid relative overflow-hidden rounded-2xl border bg-[radial-gradient(70%_80%_at_50%_50%,color-mix(in_oklch,var(--teal)_8%,transparent),transparent_75%)]">
        <svg ref={svg} viewBox="0 0 760 320" className="block w-full" role="img"
          aria-label={live
            ? 'Energy flows from the charger along a circuit trace, through the RISIQ meter and into the car, while a signed record travels up to the registry.'
            : 'An OBD dongle sends a request toward the car’s ECU; the request is refused and bounces back, and an access-denied lock flashes.'}>
          <defs>
            <path id="bus-in" d={BUS_IN} /><path id="bus-out" d={BUS_OUT} /><path id="bus-full" d={BUS_FULL} />
            <path id="uplink" d={UPLINK} /><path id="obd-out" d={OBD_OUT} />
            <linearGradient id="trace" x1="0" x2="1">
              <stop offset="0" stopColor="var(--teal)" stopOpacity="0.25" />
              <stop offset="1" stopColor="var(--teal)" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0b0f17" /><stop offset="1" stopColor="#111826" />
            </linearGradient>
          </defs>

          {/* decorative PCB traces behind everything */}
          <g stroke="var(--border)" strokeWidth="1" fill="none" opacity="0.5">
            <path d="M 40 46 H 150 Q 164 46 164 60 V 96" /><path d="M 700 250 H 600 Q 586 250 586 264 V 292" />
            <path d="M 40 292 H 240" /><path d="M 720 60 H 660" />
          </g>

          {/* ---------------------------------------------------- charger */}
          <g transform="translate(30 108)">
            <rect width="66" height="124" rx="12" fill="var(--card)" stroke="var(--border)" />
            <rect x="12" y="14" width="42" height="28" rx="5" fill="url(#screen)" />
            <text x="33" y="32" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={live ? 'var(--teal)' : '#64748b'}>60 kW</text>
            <circle cx="33" cy="60" r="4" fill={live ? 'var(--teal)' : 'var(--border)'} className={live && !reduce ? 'node-pulse' : undefined} />
            <text x="33" y="104" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted-foreground)" letterSpacing="1">DC CHARGER</text>
          </g>

          {/* ------------------------------------------- the main bus traces */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={BUS_IN} stroke={live ? 'url(#trace)' : 'var(--border)'} strokeWidth="6" className={live ? 'trace-glow text-teal' : undefined} />
            <path d={BUS_OUT} stroke={live ? 'url(#trace)' : 'var(--border)'} strokeWidth="6" className={live ? 'trace-glow text-teal' : undefined} />
          </g>
          {NODES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill={live ? 'var(--teal)' : 'var(--border)'} />
          ))}
          {live && !reduce && (
            <g aria-hidden>
              <path className="scrub-draw" d={BUS_FULL} fill="none" stroke="#e6fffd" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px var(--teal))' }} />
              <circle className="scrub-carrier" r="7" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 10px var(--teal)) drop-shadow(0 0 22px var(--teal))' }} />
            </g>
          )}

          {/* charge carriers riding the bus */}
          {live && !reduce && Array.from({ length: PARTICLES }, (_, i) => carrier(i, '#bus-in', 'var(--teal)', 2.2))}
          {live && !reduce && Array.from({ length: PARTICLES }, (_, i) => carrier(i, '#bus-out', 'var(--teal)', 2.2))}
          {live && reduce && <path d={`${BUS_IN} ${BUS_OUT}`} fill="none" stroke="var(--teal)" strokeWidth="6" strokeDasharray="10 14" strokeLinecap="round" />}

          {/* ------------------------------------------- RISIQ precision rig */}
          <g transform="translate(302 110)">
            <rect width="128" height="116" rx="14" fill="var(--card)" stroke={live ? 'var(--teal)' : 'var(--border)'} strokeWidth={live ? 2 : 1}
              className={live ? 'trace-glow text-teal' : undefined} />
            <text x="64" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--primary)" letterSpacing="1.4" fontWeight="600">RISIQ METER</text>
            <rect x="13" y="30" width="102" height="42" rx="6" fill="url(#screen)" />
            {/* scan line inside the display */}
            {live && !reduce && (
              <rect x="13" y="30" width="18" height="42" fill="var(--teal)" opacity="0.14">
                <animate attributeName="x" values="13;97;13" dur="3.4s" repeatCount="indefinite" />
              </rect>
            )}
            <text x="64" y="58" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="18" fontWeight="600"
              fill={live ? '#5eead4' : '#64748b'} style={live ? { filter: 'drop-shadow(0 0 7px #2dd4bf)' } : undefined}>
              {live ? kwh.toFixed(2) : m.readout}
            </text>
            <text x="64" y="88" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted-foreground)" letterSpacing="1">
              {live ? 'kWh DELIVERED · 1 Hz' : 'NO MEASUREMENT PATH'}
            </text>
            <text x="64" y="102" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--muted-foreground)">Class 0.5S</text>
          </g>

          {/* ------------------------------------------------------------ car */}
          <g transform="translate(540 56)">
            <path d="M20 120 C 20 90, 40 70, 70 60 L 110 40 C 130 32, 160 32, 175 44 L 190 60 C 200 70, 200 100, 196 120 Z"
              fill="var(--card)" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeOpacity="0.55" />
            <path d="M78 62 L 112 46 C 128 40, 150 40, 162 50 L 170 62 Z" fill="var(--muted)" />
            <circle cx="60" cy="122" r="16" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="160" cy="122" r="16" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
            {/* charge port on the front wing — where the bus terminates */}
            <rect x="30" y="80" width="18" height="18" rx="4" fill={live ? 'var(--teal)' : 'var(--muted)'} stroke="var(--border)"
              className={live ? 'trace-glow text-teal' : undefined} />
          </g>
          <text x="579" y="212" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--muted-foreground)" letterSpacing="1">CHARGE PORT</text>
          <text x="650" y="236" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted-foreground)" letterSpacing="1">BYD ATTO 3 · DOLPHIN · SONG PLUS</text>

          {/* --------------------------------------------- socket mode extras */}
          {live && (
            <g>
              <path d={UPLINK} fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="4 8" className={reduce ? undefined : 'dash-run'} />
              {!reduce && Array.from({ length: 3 }, (_, i) => carrier(i, '#uplink', 'var(--teal)', 3.2))}
              <text x="470" y="40" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted-foreground)" letterSpacing="1">SIGNED RECORD → REGISTRY</text>
              <text x="380" y="300" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--teal)" letterSpacing="1" fontWeight="600">
                100% DIRECT ELECTRICAL ENERGY SIGNAL CAPTURED
              </text>
            </g>
          )}

          {/* ------------------------------------------------ OBD mode extras */}
          {!live && (
            <g>
              <path d={OBD_OUT} fill="none" stroke="var(--destructive)" strokeWidth="2" strokeDasharray="6 6" opacity="0.65" className={reduce ? undefined : 'dash-run'} />
              <g transform="translate(332 245)">
                <rect width="76" height="34" rx="7" fill="var(--card)" stroke="var(--destructive)" />
                <text x="38" y="21" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--destructive)" fontWeight="600" letterSpacing="1">OBD DONGLE</text>
              </g>
              {/* the request runs at the ECU and is thrown straight back */}
              {!reduce && carrier(0, '#obd-out', 'var(--destructive)', 2, true)}
              {reduce && <circle cx={ECU[0] - 16} cy={ECU[1]} r="5" fill="var(--destructive)" />}
              {/* refusal shockwave at the ECU */}
              {!reduce && [0, 0.35].map((d) => (
                <circle key={d} cx={ECU[0]} cy={ECU[1]} r="6" fill="none" stroke="var(--destructive)" strokeWidth="2">
                  <animate attributeName="r" values="6;30" dur="2s" begin={`${0.95 + d}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.85;0" dur="2s" begin={`${0.95 + d}s`} repeatCount="indefinite" />
                </circle>
              ))}
              {/* the ECU itself, with its lock */}
              <g transform={`translate(${ECU[0]} ${ECU[1]})`} className={reduce ? undefined : 'deny-flash'}>
                <circle r="17" fill="var(--card)" stroke="var(--destructive)" strokeWidth="1.8" />
                <path d="M-5 -1 v-3.5 a5 5 0 0 1 10 0 v3.5 M-7.5 -1 h15 v10 h-15 z" fill="none" stroke="var(--destructive)" strokeWidth="1.8" />
              </g>
              <text x="690" y="115" textAnchor="start" fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--destructive)" letterSpacing="1">VEHICLE ECU</text>
              <text x="380" y="300" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--destructive)" letterSpacing="1" fontWeight="600"
                className={reduce ? undefined : 'deny-flash'}>
                ACCESS DENIED · BMS ENCRYPTED · REQUEST REFUSED
              </text>
            </g>
          )}
        </svg>
      </div>

      <div key={mode} className={cn('animate-rise grid gap-3 rounded-2xl border p-5 md:grid-cols-[auto_1fr] md:items-start md:gap-5',
        m.ok ? 'border-teal/30 bg-teal/6' : 'border-destructive/30 bg-destructive/5')}>
        <span className={cn('grid size-11 place-items-center rounded-xl', m.ok ? 'bg-teal text-white' : 'bg-destructive text-white')}>
          {m.ok ? <Plug className="size-5" /> : <X className="size-5" strokeWidth={3} />}
        </span>
        <div>
          <span className={cn('font-mono text-[0.68rem] tracking-[0.14em] uppercase', m.ok ? 'text-teal' : 'text-destructive')}>{m.tag}</span>
          <h3 className="mt-1.5 text-lg font-semibold">{m.headline}</h3>
          <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">{m.body}</p>
        </div>
      </div>
    </div>
  )
}
