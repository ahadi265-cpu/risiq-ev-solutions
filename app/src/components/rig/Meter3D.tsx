import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { sinePath } from '@/components/rig/wave'
import { cn } from '@/lib/utils'

/* cuboid, in CSS px */
const W = 214, H = 150, D = 60
const LCD_WAVE = sinePath(-30, 150, 10, 6)
const face: CSSProperties = { position: 'absolute', backfaceVisibility: 'hidden' }

function Led({ on, tone, blink, label }: { on: boolean; tone: string; blink?: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1 font-mono text-[7px] tracking-[0.12em] text-slate-500">
      <i className={cn('block size-1.5 rounded-full transition-colors duration-300', on && blink && 'rig-pulse')}
        style={{ background: on ? tone : '#243044', boxShadow: on ? `0 0 6px ${tone}` : 'none' }} />{label}
    </span>
  )
}

/**
 * A stylised 3D RISIQ socket meter: a real CSS cuboid (front, right and top
 * faces) under perspective, tilting with the pointer on a spring. The LCD counts
 * energy while `live`; otherwise the meter sits dark with no measurement path.
 */
export function Meter3D({ live, className }: { live: boolean; className?: string }) {
  const reduce = useReducedMotion()
  const active = !reduce && typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0), my = useMotionValue(0)
  const rx = useSpring(mx, { stiffness: 170, damping: 18 }), ry = useSpring(my, { stiffness: 170, damping: 18 })

  const onMove = (e: ReactPointerEvent) => {
    if (!active || !ref.current) return
    const b = ref.current.getBoundingClientRect()
    my.set(((e.clientX - b.left) / b.width - 0.5) * 30)
    mx.set((0.5 - (e.clientY - b.top) / b.height) * -18)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  // energy counter: climbs while the meter is live (read from elapsed time, so it needs no reset)
  const [kwh, setKwh] = useState(0)
  useEffect(() => {
    if (!live) return
    const t0 = performance.now()
    const id = window.setInterval(() => setKwh((((performance.now() - t0) / 1000) * 0.17) % 24.7), 100)
    return () => clearInterval(id)
  }, [live])

  const body = 'linear-gradient(160deg,#2c374a 0%,#182030 55%,#111722 100%)'
  return (
    <div className={cn('grid justify-items-center gap-3', className)}>
      <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} data-rig="meter"
        className="relative grid place-items-center py-5" style={{ perspective: 1100 }}>
        {/* glow is a gradient behind the cuboid, not a filter over it: the LCD wave animates
            inside, and a filter would re-rasterise the whole 3D subtree every frame */}
        <div aria-hidden className="pointer-events-none absolute inset-x-[-8%] inset-y-0 transition-opacity duration-700"
          style={{ opacity: live ? 1 : 0, background: 'radial-gradient(closest-side, rgba(0,242,254,0.22), transparent 78%)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-[4%] bottom-1 h-6 transition-opacity duration-700"
          style={{ opacity: live ? 0 : 1, background: 'radial-gradient(closest-side, rgba(0,0,0,0.5), transparent)' }} />
        <motion.div style={{ transformStyle: 'preserve-3d', rotateX: rx, rotateY: ry, width: W, height: H }}>
          <div style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-9deg) rotateY(-26deg)', width: W, height: H, position: 'relative' }}>

            {/* front */}
            <div style={{ ...face, inset: 0, transform: `translateZ(${D / 2}px)`, background: body, border: '1px solid #3b4a63', borderRadius: 10 }}
              className="grid grid-rows-[auto_1fr_auto] gap-2 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[0.18em] text-slate-100">
                  <i className="block size-2.5 rounded-[3px] bg-brand" />RISIQ
                </span>
                <span className="font-mono text-[7px] tracking-[0.12em] text-slate-500">CLASS 0.5S</span>
              </div>

              <div className="relative overflow-hidden rounded-md border border-black/70 bg-[#03060b] px-2.5 py-1.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                <span className="block font-mono text-[7px] tracking-[0.14em] text-slate-500">{live ? 'ENERGY DELIVERED' : 'NO MEASUREMENT PATH'}</span>
                <div className="flex items-baseline gap-1.5">
                  <span aria-label={live ? `${kwh.toFixed(2)} kilowatt hours` : 'no reading'} data-rig="kwh"
                    className="font-mono text-[28px] leading-tight font-semibold tabular-nums transition-colors duration-500"
                    style={live ? { color: '#5ff7ff', textShadow: '0 0 12px rgba(0,242,254,0.8)' } : { color: '#334155' }}>
                    {live ? kwh.toFixed(2) : '— —.—'}
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">kWh</span>
                </div>
                <svg viewBox="0 0 120 20" className="mt-0.5 block h-3.5 w-full" preserveAspectRatio="none" aria-hidden>
                  <g style={{ opacity: live ? 1 : 0.25 }}>
                    <g className={live ? 'rig-wave' : undefined}>
                      <path d={LCD_WAVE} fill="none" stroke={live ? '#00F2FE' : '#334155'} strokeWidth="1.4" />
                    </g>
                  </g>
                </svg>
              </div>

              <div className="flex items-center justify-between">
                <Led on={live} tone="#10b981" label="PWR" />
                <Led on={live} tone="#00F2FE" blink label="1 Hz" />
                <Led on tone={live ? '#00F2FE' : '#ef4444'} label={live ? 'LINK' : 'NO PATH'} />
              </div>
            </div>

            {/* right */}
            <div style={{ ...face, top: 0, left: (W - D) / 2, width: D, height: H, transform: `rotateY(90deg) translateZ(${W / 2}px)`,
              background: 'linear-gradient(180deg,#1a2231,#0d121b)', border: '1px solid #2a3548', borderRadius: 6 }}
              className="grid content-center justify-items-center gap-1.5 py-3">
              {Array.from({ length: 7 }, (_, i) => <i key={i} className="block h-[2px] w-9 rounded-full bg-black/60" />)}
              <span className="mt-1 font-mono text-[7px] tracking-[0.12em] text-slate-600">SENSE</span>
            </div>

            {/* top */}
            <div style={{ ...face, left: 0, top: (H - D) / 2, width: W, height: D, transform: `rotateX(90deg) translateZ(${H / 2}px)`,
              background: 'linear-gradient(90deg,#394761,#222c3d)', border: '1px solid #3b4a63', borderRadius: 6 }}
              className="grid place-items-center">
              <span className="font-mono text-[8px] tracking-[0.3em] text-slate-300/80">SOCKET METER</span>
            </div>
          </div>
        </motion.div>
      </div>
      <span className="font-mono text-[0.66rem] tracking-[0.14em] text-muted-foreground uppercase">RISIQ socket meter</span>
    </div>
  )
}
