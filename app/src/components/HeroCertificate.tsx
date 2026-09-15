import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from 'motion/react'
import { ShieldCheck, Zap } from 'lucide-react'
import { CERTIFICATES, hashStr, mulberry32 } from '@/lib/data'
import { cn } from '@/lib/utils'

const ID = 'RISIQ-0001'
const CERT = CERTIFICATES[ID]

/** Circular SoH gauge that counts up from 0 on mount. The arc is CSS-transitioned
 *  from the stroke offset, so it settles even if the JS loop is starved. */
export function SohGauge({ value, size = 128, stroke = 9, className, delay = 300 }: {
  value: number; size?: number; stroke?: number; className?: string; delay?: number
}) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? value : 0)
  useEffect(() => {
    if (reduce) { setN(value); return }
    let raf = 0, t0: number | null = null
    const DUR = 1600
    const tick = (ts: number) => {
      if (t0 === null) t0 = ts
      const p = Math.min((ts - t0) / DUR, 1)
      setN(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    const id = window.setTimeout(() => { raf = requestAnimationFrame(tick) }, delay)
    // timers keep firing when the frame loop is starved; the gauge must never rest at 0
    const settle = window.setTimeout(() => setN(value), delay + DUR + 150)
    return () => { clearTimeout(id); clearTimeout(settle); cancelAnimationFrame(raf) }
  }, [value, reduce, delay])

  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className={cn('relative grid place-items-center', className)} style={{ width: size, height: size }}
      role="img" aria-label={`${value}% state of health`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--teal)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c * (1 - n / 100)}
          style={{ transition: 'stroke-dashoffset 120ms linear', filter: 'drop-shadow(0 0 6px oklch(0.596 0.113 183.3 / 0.45))' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <span className="block font-mono text-[1.9rem] leading-none font-semibold tabular">{Math.round(n)}%</span>
          <span className="mt-1 block font-mono text-[0.55rem] tracking-[0.16em] text-muted-foreground uppercase">State of health</span>
        </div>
      </div>
    </div>
  )
}

/** Deterministic pseudo-QR so the mockup carries a believable code. */
function QrMark({ seed, cells = 21 }: { seed: string; cells?: number }) {
  const rnd = mulberry32(hashStr(seed))
  const bits = Array.from({ length: cells * cells }, (_, i) => {
    const x = i % cells, y = Math.floor(i / cells)
    const inFinder = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7
    if (inFinder(0, 0) || inFinder(cells - 7, 0) || inFinder(0, cells - 7)) {
      const lx = x < 7 ? x : x - (cells - 7), ly = y < 7 ? y : y - (cells - 7)
      const ring = lx === 0 || lx === 6 || ly === 0 || ly === 6
      const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
      return ring || core
    }
    return rnd() > 0.55
  })
  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} className="size-full" shapeRendering="crispEdges" aria-hidden>
      {bits.map((b, i) => b && <rect key={i} x={i % cells} y={Math.floor(i / cells)} width={1} height={1} fill="currentColor" />)}
    </svg>
  )
}

const ROWS: [string, string][] = [
  ['Vehicle', 'BYD Atto 3 · 2024'],
  ['VIN', 'LGXC E4 •••• 4471'],
  ['Usable capacity', `${CERT.usableCapacityKwh} kWh of 60.5 kWh nominal`],
  ['Estimated range', `${CERT.estimatedRangeKm} km`],
  ['Test type', 'Reference — full-window controlled charge'],
  ['Test date · location', '18 Jun 2026 · Addis Ababa'],
  ['Confidence band', '± 3% (reference test)'],
  ['Anomaly flags', 'None detected'],
]

/** The hero certificate: a real HTML card (not a PNG) with a counting gauge and
 *  spring-physics 3D tilt on hover. */
export function HeroCertificate({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0), ry = useMotionValue(0)
  const gx = useMotionValue(50), gy = useMotionValue(50)
  const srx = useSpring(rx, { stiffness: 180, damping: 18 })
  const sry = useSpring(ry, { stiffness: 180, damping: 18 })
  const glare = useMotionTemplate`radial-gradient(60% 60% at ${gx}% ${gy}%, oklch(1 0 0 / 0.28), transparent 70%)`

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return
    const b = ref.current.getBoundingClientRect()
    const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height
    ry.set((px - 0.5) * 22); rx.set((0.5 - py) * 18)
    gx.set(px * 100); gy.set(py * 100)
  }
  const onLeave = () => { rx.set(0); ry.set(0); gx.set(50); gy.set(50) }

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1100 }}
      className={cn('relative w-full max-w-[440px] cursor-default rounded-2xl border bg-card text-card-foreground shadow-[0_30px_70px_rgba(0,0,0,0.35)] [transform-style:preserve-3d]', className)}>
      <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 z-10 rounded-2xl mix-blend-overlay" />

      <div className="grid gap-5 p-6 [transform:translateZ(1px)]">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full border border-amber/40 text-amber"><Zap className="size-4" /></span>
            <div className="leading-none">
              <b className="block text-sm tracking-tight">RISIQ</b>
              <span className="font-mono text-[0.5rem] tracking-[0.18em] text-muted-foreground uppercase">EV Solutions</span>
            </div>
          </div>
          <div className="text-right leading-tight">
            <b className="block text-[0.7rem] tracking-wide uppercase">Battery health certificate</b>
            <span className="font-mono text-[0.6rem] text-muted-foreground">Certificate No. {ID}</span>
          </div>
        </header>

        <div className="grid justify-items-center gap-3 py-1">
          <SohGauge value={CERT.stateOfHealth} size={148} stroke={10} />
          <span className="rounded-full bg-grade-a px-3 py-1 font-mono text-[0.62rem] font-semibold tracking-[0.16em] text-white uppercase">Grade {CERT.grade}</span>
        </div>

        <dl className="grid gap-0 border-t border-dashed">
          {ROWS.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dashed py-2 text-[0.78rem]">
              <dt className="text-muted-foreground">{k}</dt><dd className="font-mono text-right">{v}</dd>
            </div>
          ))}
        </dl>

        <footer className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="size-14 shrink-0 text-ink dark:text-foreground"><QrMark seed={ID} /></span>
            <div className="leading-tight">
              <b className="block text-[0.66rem]">Scan to verify</b>
              <span className="block font-mono text-[0.58rem] text-teal">risiqevsolutions.com/v/{ID}</span>
              <span className="block text-[0.55rem] text-muted-foreground">Independent · Tamper-evident · Cryptographically signed</span>
            </div>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-amber/50 text-amber" title="Verification seal">
            <ShieldCheck className="size-5" />
          </span>
        </footer>
      </div>
    </motion.div>
  )
}
