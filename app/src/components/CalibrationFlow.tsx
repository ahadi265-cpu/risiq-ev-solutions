import { useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const POINTS = [
  ['The car’s own reading', 'Collected from the battery computer wherever the vehicle allows it — useful, but a software estimate that is seldom recalibrated.'],
  ['Our own measurement', 'The energy the pack actually accepts at the charging socket, metered by RISIQ. Nothing the car says about itself can change it.'],
  ['Our calibrated database', 'Every reading we collect is cross-checked against RISIQ’s own calibrated database of measured packs, and corrected before a grade is issued.'],
]

/** Marketing-level view of the method: two sources go in, one calibrated
 *  number comes out. Animated connectors only; the numbers are illustrative. */
export function CalibrationFlow({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const dash = reduce ? '' : 'dash-run'
  return (
    <div className={cn('grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center', className)}>
      <div className="bg-grid overflow-hidden rounded-3xl border bg-card shadow-sm">
        <svg viewBox="0 0 760 330" className="block w-full" role="img"
          aria-label="The car's BMS reading and RISIQ's socket measurement both feed a cross-check against RISIQ's calibrated database, which produces the calibrated certificate.">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--teal)" />
            </marker>
          </defs>

          {/* inputs */}
          <g transform="translate(28 48)">
            <rect width="196" height="86" rx="12" fill="var(--card)" stroke="var(--border)" />
            <text x="16" y="24" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted-foreground)" letterSpacing="1.4">CAR BMS READING</text>
            <text x="16" y="56" fontFamily="var(--font-mono)" fontSize="24" fontWeight="600" fill="var(--amber)">91%</text>
            <text x="16" y="74" fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted-foreground)">self-reported · uncalibrated</text>
          </g>
          <g transform="translate(28 196)">
            <rect width="196" height="86" rx="12" fill="var(--card)" stroke="var(--teal)" strokeWidth="1.5" />
            <text x="16" y="24" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--teal)" letterSpacing="1.4" fontWeight="600">RISIQ SOCKET MEASUREMENT</text>
            <text x="16" y="56" fontFamily="var(--font-mono)" fontSize="24" fontWeight="600" fill="var(--foreground)">53.2 kWh</text>
            <text x="16" y="74" fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted-foreground)">energy the pack actually accepted</text>
          </g>

          {/* connectors in */}
          <path d="M 224 91 C 270 91, 275 150, 318 150" fill="none" stroke="var(--amber)" strokeWidth="2" strokeDasharray="6 8" className={dash} />
          <path d="M 224 239 C 270 239, 275 178, 318 178" fill="none" stroke="var(--teal)" strokeWidth="2" strokeDasharray="6 8" className={dash} />

          {/* cross-check node */}
          <g transform="translate(320 104)">
            <rect width="190" height="120" rx="14" fill="var(--card)" stroke="var(--brand)" strokeWidth="1.5" />
            <text x="95" y="26" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--brand)" letterSpacing="1.4" fontWeight="600">CROSS-CHECK &amp; CALIBRATE</text>
            {/* database cylinder */}
            <g transform="translate(70 40)">
              <ellipse cx="25" cy="8" rx="25" ry="8" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.5" />
              <path d="M0 8 v30 a25 8 0 0 0 50 0 v-30" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.5" />
              <path d="M0 23 a25 8 0 0 0 50 0" fill="none" stroke="var(--brand)" strokeWidth="1.2" opacity="0.6" />
            </g>
            <text x="95" y="108" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted-foreground)">RISIQ calibrated database</text>
          </g>

          {/* connector out */}
          <path d="M 512 164 L 556 164" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeDasharray="6 8" markerEnd="url(#arr)" className={dash} />

          {/* output */}
          <g transform="translate(560 96)">
            <rect width="172" height="136" rx="14" fill="var(--card)" stroke="var(--grade-b)" strokeWidth="1.5" />
            <text x="16" y="26" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--grade-b)" letterSpacing="1.4" fontWeight="600">CALIBRATED RESULT</text>
            <text x="16" y="66" fontFamily="var(--font-mono)" fontSize="30" fontWeight="600" fill="var(--foreground)">88%</text>
            <rect x="16" y="80" width="62" height="18" rx="9" fill="var(--grade-b)" />
            <text x="47" y="93" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fontWeight="600" fill="#fff" letterSpacing="1.2">GRADE B</text>
            <text x="16" y="120" fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted-foreground)">± 3% · signed · QR-verifiable</text>
          </g>

          {/* the gap the calibration closes */}
          <path d="M 126 134 L 126 196" fill="none" stroke="var(--border)" strokeDasharray="2 6" />
          <text x="380" y="300" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--muted-foreground)" letterSpacing="1">
            THE CAR SAID 91% · THE CALIBRATED RESULT IS 88% · ILLUSTRATIVE
          </text>
        </svg>
      </div>

      <ul className="grid gap-5">
        {POINTS.map(([t, d], i) => (
          <li key={t} className="flex gap-4">
            <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold text-white',
              i === 0 ? 'bg-amber' : i === 1 ? 'bg-teal' : 'bg-brand')}>{i + 1}</span>
            <div>
              <b className="block">{t}</b>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          </li>
        ))}
        <li className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-4 text-sm">
          <Check className="size-4 shrink-0 text-teal" strokeWidth={3} />
          <span>The certificate carries the <b>calibrated</b> result, with its confidence band stated — never the raw number the car reported.</span>
        </li>
      </ul>
    </div>
  )
}
