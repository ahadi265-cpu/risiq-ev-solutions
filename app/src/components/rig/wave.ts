/** The flowing current is one long sine that slides exactly one wavelength per
 *  loop, so the loop is seamless only if the curve is periodic in WAVELENGTH.
 *  Phase is anchored to the axis coordinate (not to `from`), so any span works. */
export const WAVELENGTH = 30
const STEP = 1.5

export function sinePath(from: number, to: number, mid: number, amp: number, phase = 0, vertical = false): string {
  const pts: string[] = []
  for (let t = from; t <= to + 1e-9; t += STEP) {
    const off = mid + amp * Math.sin((2 * Math.PI * t) / WAVELENGTH + phase)
    pts.push(vertical ? `${off.toFixed(2)} ${t.toFixed(2)}` : `${t.toFixed(2)} ${off.toFixed(2)}`)
  }
  return `M ${pts.join(' L ')}`
}

/** Offset of the curve at axis position `t` — exported so the periodicity can be tested. */
export const waveAt = (t: number, mid: number, amp: number, phase = 0) =>
  mid + amp * Math.sin((2 * Math.PI * t) / WAVELENGTH + phase)
