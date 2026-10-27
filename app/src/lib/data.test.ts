import { describe, it, expect } from 'vitest'
import {
  modelSoH, decayCurve, gradeOf, bookFactor, batteryFactor, hashStr, mulberry32, filterCompat, COMPAT, COMPAT_LIMIT, GRADES, EVIDENCE,
} from '@/lib/data'

describe('battery model', () => {
  it('starts a new pack at 100%', () => {
    expect(modelSoH(0, 0, 25).soh).toBe(100)
  })

  it('degrades with age, cycles, heat and fast charging, each on its own', () => {
    const ref = modelSoH(3, 400, 20, 0.1).soh
    expect(modelSoH(6, 400, 20, 0.1).soh).toBeLessThan(ref)
    expect(modelSoH(3, 900, 20, 0.1).soh).toBeLessThan(ref)
    expect(modelSoH(3, 400, 35, 0.1).soh).toBeLessThan(ref)
    expect(modelSoH(3, 400, 20, 1).soh).toBeLessThan(ref)
  })

  it('never leaves the 40–100 band', () => {
    expect(modelSoH(50, 20_000, 45, 1).soh).toBe(40)
    expect(modelSoH(-5, -100, 0).soh).toBe(100)
  })

  it('draws a decay curve that starts at 100 and never rises', () => {
    const curve = decayCurve(4, 600, 16, 0.3)
    expect(curve[0]).toMatchObject({ year: 0, actual: 100 })
    for (let i = 1; i < curve.length; i++) expect(curve[i].actual).toBeLessThanOrEqual(curve[i - 1].actual)
  })

  it('keeps the illustrative OBD line at or above the measured line', () => {
    for (const p of decayCurve(8, 900, 31, 1)) expect(p.obd).toBeGreaterThanOrEqual(p.actual)
  })
})

describe('grades', () => {
  it('cuts at exactly 92 / 85 / 78', () => {
    expect(gradeOf(100)).toBe('A'); expect(gradeOf(92)).toBe('A'); expect(gradeOf(91.99)).toBe('B')
    expect(gradeOf(85)).toBe('B'); expect(gradeOf(84.99)).toBe('C')
    expect(gradeOf(78)).toBe('C'); expect(gradeOf(77.99)).toBe('D'); expect(gradeOf(40)).toBe('D')
  })

  it('has a legend entry for every grade, in order', () => {
    expect(GRADES.map((g) => g.g)).toEqual(['A', 'B', 'C', 'D'])
  })
})

describe('valuation', () => {
  it('book value is 1 when new and falls with age and mileage', () => {
    expect(bookFactor(0, 0)).toBe(1)
    expect(bookFactor(3, 0)).toBeLessThan(bookFactor(1, 0))
    expect(bookFactor(1, 100_000)).toBeLessThan(bookFactor(1, 10_000))
  })

  it('mileage depreciation floors at 55% of book', () => {
    expect(bookFactor(0, 10_000_000)).toBeCloseTo(0.55, 10)
  })

  it('battery factor is 1 at full health and floors at 65% below 60% SoH', () => {
    expect(batteryFactor(100)).toBe(1)
    expect(batteryFactor(80)).toBeCloseTo(0.825, 10)
    expect(batteryFactor(60)).toBeCloseTo(0.65, 10)
    expect(batteryFactor(40)).toBeCloseTo(0.65, 10)
  })
})

describe('seeded randomness', () => {
  it('hashes deterministically and distinguishes ids', () => {
    expect(hashStr('RISIQ-0001')).toBe(hashStr('RISIQ-0001'))
    expect(hashStr('RISIQ-0001')).not.toBe(hashStr('RISIQ-0002'))
  })

  it('replays the same sequence for the same seed, inside [0, 1)', () => {
    const a = mulberry32(42), b = mulberry32(42)
    for (let i = 0; i < 50; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('compatibility search', () => {
  it('shows only the common models when the query is empty, capped at the list limit', () => {
    const hits = filterCompat('')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.length).toBeLessThanOrEqual(COMPAT_LIMIT)
    expect(hits.every((c) => c.common)).toBe(true)
  })

  it('leads the default view with the field-tested Addis models', () => {
    const first = filterCompat('').slice(0, 3)
    expect(first.every((c) => c.field?.status === 'certified')).toBe(true)
    expect(first.map((c) => c.model)).toContain('Seagull')
  })

  it('matches make, model and segment, ignoring case and whitespace', () => {
    expect(filterCompat('  LEAF ').map((c) => c.model)).toEqual(['Leaf'])
    expect(filterCompat('byd').every((c) => c.make === 'BYD')).toBe(true)
    expect(filterCompat('byd').length).toBe(COMPAT.filter((c) => c.make === 'BYD').length)
    expect(filterCompat('city car').length).toBeGreaterThan(0)
  })

  it('returns nothing for a car that is not in the list', () => {
    expect(filterCompat('tesla')).toEqual([])
  })

  it('reports locked OBD on the Chinese imports and readable on the Leaf', () => {
    expect(filterCompat('Atto 3')[0].obd).toBe('locked')
    expect(filterCompat('Leaf')[0].obd).toBe('readable')
  })
})

describe('Addis Ababa field programme', () => {
  it('certifies the three models with completed field sessions and keeps the Sealion in validation', () => {
    const status = (m: string) => COMPAT.find((c) => c.model.startsWith(m))?.field?.status
    expect(status('Seagull')).toBe('certified')
    expect(status('Yuan UP')).toBe('certified')
    expect(status('Leopard')).toBe('certified')
    expect(status('Sealion')).toBe('validating')
    expect(status('Atto 3')).toBeUndefined()
  })

  it('every field profile states the test types, pack architecture and confidence band', () => {
    for (const c of COMPAT.filter((c) => c.field)) {
      expect(c.field!.tests).toMatch(/Rapid/)
      expect(c.field!.tests).toMatch(/Reference/)
      expect(c.field!.architecture).toMatch(/LFP Blade/)
      expect(c.field!.confidence).toMatch(/±3%/)
    }
  })

  it('publishes three case studies whose headline figures match the field reports', () => {
    expect(EVIDENCE.map((e) => e.model)).toEqual(['Seagull', 'Yuan UP', 'Leopard'])
    const stat = (id: string, unit: string) => EVIDENCE.find((e) => e.id === id)!.stats.find((s) => s.unit === unit)!.n
    expect(stat('seagull', 'km')).toBe(32695)
    expect(stat('seagull', 'sessions')).toBe(290)
    expect(stat('seagull', '%')).toBe(97.2)
    expect(stat('seagull', 'mV')).toBe(51)
    expect(stat('yuan-up', 'kWh')).toBe(45.12)
    expect(stat('yuan-up', '%')).toBe(98.4)
    expect(stat('yuan-up', 'mV')).toBe(5)
    expect(stat('yuan-up', 'cells')).toBe(94)
    expect(stat('leopard', 'cells')).toBe(142)
    expect(stat('leopard', 'V')).toBe(454)
  })

  it('labels only the Seagull as measured — the other two carry a health index, not a measured SoH', () => {
    expect(EVIDENCE.find((e) => e.id === 'seagull')!.method).toMatch(/^Measured/)
    for (const id of ['yuan-up', 'leopard']) expect(EVIDENCE.find((e) => e.id === id)!.method).toMatch(/^Health index/)
  })
})
