import { PROBE } from '@/components/rig/geometry'

/** The diagnostic probe a standard OBD reader plugs in: a red-lit dongle with a
 *  16-pin head. Same HTML-hosted, side-profile treatment as the plug. */
export function Probe() {
  return (
    <svg viewBox={`0 0 ${PROBE.w} ${PROBE.h}`} className="block size-full overflow-visible" aria-hidden
      style={{ filter: 'drop-shadow(0 0 10px rgba(255,59,48,0.55)) drop-shadow(0 8px 10px rgba(0,0,0,0.5))' }}>
      <defs>
        <linearGradient id="rk-probe" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4a1c20" /><stop offset="0.3" stopColor="#2c1114" /><stop offset="1" stopColor="#150709" />
        </linearGradient>
        <linearGradient id="rk-head" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5a2a2d" /><stop offset="1" stopColor="#1d0c0e" />
        </linearGradient>
      </defs>
      <path d="M 40 40 H -220" stroke="#12080a" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M 40 37 H -220" stroke="#4a2024" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8" />

      <rect x="36" y="10" width="76" height="60" rx="13" fill="url(#rk-probe)" stroke="#ff4b3e" strokeWidth="1.1" strokeOpacity="0.85" />
      <path d="M 46 13.5 H 100" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeLinecap="round" />
      <text x="74" y="31" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.4" fill="#fda4a0" fontWeight="600">DIAG PROBE</text>
      {[40, 46, 52].map((y) => <path key={y} d={`M 50 ${y} H 98`} stroke="rgba(255,120,110,0.16)" strokeWidth="1.4" strokeLinecap="round" />)}
      <circle className="rig-pulse" cx="50" cy="61" r="3.4" fill="#ff3b30" style={{ filter: 'drop-shadow(0 0 5px #ff3b30)' }} />
      <text x="58" y="63.5" fontFamily="var(--font-mono)" fontSize="6.5" letterSpacing="1" fill="#fca5a5">REQUEST</text>

      <path d="M 112 20 L 136 27 V 53 L 112 60 Z" fill="url(#rk-head)" stroke="#ff4b3e" strokeWidth="0.8" strokeOpacity="0.7" />
      {[33, 40, 47].map((y) => (
        <rect key={y} x="136" y={y - 2} width={PROBE.tip - 136} height="4" rx="2" fill="#ff7a6e" stroke="#7a1d17" strokeWidth="0.5" />
      ))}
    </svg>
  )
}
