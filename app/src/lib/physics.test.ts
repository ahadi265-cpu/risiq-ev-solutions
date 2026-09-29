import { describe, it, expect } from 'vitest'
import { repelSpringStep, DEFAULT_SPRING, MAX_DT } from '@/lib/physics'

/** Builds the three buffers from a list of rest positions. */
const field = (pts: [number, number, number][]) => {
  const base = new Float32Array(pts.flat())
  return { base, positions: base.slice(), velocity: new Float32Array(pts.length * 3), count: pts.length }
}
const FAR = { x: 100, y: 100, z: 100 }
const ORIGIN = { x: 0, y: 0, z: 0 }
const STEP = 1 / 60

describe('repelSpringStep', () => {
  it('pushes a particle inside the radius directly away from the cursor', () => {
    const f = field([[0.5, 0, 0]])
    for (let i = 0; i < 10; i++) repelSpringStep(f.positions, f.base, f.velocity, f.count, ORIGIN, STEP)
    expect(f.positions[0]).toBeGreaterThan(0.5)
    expect(f.positions[1]).toBeCloseTo(0, 6)
    expect(f.positions[2]).toBeCloseTo(0, 6)
  })

  it('leaves a particle outside the radius exactly at rest', () => {
    const f = field([[DEFAULT_SPRING.radius + 1, 0, 0]])
    repelSpringStep(f.positions, f.base, f.velocity, f.count, ORIGIN, STEP)
    expect(Array.from(f.velocity)).toEqual([0, 0, 0])
    expect(f.positions[0]).toBe(f.base[0])
  })

  it('springs a displaced particle back to its rest position and settles', () => {
    const f = field([[0, 0, 0]])
    f.positions[0] = 3
    for (let i = 0; i < 600; i++) repelSpringStep(f.positions, f.base, f.velocity, f.count, FAR, STEP)
    expect(Math.abs(f.positions[0])).toBeLessThan(0.02)
    expect(Math.abs(f.velocity[0])).toBeLessThan(0.02)
  })

  it('never produces NaN when the cursor sits exactly on a particle', () => {
    const f = field([[0, 0, 0], [0.3, 0.2, 0.1]])
    for (let i = 0; i < 20; i++) repelSpringStep(f.positions, f.base, f.velocity, f.count, ORIGIN, STEP)
    for (const v of [...f.positions, ...f.velocity]) expect(Number.isFinite(v)).toBe(true)
  })

  it('clamps a dropped-frame timestep', () => {
    const f = field([[1, 0, 0]])
    expect(repelSpringStep(f.positions, f.base, f.velocity, f.count, FAR, 1)).toBe(MAX_DT)
    expect(repelSpringStep(f.positions, f.base, f.velocity, f.count, FAR, 0.005)).toBe(0.005)
  })

  it('only touches the first `count` particles', () => {
    const f = field([[0.5, 0, 0], [0.5, 0, 0]])
    repelSpringStep(f.positions, f.base, f.velocity, 1, ORIGIN, STEP)
    expect(f.positions[3]).toBe(0.5)
    expect(f.velocity[3]).toBe(0)
  })
})
