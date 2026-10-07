import { describe, it, expect } from 'vitest'
import {
  BOARD, CAVITY, CENTER_Y, FACE_X, HOLSTER_X, MOUTH, PLUG, PLUG_TRACK, PROBE, PROBE_BOX, PROBE_STOP, SEATED_TIP_X, SEATED_X, SOCKET,
} from '@/components/rig/geometry'

describe('socket rig geometry', () => {
  it('seats the plug with its flange exactly on the panel face', () => {
    expect(SEATED_X + PLUG.flangeRight).toBe(FACE_X)
  })

  it('drives the pins into the socket tubes without piercing the back wall', () => {
    expect(SEATED_TIP_X).toBeGreaterThan(SOCKET.x0)   // pins have entered the tubes
    expect(SEATED_TIP_X).toBeLessThan(SOCKET.x1)      // …but stop inside them
    expect(SEATED_X + PLUG.pinTip).toBe(SEATED_TIP_X)
  })

  it('lets the shroud into the cavity but stops the flange at the mouth', () => {
    const shroudH = PLUG.shroudY1 - PLUG.shroudY0
    expect(shroudH).toBeLessThan(CAVITY.y1 - CAVITY.y0)       // shroud fits the cavity
    expect(PLUG.h).toBeGreaterThan(MOUTH.y1 - MOUTH.y0)       // flange is bigger than the mouth
  })

  it('keeps the cavity inside the mouth and the sockets behind the cavity', () => {
    expect(CAVITY.y0).toBeGreaterThanOrEqual(MOUTH.y0); expect(CAVITY.y1).toBeLessThanOrEqual(MOUTH.y1)
    expect(CAVITY.x0).toBeGreaterThan(FACE_X); expect(SOCKET.x0).toBe(CAVITY.x1)
    expect(SOCKET.x1).toBeLessThanOrEqual(BOARD.w)
  })

  it('centres the plug and the mouth on the same axis', () => {
    expect((MOUTH.y0 + MOUTH.y1) / 2).toBe(CENTER_Y)
    expect((CAVITY.y0 + CAVITY.y1) / 2).toBe(CENTER_Y)
    expect(PLUG_TRACK.top + PLUG_TRACK.height / 2).toBeCloseTo((CENTER_Y / BOARD.h) * 100, 2)
  })

  it('holds the plug track inside the board, and the plug exactly fills it when seated', () => {
    expect(PLUG_TRACK.left).toBeGreaterThanOrEqual(0)
    expect(PLUG_TRACK.left + PLUG_TRACK.width).toBeLessThanOrEqual(100)
    const trackUnits = SEATED_TIP_X - HOLSTER_X
    expect((PLUG_TRACK.plugShare / 100) * trackUnits).toBeCloseTo(PLUG.w, 1)
    // parked at the holster the whole plug is clear of the panel
    expect(HOLSTER_X + PLUG.w).toBeLessThan(FACE_X)
  })

  it('stops the refused probe short of the mouth, never past the face', () => {
    const stopLeft = HOLSTER_X + (PROBE_BOX.travel / 100) * PROBE.w
    expect(stopLeft + PROBE.tip).toBeCloseTo(FACE_X - PROBE_STOP, 1)
    expect(stopLeft + PROBE.tip).toBeLessThan(FACE_X)
    expect(PROBE_BOX.travel).toBeGreaterThan(0)
  })
})
