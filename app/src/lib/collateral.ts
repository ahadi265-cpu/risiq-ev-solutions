/** The Blind Spot calculator's maths, lifted out of the component so the gauge,
 *  the counters and the chart all read one tested source. Uses the same battery
 *  model as the certificate (lib/data.ts). */
import { FLEET, modelSoH, gradeOf, bookFactor, batteryFactor, type Grade } from '@/lib/data'

export type Life = { fast: number; temp: number; years: number }

/** The car every Blind Spot figure is quoted for. */
export const CAR = FLEET[0] // BYD Atto 3
export const KM_PER_CYCLE = CAR.range * 0.8
export const KM_MAX = 150_000

/** Car A: gentle commuting — 90 % overnight slow AC, kept in the shade. */
export const GENTLE: Life = { fast: 10, temp: 18, years: 4 }

/** What a buyer infers from the odometer alone — a flat, habit-blind rule of thumb. */
export const guess = (km: number) => 100 - (km / 100_000) * 6

/** State of health after `km` for a car living `life`; km → years scales with the marker's own pace. */
export const sohAt = (km: number, life: Life, kmPerYear: number) =>
  modelSoH(km / kmPerYear, km / KM_PER_CYCLE, life.temp, life.fast / 100).soh

export const kmPerYearOf = (km: number, years: number) => Math.max(4_000, km / Math.max(0.5, years))

export type Collateral = {
  sohA: number; sohB: number; gradeA: Grade; gradeB: Grade
  /** residual from age and odometer alone, battery ignored (Br) */
  book: number
  /** the same car repriced for its measured battery (Br) */
  adjusted: number
  /** battery-driven value Car B has lost against Car A (Br, never negative) */
  atRisk: number
}

export function collateral(km: number, b: Life, a: Life = GENTLE): Collateral {
  const perYear = kmPerYearOf(km, b.years)
  const sohA = sohAt(km, a, perYear), sohB = sohAt(km, b, perYear)
  const book = CAR.price * bookFactor(b.years, km)
  return {
    sohA, sohB, gradeA: gradeOf(sohA), gradeB: gradeOf(sohB),
    book,
    adjusted: book * batteryFactor(sohB),
    atRisk: Math.max(0, book * (batteryFactor(sohA) - batteryFactor(sohB))),
  }
}
