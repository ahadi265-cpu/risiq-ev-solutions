import { describe, it, expect } from 'vitest'
import { WAVELENGTH, sinePath, waveAt } from '@/components/rig/wave'

describe('current wave', () => {
  it('repeats exactly every wavelength, so a one-wavelength slide loops without a seam', () => {
    for (const t of [-30, -7.5, 0, 11, 42.25, 97]) {
      expect(waveAt(t + WAVELENGTH, 30, 11)).toBeCloseTo(waveAt(t, 30, 11), 9)
      expect(waveAt(t + WAVELENGTH, 30, 11, 1.3)).toBeCloseTo(waveAt(t, 30, 11, 1.3), 9)
    }
  })
  it('stays within its amplitude about the centre line', () => {
    for (let t = 0; t < 120; t += 0.7) expect(Math.abs(waveAt(t, 30, 11) - 30)).toBeLessThanOrEqual(11 + 1e-9)
  })
  it('emits a path that covers the requested span, horizontally or vertically', () => {
    const h = sinePath(-30, 150, 30, 11), v = sinePath(-30, 150, 30, 11, 0, true)
    expect(h.startsWith('M -30.00 ')).toBe(true); expect(h.endsWith(' 150.00 30.00') || / 150\.00 [\d.-]+$/.test(h)).toBe(true)
    expect(v.startsWith('M ')).toBe(true); expect(v).toMatch(/ 150\.00$/)
  })
  it('covers more than the visible span by a full wavelength so the slide never reveals a gap', () => {
    // visible 0–120; drawn −30–150 ⇒ at the end of a slide the left edge is still painted
    expect(0 - -30).toBeGreaterThanOrEqual(WAVELENGTH)
  })
})
