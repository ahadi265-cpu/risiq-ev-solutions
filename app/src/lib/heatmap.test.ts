import { describe, it, expect } from 'vitest'
import { cellMap, toneOf, outlierCells, CELLS } from '@/lib/heatmap'

describe('cellMap', () => {
  it('draws 96 cells inside the 35–100 band', () => {
    const cells = cellMap('RISIQ-0003', 71)
    expect(cells).toHaveLength(CELLS)
    for (const v of cells) { expect(v).toBeGreaterThanOrEqual(35); expect(v).toBeLessThanOrEqual(100) }
  })

  it('is deterministic per certificate id', () => {
    expect(cellMap('RISIQ-0001', 94)).toEqual(cellMap('RISIQ-0001', 94))
    expect(cellMap('RISIQ-0001', 94)).not.toEqual(cellMap('RISIQ-0002', 94))
  })

  it('spreads wider as the pack degrades', () => {
    const range = (c: number[]) => Math.max(...c) - Math.min(...c)
    expect(range(cellMap('RISIQ-0003', 71))).toBeGreaterThan(range(cellMap('RISIQ-0003', 96)))
  })
})

describe('toneOf', () => {
  it('uses the certificate’s own A–D thresholds', () => {
    expect(toneOf(92).key).toBe('a'); expect(toneOf(91.9).key).toBe('b')
    expect(toneOf(85).key).toBe('b'); expect(toneOf(84.9).key).toBe('c')
    expect(toneOf(78).key).toBe('c'); expect(toneOf(77.9).key).toBe('d')
  })
})

describe('outlierCells', () => {
  it('always includes the weakest cell', () => {
    const cells = cellMap('RISIQ-0001', 94)
    const weakest = cells.indexOf(Math.min(...cells))
    expect(outlierCells(cells, 94).has(weakest)).toBe(true)
  })

  it('never pulses the whole pack, even when every cell is below the floor', () => {
    // regression: an earlier rule pulsed all 96 cells on a Grade C pack, which strobed
    const degraded = cellMap('RISIQ-0003', 62)
    expect(degraded.every((v) => v < 85)).toBe(true)
    expect(outlierCells(degraded, 62).size).toBeLessThanOrEqual(7)
  })

  it('pulses only cells clearly below the pack average', () => {
    const cells = cellMap('RISIQ-0001', 94)
    for (const i of outlierCells(cells, 94)) {
      const isWeakest = cells[i] === Math.min(...cells)
      expect(isWeakest || cells[i] < 94 - 1.5).toBe(true)
    }
  })
})
