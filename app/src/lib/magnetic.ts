/**
 * How far a magnetic control leans toward the cursor. Pure; MagneticButton
 * measures the element and the pointer, this decides the offset.
 *
 * `dx`/`dy` are cursor minus element centre. The control engages when the
 * cursor is within `range` px of its edge (approximated by its larger half
 * dimension) and pulls harder the nearer the cursor gets to centre.
 */
export function magneticOffset(
  dx: number, dy: number, width: number, height: number, range = 40, strength = 0.4,
): { x: number; y: number; active: boolean } {
  const dist = Math.hypot(dx, dy)
  const reach = Math.max(width, height) / 2 + range
  if (dist >= reach) return { x: 0, y: 0, active: false }
  const pull = 1 - dist / reach
  return { x: dx * strength * pull, y: dy * strength * pull, active: true }
}
