import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Lock, Plug as PlugIcon, Check, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Stage, GLASS, PRIMARY_GLOW } from '@/components/Stage'
import { PortBoard, PortFx } from '@/components/rig/PortBoard'
import { Plug } from '@/components/rig/Plug'
import { Probe } from '@/components/rig/Probe'
import { Meter3D } from '@/components/rig/Meter3D'
import { WaveLink } from '@/components/rig/WaveLink'
import { PLUG_TRACK, PROBE_BOX } from '@/components/rig/geometry'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { useSeen } from '@/lib/useSeen'
import { cn } from '@/lib/utils'

type Mode = 'obd' | 'socket'
/** idle: plug in its holster · seated: snapping home · live: mated, current flowing */
type Phase = 'idle' | 'seated' | 'live'

/** The connector's snap: a layout animation on a spring (owner brief: 300 / 30). */
const SNAP = { type: 'spring', stiffness: 300, damping: 30 } as const

const MODES: Record<Mode, { label: string; tag: string; ok: boolean; headline: string; body: string }> = {
  obd: {
    label: 'Standard OBD diagnostics', tag: 'Access denied · BMS encrypted', ok: false,
    headline: 'The dongle asks the car for a number. We never take that number as the verdict.',
    body: 'An OBD reader requests the battery computer’s own estimate over a diagnostic port. Many Chinese imports encrypt that channel, so a reader alone gets nothing. Where the car does answer, RISIQ records the BMS figure — then cross-checks it against our own calibrated database of measured packs before it can influence a certificate.',
  },
  socket: {
    label: 'RISIQ socket metering', tag: '100% direct electrical energy signal captured', ok: true,
    headline: 'We measure the electricity itself. Every car has to accept it.',
    body: 'RISIQ sits in line at the charging socket and meters the energy actually crossing into the pack with a Class 0.5S revenue-grade meter, sampled once a second. Nothing is asked of the car, so nothing can be encrypted, locked or optimistic — and this is the reference every BMS reading is calibrated against.',
  },
}

const box = (b: { left: number; width: number; top: number; height: number }): CSSProperties =>
  ({ left: `${b.left}%`, width: `${b.width}%`, top: `${b.top}%`, height: `${b.height}%` })

/** Hero moment #1. Switch between a standard OBD read, which the car refuses, and
 *  RISIQ's socket metering, where the charger's plug snaps into the inlet and the
 *  current runs into the meter. Same copy and claims as before; the abstract
 *  boxes are now a sectioned port, a real plug and a 3D meter. */
export function SocketSimulator({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const seen = useSeen(root, 0.35)
  const wide = useMediaQuery('(min-width: 768px)', true)

  const [mode, setMode] = useState<Mode>('socket')
  const [phase, setPhase] = useState<Phase>('idle')
  const [run, setRun] = useState(0) // bumped to replay either sequence from the top
  const m = MODES[mode]
  const socket = mode === 'socket'
  const live = socket && phase === 'live'

  const pick = (next: Mode) => { setMode(next); setPhase('idle'); setRun((r) => r + 1) }
  const replay = () => { setPhase('idle'); setRun((r) => r + 1) }

  // Socket sequence: once the rig is on screen, release the plug from its holster.
  useEffect(() => {
    if (!socket || !seen) return
    const t = window.setTimeout(() => setPhase(reduce ? 'live' : 'seated'), reduce ? 0 : 900)
    return () => clearTimeout(t)
  }, [socket, seen, run, reduce])

  // The layout animation reports completion; a timer guards against it never firing.
  useEffect(() => {
    if (phase !== 'seated') return
    const t = window.setTimeout(() => setPhase((p) => (p === 'seated' ? 'live' : p)), 1600)
    return () => clearTimeout(t)
  }, [phase])

  const seated = phase !== 'idle'

  return (
    <Stage className={className}>
      <div ref={root} className="grid gap-5 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">Socket measurement simulator</span>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div role="tablist" aria-label="Measurement method" className="relative grid w-full grid-cols-2 gap-1 rounded-full border border-slate-800/60 bg-slate-950/60 p-1 sm:flex sm:w-auto">
              {(Object.keys(MODES) as Mode[]).map((k) => {
                const on = k === mode
                return (
                  <button key={k} role="tab" type="button" aria-selected={on} onClick={() => pick(k)}
                    className={cn('relative flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-center text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:px-4 sm:text-sm',
                      on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                    {on && (
                      <motion.span layoutId="rig-pill" aria-hidden transition={SNAP}
                        className="absolute inset-0 rounded-full border border-slate-700/70 bg-slate-800 shadow-[0_0_25px_rgba(0,242,254,0.25)]" />
                    )}
                    <span className="relative flex items-center gap-2">
                      {MODES[k].ok ? <Check className="size-3.5 text-teal" strokeWidth={3} /> : <Lock className="size-3.5 text-destructive" />}
                      {MODES[k].label}
                    </span>
                  </button>
                )
              })}
            </div>
            <Button type="button" size="sm" onClick={replay} className={cn(PRIMARY_GLOW, 'w-full bg-teal text-slate-950 hover:bg-teal/90 sm:w-auto')}>
              <RotateCcw />{socket ? 'Replay connection' : 'Retry probe'}
            </Button>
          </div>
        </div>

        <div className={cn(GLASS, 'rounded-2xl p-3 sm:p-5')}>
          <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1.55fr)_8.5rem_minmax(0,1fr)] lg:gap-4">
            {/* ------------------------------------------ the sectioned port */}
            <div role="img" data-rig="board" data-mode={mode} data-phase={phase}
              aria-label={socket
                ? 'A charging plug in side view slides into the inlet of a BYD Atto 3 and locks, and current runs on to the RISIQ meter.'
                : 'A red diagnostic probe approaches the OBD port, is refused by an encrypted shield and bounces back.'}
              className="relative aspect-[420/300] w-full overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
              <PortBoard variant={socket ? 'charge' : 'obd'} live={live} />

              {socket ? (
                <div className={cn('absolute flex', seated ? 'justify-end' : 'justify-start')} style={box(PLUG_TRACK)}>
                  <motion.div layout transition={reduce ? { duration: 0 } : SNAP} data-rig="plug"
                    onLayoutAnimationComplete={() => setPhase((p) => (p === 'seated' ? 'live' : p))}
                    className="h-full" style={{ width: `${PLUG_TRACK.plugShare}%` }}>
                    <Plug locked={live} />
                  </motion.div>
                </div>
              ) : (
                <div key={run} className="rig-probe absolute" data-rig="probe" style={{ ...box(PROBE_BOX), '--travel': `${PROBE_BOX.travel}%` } as CSSProperties}>
                  <Probe />
                </div>
              )}

              <PortFx variant={socket ? 'charge' : 'obd'} lockKey={live ? run : null} />

              {!socket && (
                <div key={`deny-${run}`} aria-hidden data-rig="deny"
                  className="rig-deny absolute right-[3%] bottom-[5%] flex w-[56%] items-center gap-3 rounded-xl border border-red-500/40 bg-red-950/55 px-3.5 py-2.5 shadow-[0_0_30px_rgba(239,68,68,0.28)] backdrop-blur-xl">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-500/15 text-red-400"><Lock className="size-5" /></span>
                  <span className="grid leading-tight">
                    <b className="font-mono text-[clamp(0.62rem,1.9vw,0.82rem)] tracking-[0.16em] text-red-300">ENCRYPTED</b>
                    <b className="font-mono text-[clamp(0.58rem,1.7vw,0.74rem)] tracking-[0.16em] text-red-400">ACCESS DENIED</b>
                    <small className="mt-0.5 hidden font-mono text-[0.6rem] text-red-200/70 sm:block">BMS channel refused the request</small>
                  </span>
                </div>
              )}
            </div>

            <WaveLink live={live} vertical={!wide} />
            <Meter3D live={live} />
          </div>
        </div>

        <div key={mode} aria-live="polite" className={cn(GLASS, 'animate-rise grid gap-3 rounded-2xl p-5 md:grid-cols-[auto_1fr] md:items-start md:gap-5',
          m.ok ? 'border-teal/30' : 'border-destructive/30')}>
          <span className={cn('grid size-11 place-items-center rounded-xl', m.ok ? 'bg-teal text-slate-950' : 'bg-destructive text-white')}>
            {m.ok ? <PlugIcon className="size-5" /> : <X className="size-5" strokeWidth={3} />}
          </span>
          <div>
            <span className={cn('font-mono text-[0.68rem] tracking-[0.14em] uppercase', m.ok ? 'text-teal' : 'text-destructive')}>{m.tag}</span>
            <h3 className="mt-1.5 text-lg font-semibold">{m.headline}</h3>
            <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">{m.body}</p>
          </div>
        </div>
      </div>
    </Stage>
  )
}

