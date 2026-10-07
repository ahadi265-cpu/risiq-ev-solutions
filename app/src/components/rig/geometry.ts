/** One coordinate system for the socket rig. The port art is an SVG drawn on a
 *  420 × 300 board; the plug and probe are HTML boxes positioned over it in
 *  percentages of that board, so both scale together. Every number the art and
 *  the layout must agree on lives here, and geometry.test.ts pins the
 *  invariants (flange meets the face, pins reach the sockets) so an edit to one
 *  side can't silently drift from the other. */
export const BOARD = { w: 420, h: 300 } as const
export const CENTER_Y = 150

/** The vehicle panel in section: its outer face, the inlet's mouth and cavity. */
export const FACE_X = 270
export const MOUTH = { y0: 102, y1: 198 } as const          // opening in the panel face
export const CAVITY = { x0: 284, x1: 340, y0: 110, y1: 190 } as const
export const SOCKET = { x0: 340, x1: 372 } as const         // pin tubes in the back wall

/** The charging plug, in its own art units (viewBox 0 0 204 112). */
export const PLUG = { w: 204, h: 112, flangeRight: 108, shroudY0: 26, shroudY1: 86, pinTip: 204 } as const
/** Holster position (left edge) before the plug is seated. */
export const HOLSTER_X = 6

/** The OBD diagnostic probe (viewBox 0 0 170 80). */
export const PROBE = { w: 170, h: 80, tip: 166 } as const
/** How far short of the mouth the probe's tip stops when it is refused. */
export const PROBE_STOP = 10

const pct = (v: number, of: number) => +((v / of) * 100).toFixed(3)

/** Left edge of the plug when fully seated: its flange meets the panel face. */
export const SEATED_X = FACE_X - PLUG.flangeRight
export const SEATED_TIP_X = SEATED_X + PLUG.pinTip

/** Plug track: spans holster → seated tip, so justify-start/justify-end are the two states. */
export const PLUG_TRACK = {
  left: pct(HOLSTER_X, BOARD.w),
  width: pct(SEATED_TIP_X - HOLSTER_X, BOARD.w),
  top: pct(CENTER_Y - PLUG.h / 2, BOARD.h),
  height: pct(PLUG.h, BOARD.h),
  /** plug width as a share of its own track */
  plugShare: pct(PLUG.w, SEATED_TIP_X - HOLSTER_X),
} as const

/** Probe: sits at the holster, travels `travel` of its own width toward the mouth, and stops short. */
export const PROBE_BOX = {
  left: pct(HOLSTER_X, BOARD.w),
  width: pct(PROBE.w, BOARD.w),
  top: pct(CENTER_Y - PROBE.h / 2, BOARD.h),
  height: pct(PROBE.h, BOARD.h),
  travel: +(((FACE_X - PROBE_STOP - PROBE.tip) - HOLSTER_X) / PROBE.w * 100).toFixed(2),
} as const
