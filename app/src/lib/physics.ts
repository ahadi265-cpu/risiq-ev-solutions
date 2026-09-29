/**
 * Cursor repulsion with a spring return, on flat xyz Float32Array buffers.
 * Pure: no THREE, no React — HeroCanvas feeds it the raycaster-projected
 * cursor each frame, and the unit tests feed it hand-built points.
 *
 * Units are world units; the hero scene spans roughly ±11 × ±6 × ±6.
 */
export type SpringParams = {
  /** particles closer than this to the cursor are pushed */
  radius: number
  /** peak push, at zero distance, before the quadratic falloff */
  strength: number
  /** stiffness of the pull back to each particle's rest position */
  springK: number
  /** exponential velocity decay per second — framerate-independent */
  damping: number
}

export const DEFAULT_SPRING: SpringParams = { radius: 2.4, strength: 7, springK: 2.4, damping: 3.2 }

/** A dropped frame (tab switch, GC pause) must not become a giant step. */
export const MAX_DT = 1 / 30

export type Cursor = { x: number; y: number; z: number }

/**
 * Advances every particle by one step. `positions` and `velocity` are
 * mutated in place; `base` is read only. Returns the clamped dt actually
 * integrated so callers can reuse it for anything else they animate.
 */
export function repelSpringStep(
  positions: Float32Array, base: Float32Array, velocity: Float32Array,
  count: number, cursor: Cursor, rawDt: number, params: SpringParams = DEFAULT_SPRING,
): number {
  const dt = Math.min(rawDt, MAX_DT)
  const damp = Math.exp(-params.damping * dt)
  const r2 = params.radius * params.radius

  for (let i = 0; i < count; i++) {
    const ix = i * 3, iy = ix + 1, iz = ix + 2
    const dx = positions[ix] - cursor.x, dy = positions[iy] - cursor.y, dz = positions[iz] - cursor.z
    const distSq = dx * dx + dy * dy + dz * dz
    // distSq > 1e-6 guards the cursor sitting exactly on a particle: the
    // direction would be 0/0 and the whole buffer would fill with NaN.
    if (distSq < r2 && distSq > 1e-6) {
      const dist = Math.sqrt(distSq)
      const falloff = 1 - dist / params.radius
      const f = falloff * falloff * params.strength
      velocity[ix] += (dx / dist) * f * dt
      velocity[iy] += (dy / dist) * f * dt
      velocity[iz] += (dz / dist) * f * dt
    }
    // spring pulling every particle back toward its resting position
    velocity[ix] += (base[ix] - positions[ix]) * params.springK * dt
    velocity[iy] += (base[iy] - positions[iy]) * params.springK * dt
    velocity[iz] += (base[iz] - positions[iz]) * params.springK * dt

    velocity[ix] *= damp; velocity[iy] *= damp; velocity[iz] *= damp
    positions[ix] += velocity[ix] * dt
    positions[iy] += velocity[iy] * dt
    positions[iz] += velocity[iz] * dt
  }
  return dt
}
