import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Lock, Plug, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'obd' | 'socket'

const MODES: Record<Mode, { label: string; tag: string; ok: boolean; headline: string; body: string; readout: string }> = {
  obd: {
    label: 'Standard OBD reader', tag: 'Often blocked · never taken at face value', ok: false,
    headline: 'The dongle asks the car for a number. We never take that number as the verdict.',
    body: 'An OBD reader requests the battery computer’s own estimate over a diagnostic port. Many Chinese imports encrypt that channel, so a reader alone gets nothing. Where the car does answer, RISIQ records the BMS figure — then cross-checks it against our own calibrated database of measured packs before it can influence a certificate.',
    readout: '— — . —',
  },
  socket: {
    label: 'RISIQ socket measurement', tag: 'Works on every EV that charges', ok: true,
    headline: 'We measure the electricity itself. Every car has to accept it.',
    body: 'RISIQ sits in line at the charging socket and meters the energy actually crossing into the pack with a Class 0.5S revenue-grade meter, sampled once a second. Nothing is asked of the car, so nothing can be encrypted, locked or optimistic — and this is the reference every BMS reading is calibrated against.',
    readout: '',
  },
}

const PARTICLES = 9
const FLOW = 'M 90 150 C 190 150, 220 150, 300 150 L 430 150 C 520 150, 560 150, 660 150'

export function SocketSimulator({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const [mode, setMode] = useState<Mode>('socket')
  const [kwh, setKwh] = useState(0)
  const m = MODES[mode]

  // meter readout climbs while energy flows, resets when the mode changes
  useEffect(() => {
    setKwh(0)
    if (mode !== 'socket') return
    const id = window.setInterval(() => setKwh((v) => (v + 0.017) % 24.7), 100)
    return () => clearInterval(id)
  }, [mode])

  return (
    <div className={cn('grid gap-6 rounded-3xl border bg-card p-6 shadow-sm md:p-8', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">Socket measurement simulator</span>
        <div role="tablist" aria-label="Measurement method" className="flex flex-wrap gap-1 rounded-full border bg-muted p-1">
          {(Object.keys(MODES) as Mode[]).map((k) => (
            <button key={k} role="tab" type="button" aria-selected={k === mode} onClick={() => setMode(k)}
              className={cn('flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                k === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {MODES[k].ok ? <Check className="size-3.5 text-teal" strokeWidth={3} /> : <Lock className="size-3.5 text-destructive" />}
              {MODES[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-grid overflow-hidden rounded-2xl border">
        <svg viewBox="0 0 760 300" className="block w-full" role="img"
          aria-label={mode === 'socket' ? 'Energy flows from the charger through the RISIQ meter into the car; the meter reads it.' : 'An OBD dongle asks the car for data and is refused by an encrypted protocol.'}>
          <defs>
            <linearGradient id="cable" x1="0" x2="1">
              <stop offset="0" stopColor="var(--teal)" stopOpacity="0.35" /><stop offset="1" stopColor="var(--teal)" stopOpacity="0.9" />
            </linearGradient>
            <path id="flow" d={FLOW} />
          </defs>

          {/* charger */}
          <g transform="translate(30 90)">
            <rect width="64" height="120" rx="10" fill="var(--card)" stroke="var(--border)" />
            <rect x="12" y="14" width="40" height="26" rx="4" fill="var(--muted)" />
            <text x="32" y="31" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted-foreground)">60 kW</text>
            <text x="32" y="100" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted-foreground)" letterSpacing="1">DC CHARGER</text>
          </g>

          {/* cable and flow */}
          <path d={FLOW} fill="none" stroke={mode === 'socket' ? 'url(#cable)' : 'var(--border)'} strokeWidth="6" strokeLinecap="round" />
          {mode === 'socket' && !reduce && Array.from({ length: PARTICLES }, (_, i) => (
            <circle key={i} r="4.5" fill="var(--teal)" style={{ filter: 'drop-shadow(0 0 5px var(--teal))' }}>
              <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${-(i * 2.4) / PARTICLES}s`}><mpath href="#flow" /></animateMotion>
            </circle>
          ))}
          {mode === 'socket' && reduce && <path d={FLOW} fill="none" stroke="var(--teal)" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 14" />}

          {/* RISIQ meter, in line */}
          <g transform="translate(300 96)">
            <rect width="130" height="108" rx="12" fill="var(--card)" stroke={mode === 'socket' ? 'var(--teal)' : 'var(--border)'} strokeWidth={mode === 'socket' ? 1.5 : 1} />
            <text x="65" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--primary)" letterSpacing="1.4" fontWeight="600">RISIQ METER</text>
            <rect x="14" y="30" width="102" height="40" rx="6" fill="var(--ink)" />
            <text x="65" y="56" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="17" fill={mode === 'socket' ? '#3cc4ae' : '#7b8494'} fontWeight="600">
              {mode === 'socket' ? kwh.toFixed(2) : m.readout}
            </text>
            <text x="65" y="88" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted-foreground)" letterSpacing="1">
              {mode === 'socket' ? 'kWh DELIVERED · 1 Hz' : 'NO MEASUREMENT PATH'}
            </text>
            <text x="65" y="100" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--muted-foreground)">Class 0.5S</text>
          </g>

          {/* car */}
          <g transform="translate(560 70)">
            <path d="M20 120 C 20 90, 40 70, 70 60 L 110 40 C 130 32, 160 32, 175 44 L 190 60 C 200 70, 200 100, 196 120 Z"
              fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
            <path d="M78 62 L 112 46 C 128 40, 150 40, 162 50 L 170 62 Z" fill="var(--muted)" />
            <circle cx="60" cy="122" r="16" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="160" cy="122" r="16" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
            {/* charge port */}
            <rect x="94" y="72" width="16" height="16" rx="3" fill={mode === 'socket' ? 'var(--teal)' : 'var(--muted)'} stroke="var(--border)" />
            <text x="102" y="106" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--muted-foreground)" letterSpacing="1">CHARGE PORT</text>
            <text x="102" y="160" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted-foreground)" letterSpacing="1">BYD ATTO 3 · DOLPHIN · SONG PLUS</text>
          </g>

          {/* OBD path: dongle under the dash, request refused */}
          {mode === 'obd' && (
            <g>
              <path d="M 430 236 L 560 236 L 600 180" fill="none" stroke="var(--destructive)" strokeWidth="2.5" strokeDasharray="6 6" className="dash-run" />
              <g transform="translate(360 220)">
                <rect width="70" height="32" rx="6" fill="var(--card)" stroke="var(--destructive)" />
                <text x="35" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--destructive)" fontWeight="600" letterSpacing="1">OBD DONGLE</text>
              </g>
              <g transform="translate(590 168)">
                <circle r="15" fill="var(--card)" stroke="var(--destructive)" strokeWidth="1.5" />
                <path d="M-5 -1 v-3 a5 5 0 0 1 10 0 v3 M-7 -1 h14 v9 h-14 z" fill="none" stroke="var(--destructive)" strokeWidth="1.8" />
              </g>
              <text x="495" y="266" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--destructive)" letterSpacing="1">ENCRYPTED · REQUEST REFUSED</text>
            </g>
          )}

          {/* cloud link from the meter */}
          {mode === 'socket' && (
            <g>
              <path d="M 365 96 L 365 40 L 600 40" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="4 8" className="dash-run" />
              <text x="480" y="32" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted-foreground)" letterSpacing="1">SIGNED RECORD → REGISTRY</text>
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
