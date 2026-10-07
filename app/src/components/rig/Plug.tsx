import { PLUG } from '@/components/rig/geometry'

/* pin centres in plug art units: three signal/AC pins and one large DC contact */
const SMALL = [38, 50, 62] as const
const BIG = 78

/**
 * The charger's plug, in side profile, 3D-styled with gradients and a drop
 * shadow. It is HTML-hosted (not SVG-in-SVG) so Motion can run a true layout
 * animation on it. Drawn in `PLUG` art units; the cable tail runs off to the
 * left and is clipped by the board.
 */
export function Plug({ locked }: { locked: boolean }) {
  const led = locked ? '#00F2FE' : '#ef4444'
  return (
    <svg viewBox={`0 0 ${PLUG.w} ${PLUG.h}`} className="block size-full overflow-visible" aria-hidden
      style={{ filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.55))' }}>
      <defs>
        <linearGradient id="rk-grip" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3a475d" /><stop offset="0.18" stopColor="#273244" /><stop offset="1" stopColor="#111722" />
        </linearGradient>
        <linearGradient id="rk-flange" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#566782" /><stop offset="0.55" stopColor="#2a3447" /><stop offset="1" stopColor="#151c29" />
        </linearGradient>
        <linearGradient id="rk-shroud" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#46556e" /><stop offset="0.25" stopColor="#2b3648" /><stop offset="1" stopColor="#121925" />
        </linearGradient>
        <linearGradient id="rk-copper" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6d19a" /><stop offset="0.45" stopColor="#c07c42" /><stop offset="1" stopColor="#6d3d1d" />
        </linearGradient>
        <linearGradient id="rk-cable" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3a4559" /><stop offset="1" stopColor="#0c1118" />
        </linearGradient>
      </defs>

      {/* cable, running back to the charger */}
      <path d="M 16 56 H -220" stroke="#05070b" strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M 16 51.5 H -220" stroke="url(#rk-cable)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />

      {/* strain relief boot */}
      <path d="M 6 46 Q 6 41 12 41 H 34 V 71 H 12 Q 6 71 6 66 Z" fill="#0b1018" stroke="#2a3548" strokeWidth="0.8" />
      {[14, 20, 26].map((x) => <path key={x} d={`M ${x} 43 V 69`} stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />)}

      {/* grip */}
      <path d="M 30 26 Q 30 18 38 18 H 86 Q 92 18 92 26 V 86 Q 92 94 86 94 H 38 Q 30 94 30 86 Z" fill="url(#rk-grip)" stroke="#3b4a63" strokeWidth="0.9" />
      <path d="M 36 20.5 H 84" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeLinecap="round" />
      {[44, 52, 60, 68, 76].map((x) => <path key={x} d={`M ${x} 36 V 70`} stroke="rgba(255,255,255,0.075)" strokeWidth="2.4" strokeLinecap="round" />)}
      <text x="61" y="56" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="1" fill="#94a3b8" opacity="0.8">DC 60 kW</text>
      <rect x="40" y="82" width="42" height="3.2" rx="1.6" style={{ fill: led, transition: 'fill 0.35s ease', filter: `drop-shadow(0 0 4px ${led})` }} />

      {/* thumb latch */}
      <rect x="44" y="7" width="34" height="12" rx="4.5" fill="#1b2433" stroke="#53627d" strokeWidth="0.8" />
      <path d="M 54 13 H 68 M 58 10.5 L 54 13 L 58 15.5" fill="none" stroke="#8aa0c0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />

      {/* flange — stops against the panel face */}
      <path d="M 92 0 H 104 Q 108 0 108 4 V 108 Q 108 112 104 112 H 92 Z" fill="url(#rk-flange)" stroke="#667797" strokeWidth="0.8" />
      <path d="M 106 6 V 106" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />

      {/* shroud, with its seal and latch tab */}
      <path d="M 108 26 H 154 Q 160 26 160 32 V 80 Q 160 86 154 86 H 108 Z" fill="url(#rk-shroud)" stroke="#53627d" strokeWidth="0.8" />
      <path d="M 114 29 H 152" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
      <path d="M 121 28 V 84" stroke="#05070b" strokeWidth="3" />
      <path d="M 124.5 28 V 84" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <path d="M 130 26 L 133 20 H 145 L 148 26 Z" fill="#a3b1c6" stroke="#53627d" strokeWidth="0.6" />

      {/* contacts */}
      {SMALL.map((y) => (
        <g key={y}>
          <rect x="158" y={y - 4} width="4" height="8" rx="1.5" fill="#0b1018" />
          <rect x="160" y={y - 2.5} width={PLUG.pinTip - 160} height="5" rx="2.5" fill="url(#rk-copper)" stroke="#1c120b" strokeWidth="0.6" />
        </g>
      ))}
      <rect x="158" y={BIG - 9} width="4" height="18" rx="1.5" fill="#0b1018" />
      <rect x="160" y={BIG - 7} width={PLUG.pinTip - 160} height="14" rx="7" fill="url(#rk-copper)" stroke="#1c120b" strokeWidth="0.6" />

      {/* mated: contacts glow */}
      <g style={{ opacity: locked ? 1 : 0, transition: 'opacity 0.4s ease', filter: 'drop-shadow(0 0 5px #00F2FE)' }} fill="none" stroke="#00F2FE" strokeWidth="1.3">
        {SMALL.map((y) => <rect key={y} x="160" y={y - 2.5} width={PLUG.pinTip - 160} height="5" rx="2.5" />)}
        <rect x="160" y={BIG - 7} width={PLUG.pinTip - 160} height="14" rx="7" />
      </g>
    </svg>
  )
}
