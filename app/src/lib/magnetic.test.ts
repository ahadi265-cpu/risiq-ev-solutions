import { describe, it, expect } from 'vitest'
import { magneticOffset } from '@/lib/magnetic'

const W = 200, H = 56 // a typical CTA; reach = 100 + range

describe('magneticOffset', () => {
  it('is inert once the cursor is beyond reach', () => {
    expect(magneticOffset(500, 0, W, H)).toEqual({ x: 0, y: 0, active: false })
    expect(magneticOffset(0, 141, W, H, 40)).toEqual({ x: 0, y: 0, active: false })
  })

  it('pulls toward the cursor, in the cursor’s direction', () => {
    const o = magneticOffset(30, -18, W, H)
    expect(o.active).toBe(true)
    expect(o.x).toBeGreaterThan(0)
    expect(o.y).toBeLessThan(0)
  })

  it('pulls harder the closer the cursor is to centre', () => {
    const near = magneticOffset(10, 0, W, H), mid = magneticOffset(60, 0, W, H), edge = magneticOffset(130, 0, W, H)
    expect(near.x / 10).toBeGreaterThan(mid.x / 60)
    expect(mid.x / 60).toBeGreaterThan(edge.x / 130)
  })

  it('never travels more than strength × the cursor offset', () => {
    for (const dx of [5, 40, 90, 135]) expect(Math.abs(magneticOffset(dx, 0, W, H, 40, 0.4).x)).toBeLessThanOrEqual(dx * 0.4 + 1e-9)
  })

  it('engages further out as range grows', () => {
    expect(magneticOffset(150, 0, W, H, 40).active).toBe(false)
    expect(magneticOffset(150, 0, W, H, 60).active).toBe(true)
  })

  it('is exactly centred when the cursor is centred', () => {
    expect(magneticOffset(0, 0, W, H)).toEqual({ x: 0, y: 0, active: true })
  })
})
