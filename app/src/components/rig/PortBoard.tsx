import { BOARD, CAVITY, CENTER_Y, FACE_X, MOUTH, SOCKET } from '@/components/rig/geometry'

export type Variant = 'charge' | 'obd'

const mono = 'var(--font-mono)'
/* socket tubes in the back wall, as y-centres on the board */
const CHARGE_TUBES = [{ y: 132, h: 8 }, { y: 144, h: 8 }, { y: 156, h: 8 }, { y: 172, h: 16 }] as const
/* the OBD recess is shallower and narrower than the DC inlet */
const OBD_MOUTH = { y0: 118, y1: 182 } as const
const OBD_CAVITY = { x0: 284, x1: 322, y0: 126, y1: 174 } as const
const OBD_TUBES = [{ y: 138, h: 6 }, { y: 148, h: 6 }, { y: 158, h: 6 }, { y: 166, h: 6 }] as const

const poly = (pts: [number, number][]) => pts.map((p) => p.join(',')).join(' ')

/** Combo DC inlet, seen face-on: a Type-2 half-circle of seven pins over two large DC contacts. */
function InletFace({ live }: { live: boolean }) {
  const small: [number, number][] = [[40, 24], [60, 24], [28, 37], [72, 37], [34, 51], [50, 53], [66, 51]]
  const big: [number, number][] = [[35, 76], [65, 76]]
  return (
    <g>
      <path d="M 16 38 A 34 34 0 0 1 84 38 V 75 A 17 17 0 0 1 67 92 H 33 A 17 17 0 0 1 16 75 Z" fill="url(#rp-chrome)" stroke="#0b0f17" strokeWidth="1.5" />
      <path d="M 20.5 38 A 29.5 29.5 0 0 1 79.5 38 V 75 A 12.5 12.5 0 0 1 67 87.5 H 33 A 12.5 12.5 0 0 1 20.5 75 Z" fill="#05080d" />
      <path d="M 24 61 H 76" stroke="#1b2433" strokeWidth="2" />
      {small.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" fill="url(#rp-copper)" stroke="#1c120b" strokeWidth="0.8" />)}
      {big.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="10.5" fill="#0b0f17" stroke="url(#rp-chrome)" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="6" fill="url(#rp-copper)" stroke="#1c120b" strokeWidth="0.8" />
          <circle cx={x} cy={y} r="2.2" fill="#05080d" />
        </g>
      ))}
      <g style={{ opacity: live ? 1 : 0, transition: 'opacity 0.45s ease', filter: 'drop-shadow(0 0 4px #00F2FE)' }} fill="none" stroke="#00F2FE" strokeWidth="1.4">
        {small.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.4" />)}
        {big.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11.6" />)}
      </g>
    </g>
  )
}

/** J1962 OBD-II connector, seen face-on: a trapezoid of 2 × 8 pins. */
function ObdFace() {
  const row = (y: number) => Array.from({ length: 8 }, (_, i) => [22.5 + i * 7.9, y] as const)
  return (
    <g>
      <path d="M 10 28 H 90 L 81 74 H 19 Z" fill="url(#rp-chrome)" stroke="#0b0f17" strokeWidth="1.5" />
      <path d="M 14.5 32 H 85.5 L 78 70 H 22 Z" fill="#05080d" />
      <path d="M 18 51 H 82" stroke="#1b2433" strokeWidth="2" />
      {[...row(41), ...row(61)].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill="url(#rp-copper)" stroke="#1c120b" strokeWidth="0.6" />)}
    </g>
  )
}

/**
 * The back layer of the rig: a section view through the vehicle panel at the
 * inlet (charge) or the under-dash OBD port. Everything the plug or probe must
 * agree with comes from geometry.ts. Drawn behind the plug; PortFx draws over it.
 */
export function PortBoard({ variant, live }: { variant: Variant; live: boolean }) {
  const charge = variant === 'charge'
  const mouth = charge ? MOUTH : OBD_MOUTH
  const cav = charge ? CAVITY : OBD_CAVITY
  const tubes = charge ? CHARGE_TUBES : OBD_TUBES
  const sockX1 = charge ? SOCKET.x1 : OBD_CAVITY.x1 + 28
  const cavityPoly = poly([[FACE_X, mouth.y0], [cav.x0, cav.y0], [cav.x1, cav.y0], [cav.x1, cav.y1], [cav.x0, cav.y1], [FACE_X, mouth.y1]])

  return (
    <svg viewBox={`0 0 ${BOARD.w} ${BOARD.h}`} className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <pattern id="rp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 H 0 V 24" fill="none" stroke="rgba(148,163,184,0.07)" />
        </pattern>
        <linearGradient id="rp-panel" x1="0" x2="1" y1="0" y2="0.2">
          <stop offset="0" stopColor="#1d2636" /><stop offset="0.5" stopColor="#111826" /><stop offset="1" stopColor="#0b1019" />
        </linearGradient>
        <linearGradient id="rp-cavity" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0d1424" /><stop offset="0.5" stopColor="#04070c" /><stop offset="1" stopColor="#0a101c" />
        </linearGradient>
        <linearGradient id="rp-copper" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6d19a" /><stop offset="0.45" stopColor="#c07c42" /><stop offset="1" stopColor="#6d3d1d" />
        </linearGradient>
        <linearGradient id="rp-chrome" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#e6edf7" /><stop offset="0.5" stopColor="#8794a8" /><stop offset="1" stopColor="#2c3647" />
        </linearGradient>
        <linearGradient id="rp-sheen" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.07" /><stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={BOARD.w} height={BOARD.h} fill="url(#rp-grid)" />

      {/* ------------------------------------------------ the vehicle panel */}
      <rect x={FACE_X} y="0" width={BOARD.w - FACE_X} height={BOARD.h} fill="url(#rp-panel)" />
      <rect x={FACE_X} y="0" width={BOARD.w - FACE_X} height={BOARD.h} fill="url(#rp-sheen)" />
      <path d={`M ${FACE_X} 0 V ${BOARD.h}`} stroke="#5b6b86" strokeWidth="1.2" opacity="0.75" />
      <path d={`M ${FACE_X + 14} 54 H ${BOARD.w}`} stroke="#1e2838" strokeWidth="1" />
      <path d={`M ${FACE_X + 14} 262 H ${BOARD.w}`} stroke="#1e2838" strokeWidth="1" />

      {/* ------------------------------------------------ mouth and cavity */}
      <polygon points={cavityPoly} fill="url(#rp-cavity)" stroke="#2b3647" strokeWidth="1" />
      <path d={`M ${FACE_X} ${mouth.y0} L ${cav.x0} ${cav.y0} M ${FACE_X} ${mouth.y1} L ${cav.x0} ${cav.y1}`} stroke="url(#rp-chrome)" strokeWidth="3.2" strokeLinecap="round" />
      <path d={`M ${cav.x0} ${cav.y0 + 3} H ${cav.x1} M ${cav.x0} ${cav.y1 - 3} H ${cav.x1}`} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      {charge && <rect x="292" y={cav.y0} width="16" height="6" rx="1.5" fill="#05070b" stroke="#2b3647" />}

      {/* back wall + socket tubes */}
      <rect x={cav.x1} y={cav.y0} width={sockX1 - cav.x1} height={cav.y1 - cav.y0} fill="#090d15" stroke="#2b3647" />
      {tubes.map((t) => (
        <g key={t.y}>
          <rect x={cav.x1} y={t.y - t.h / 2} width={sockX1 - cav.x1} height={t.h} rx={t.h / 2} fill="url(#rp-copper)" stroke="#1c120b" strokeWidth="0.8" />
          <rect x={cav.x1} y={t.y - t.h / 2 + 1.6} width={sockX1 - cav.x1 - 6} height={t.h - 3.2} rx={(t.h - 3.2) / 2} fill="#05070b" />
        </g>
      ))}

      {/* conductors leaving the back of the sockets, towards the RISIQ meter */}
      {charge && (
        <g fill="none" strokeLinecap="round">
          {CHARGE_TUBES.map((t) => (
            <path key={t.y} d={`M ${sockX1} ${t.y} H ${sockX1 + 10} Q ${sockX1 + 22} ${t.y} ${sockX1 + 30} ${CENTER_Y} H ${BOARD.w}`}
              stroke="#6d3d1d" strokeWidth={t.h > 10 ? 4 : 2} />
          ))}
          <g style={{ opacity: live ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            {CHARGE_TUBES.map((t) => {
              const d = `M ${sockX1} ${t.y} H ${sockX1 + 10} Q ${sockX1 + 22} ${t.y} ${sockX1 + 30} ${CENTER_Y} H ${BOARD.w}`
              return (
                <g key={t.y}>
                  <path d={d} stroke="#00F2FE" strokeOpacity="0.2" strokeWidth={t.h > 10 ? 7 : 4} />
                  <path className="dash-run" d={d} stroke="#7df9ff" strokeWidth={t.h > 10 ? 2.4 : 1.4} strokeDasharray="6 8" />
                </g>
              )
            })}
          </g>
        </g>
      )}

      {/* tubes light up when mated */}
      {charge && (
        <g style={{ opacity: live ? 1 : 0, transition: 'opacity 0.45s ease', filter: 'drop-shadow(0 0 6px #00F2FE)' }} fill="none" stroke="#00F2FE" strokeWidth="1.4">
          {CHARGE_TUBES.map((t) => <rect key={t.y} x={SOCKET.x0} y={t.y - t.h / 2} width={SOCKET.x1 - SOCKET.x0} height={t.h} rx={t.h / 2} />)}
        </g>
      )}

      {/* ------------------------------------------------------- labels */}
      <g fontFamily={mono} fontSize="9" letterSpacing="1.3">
        <text x={FACE_X + 14} y="22" fill="#e2e8f0" fontWeight="600">{charge ? 'CHARGE INLET' : 'UNDER-DASH PORT'}</text>
        <text x={FACE_X + 14} y="33" fill="#64748b" fontSize="8">{charge ? 'BYD ATTO 3' : 'OBD-II · 16-PIN'}</text>
        <text x={FACE_X + 14} y="43" fill="#64748b" fontSize="8">{charge ? 'DC FAST CHARGE' : 'DIAGNOSTIC'}</text>
        {charge && <text x="296" y={CAVITY.y0 - 5} fill="#64748b" fontSize="7.5">LATCH</text>}
        {charge && <text x={SOCKET.x0 + 2} y={CAVITY.y1 + 14} fill="#64748b" fontSize="7.5">DC PIN</text>}
        <text x={BOARD.w - 10} y={BOARD.h - 8} textAnchor="end" fill="#334155" fontSize="7.5">SECTION VIEW</text>
      </g>
      {charge && (
        <g fontFamily={mono} fontSize="8.5" fontWeight="600" letterSpacing="1.2">
          <rect x={FACE_X + 14} y="240" width="118" height="17" rx="8.5" fill={live ? 'rgba(0,242,254,0.12)' : 'rgba(239,68,68,0.10)'}
            stroke={live ? '#00F2FE' : '#ef4444'} strokeOpacity="0.55" style={{ transition: 'all 0.4s ease' }} />
          <circle cx={FACE_X + 25} cy="248.5" r="2.8" fill={live ? '#00F2FE' : '#ef4444'} style={{ transition: 'fill 0.4s ease' }} />
          <text x={FACE_X + 33} y="251.5" fill={live ? '#7df9ff' : '#fca5a5'} style={{ transition: 'fill 0.4s ease' }}>{live ? 'MATED · LOCKED' : 'NOT MATED'}</text>
        </g>
      )}

      {/* the port, seen face-on */}
      <g transform="translate(14 12) scale(0.74)">
        <rect x="-4" y="-4" width="108" height="110" rx="12" fill="rgba(2,6,12,0.6)" stroke="#1e293b" />
        {charge ? <InletFace live={live} /> : <ObdFace />}
      </g>
      <text x="51" y="98" textAnchor="middle" fontFamily={mono} fontSize="7" letterSpacing="1.2" fill="#64748b">{charge ? 'INLET · FRONT' : 'OBD-II · FRONT'}</text>
    </svg>
  )
}

/** Front layer, drawn over the plug/probe: the click-flash when mated, and the
 *  refusal shockwave and encryption shield at the OBD mouth. */
export function PortFx({ variant, lockKey }: { variant: Variant; lockKey: number | null }) {
  const cx = FACE_X + 6
  return (
    <svg viewBox={`0 0 ${BOARD.w} ${BOARD.h}`} className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      {variant === 'charge' && lockKey !== null && (
        <ellipse key={lockKey} className="rig-lock-ring" cx={cx} cy={CENTER_Y} rx="22" ry="62" fill="none" stroke="#00F2FE" strokeWidth="2.5"
          style={{ filter: 'drop-shadow(0 0 8px #00F2FE)' }} />
      )}
      {variant === 'obd' && (
        <g>
          {[0, 0.28].map((d) => (
            <ellipse key={d} className="rig-shock" cx={cx} cy={CENTER_Y} rx="16" ry="36" fill="none" stroke="#ef4444" strokeWidth="2.2"
              style={{ animationDelay: `${d}s`, filter: 'drop-shadow(0 0 6px #ef4444)' }} />
          ))}
          {/* the encryption shield that stops the request at the mouth */}
          <g className="rig-shield" style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }}>
            <path d={`M ${cx} ${CENTER_Y - 34} L ${cx + 17} ${CENTER_Y - 18} V ${CENTER_Y + 10} Q ${cx + 17} ${CENTER_Y + 28} ${cx} ${CENTER_Y + 36} Q ${cx - 17} ${CENTER_Y + 28} ${cx - 17} ${CENTER_Y + 10} V ${CENTER_Y - 18} Z`}
              fill="rgba(239,68,68,0.16)" stroke="#ef4444" strokeWidth="1.8" />
            <path d={`M ${cx - 5} ${CENTER_Y - 2} v-4.5 a5 5 0 0 1 10 0 v4.5 M ${cx - 7.5} ${CENTER_Y - 2} h15 v11 h-15 z`} fill="none" stroke="#fecaca" strokeWidth="1.8" />
          </g>
        </g>
      )}
    </svg>
  )
}
