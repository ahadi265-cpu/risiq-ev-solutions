import { describe, it, expect } from 'vitest'
import { batteryFactor, bookFactor, gradeOf } from '@/lib/data'
import { CAR, GENTLE, KM_MAX, collateral, guess, kmPerYearOf, sohAt, type Life } from '@/lib/collateral'

const TAXI: Life = { fast: 80, temp: 32, years: 4 }

describe('Blind Spot collateral model', () => {
  it('Car A is the gentle life and does not depend on Car B\'s settings', () => {
    const a1 = collateral(60_000, TAXI).sohA
    const a2 = collateral(60_000, { fast: 0, temp: 10, years: 4 }).sohA
    expect(a1).toBeCloseTo(a2, 6)
  })

  it('a hard life is never healthier than a gentle one at the same odometer', () => {
    for (let km = 0; km <= KM_MAX; km += 10_000) {
      const c = collateral(km, TAXI)
      expect(c.sohB).toBeLessThanOrEqual(c.sohA + 1e-9)
    }
  })

  it('dragging the odometer up lowers Car B\'s health, and never raises it', () => {
    let prev = 101
    for (let km = 0; km <= KM_MAX; km += 5_000) {
      const s = collateral(km, TAXI).sohB
      expect(s).toBeLessThanOrEqual(prev + 1e-9); prev = s
    }
  })

  it('dragging fast charging up lowers Car B\'s health, and never raises it', () => {
    let prev = 101
    for (let fast = 0; fast <= 100; fast += 5) {
      const s = collateral(80_000, { ...TAXI, fast }).sohB
      expect(s).toBeLessThanOrEqual(prev + 1e-9); prev = s
    }
  })

  it('reprices the car for its battery: adjusted never exceeds book, and the grade follows the measured SoH', () => {
    for (const km of [0, 40_000, 90_000, 150_000]) {
      const c = collateral(km, TAXI)
      expect(c.adjusted).toBeLessThanOrEqual(c.book + 1e-6)
      expect(c.gradeB).toBe(gradeOf(c.sohB)); expect(c.gradeA).toBe(gradeOf(c.sohA))
    }
  })

  it('value at risk is exactly book × the battery-factor gap, and is never negative', () => {
    const c = collateral(90_000, TAXI)
    expect(c.atRisk).toBeCloseTo(c.book * (batteryFactor(c.sohA) - batteryFactor(c.sohB)), 4)
    // a car gentler than Car A would otherwise report negative exposure
    expect(collateral(90_000, { fast: 0, temp: 8, years: 4 }, TAXI).atRisk).toBe(0)
  })

  it('book value uses the Atto 3 price and age/odometer depreciation only', () => {
    const c = collateral(60_000, TAXI)
    expect(c.book).toBeCloseTo(CAR.price * bookFactor(TAXI.years, 60_000), 4)
  })

  it('keeps the model\'s own 40–100 band at the extremes of every slider', () => {
    for (const life of [GENTLE, TAXI, { fast: 100, temp: 40, years: 6 }, { fast: 0, temp: 5, years: 1 }]) {
      for (const km of [0, KM_MAX]) { const s = sohAt(km, life, kmPerYearOf(km, life.years)); expect(s).toBeGreaterThanOrEqual(40); expect(s).toBeLessThanOrEqual(100) }
    }
  })

  it('odometer-only guess ignores habit and falls with mileage', () => {
    expect(guess(0)).toBe(100)
    expect(guess(100_000)).toBe(94)
  })
})
