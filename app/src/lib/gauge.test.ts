import { describe, it, expect } from 'vitest'
import { gradeOf } from '@/lib/data'
import {
  GAUGE_START, GAUGE_SWEEP, GAUGE_STOPS, GRADE_BANDS, arcPath, clampSoh, gaugeRgb, gaugeColor, polar, sohToAngle,
} from '@/lib/gauge'

describe('needle angle', () => {
  it('maps 0 % and 100 % to the two ends of the sweep', () => {
    expect(sohToAngle(0)).toBe(GAUGE_START)
    expect(sohToAngle(100)).toBe(GAUGE_START + GAUGE_SWEEP)
    expect(sohToAngle(50)).toBe(0) // dead centre points straight up
  })
  it('is strictly increasing across the dial', () => {
    let prev = -Infinity
    for (let s = 0; s <= 100; s += 0.5) { const a = sohToAngle(s); expect(a).toBeGreaterThan(prev); prev = a }
  })
  it('clamps out-of-range and non-finite input instead of spinning the needle off the dial', () => {
    expect(sohToAngle(140)).toBe(sohToAngle(100))
    expect(sohToAngle(-20)).toBe(sohToAngle(0))
    expect(clampSoh(NaN)).toBe(0)
    expect(Number.isFinite(sohToAngle(Infinity))).toBe(true)
  })
})

describe('polar and arc geometry', () => {
  it('puts 0° at 12 o\'clock and 90° at 3 o\'clock', () => {
    const top = polar(100, 100, 50, 0), right = polar(100, 100, 50, 90)
    expect(top.x).toBeCloseTo(100); expect(top.y).toBeCloseTo(50)
    expect(right.x).toBeCloseTo(150); expect(right.y).toBeCloseTo(100)
  })
  it('draws a full-scale arc as one large clockwise sweep that starts and ends on the circle', () => {
    const d = arcPath(180, 180, 100, 0, 100)
    expect(d).toMatch(/^M [\d.]+ [\d.]+ A 100 100 0 1 1 [\d.]+ [\d.]+$/)
    const m = d.match(/^M ([\d.]+) ([\d.]+) A 100 100 0 1 1 ([\d.]+) ([\d.]+)$/)!
    const [x0, y0, x1, y1] = m.slice(1).map(Number)
    for (const [x, y] of [[x0, y0], [x1, y1]]) expect(Math.hypot(x - 180, y - 180)).toBeCloseTo(100, 1)
  })
  it('uses the small-arc flag for a short band', () => {
    expect(arcPath(180, 180, 100, 85, 92)).toContain(' 0 0 1 ')
  })
})

describe('colour ramp', () => {
  it('is emerald from 90 % up, amber at 80 % and red from 75 % down — the brief\'s three anchors', () => {
    expect(gaugeRgb(100)).toEqual([16, 185, 129])
    expect(gaugeRgb(90)).toEqual([16, 185, 129])
    expect(gaugeRgb(80)).toEqual([245, 158, 11])
    expect(gaugeRgb(75)).toEqual([239, 68, 68])
    expect(gaugeRgb(40)).toEqual([239, 68, 68])
  })
  it('blends between anchors rather than stepping', () => {
    const mid = gaugeRgb(85) // halfway amber → emerald
    expect(mid[0]).toBeGreaterThan(16); expect(mid[0]).toBeLessThan(245)
    expect(mid[1]).toBeGreaterThan(158); expect(mid[1]).toBeLessThan(185)
  })
  it('never jumps: a 0.1-point change moves no channel by more than 7 levels', () => {
    for (let s = 60; s < 100; s += 0.1) {
      const a = gaugeRgb(s), b = gaugeRgb(s + 0.1)
      for (let k = 0; k < 3; k++) expect(Math.abs(a[k] - b[k])).toBeLessThanOrEqual(7)
    }
  })
  it('formats as a CSS colour', () => { expect(gaugeColor(100)).toBe('rgb(16 185 129)') })
  it('keeps its anchors in ascending order', () => {
    const s = GAUGE_STOPS.map((x) => x.soh)
    expect([...s].sort((a, b) => a - b)).toEqual(s)
  })
})

describe('grade bands agree with the certificate scale', () => {
  it('tile 0–100 with no gaps or overlaps', () => {
    expect(GRADE_BANDS[0].from).toBe(0); expect(GRADE_BANDS[GRADE_BANDS.length - 1].to).toBe(100)
    for (let i = 1; i < GRADE_BANDS.length; i++) expect(GRADE_BANDS[i].from).toBe(GRADE_BANDS[i - 1].to)
  })
  it('match gradeOf at the start, the middle and just inside the end of every band', () => {
    for (const { grade, from, to } of GRADE_BANDS) {
      expect(gradeOf(from)).toBe(grade)
      expect(gradeOf((from + to) / 2)).toBe(grade)
      expect(gradeOf(to - 0.01)).toBe(grade)
    }
  })
})
