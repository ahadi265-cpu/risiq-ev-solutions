/** Shared domain data and the battery model behind every RISIQ number. */

export type Vehicle = {
  id: string; name: string; kwh: number; range: number; price: number; seg: string
}

export const FLEET: Vehicle[] = [
  { id: 'atto3',   name: 'BYD Atto 3',    kwh: 60.5, range: 420, price: 4_500_000, seg: 'SUV' },
  { id: 'dolphin', name: 'BYD Dolphin',   kwh: 44.9, range: 405, price: 3_200_000, seg: 'Hatchback' },
  { id: 'song',    name: 'BYD Song Plus', kwh: 71.8, range: 505, price: 5_400_000, seg: 'SUV' },
  { id: 'yuan',    name: 'BYD Yuan Plus', kwh: 60.5, range: 430, price: 4_300_000, seg: 'SUV' },
  { id: 'e2',      name: 'BYD e2',        kwh: 43.2, range: 405, price: 2_900_000, seg: 'Hatchback' },
]

export const CLIMATES = [
  { id: 'addis',   label: 'Addis Ababa',   temp: 16, note: '2,355 m — mild all year' },
  { id: 'hawassa', label: 'Hawassa',       temp: 20, note: '1,700 m — warm temperate' },
  { id: 'dire',    label: 'Dire Dawa',     temp: 26, note: 'lowland heat' },
  { id: 'afar',    label: 'Afar corridor', temp: 31, note: 'extreme — import route' },
] as const

/* Calendar fade follows a square-root-of-time law with an Arrhenius temperature
   term (rate roughly doubles per +10 °C); cycle fade is linear in equivalent
   full cycles. Constants sit in the published range for automotive LFP packs. */
const T_REF = 25, K_CAL = 2.2, K_CYC = 0.0115
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const arrhenius = (t: number) => Math.pow(2, (t - T_REF) / 10)

/** fastShare 0..1 — DC fast charging is harder on a pack than overnight AC.
 *  At 100% fast charging cycle wear runs ~45% higher than all-slow. */
export function modelSoH(years: number, cycles: number, temp: number, fastShare = 0.3) {
  const calendar = K_CAL * Math.sqrt(Math.max(0, years)) * arrhenius(temp)
  const cyclic = K_CYC * cycles * (1 + 0.45 * clamp(fastShare, 0, 1))
  return { soh: clamp(100 - calendar - cyclic, 40, 100), calendar, cyclic }
}

/** Year-by-year decay for the chart: what the socket measures against what the
 *  car's own OBD/dashboard reports. A BMS estimate is a software model, seldom
 *  recalibrated, and drifts optimistic as a pack ages — illustrated here as
 *  registering ~60% of the true fade. */
const OBD_VISIBILITY = 0.6
export function decayCurve(years: number, cycles: number, temp: number, fastShare: number) {
  const span = Math.max(8, Math.ceil(years) + 2)
  const perYear = years > 0 ? cycles / years : 150
  return Array.from({ length: span + 1 }, (_, y) => {
    const actual = modelSoH(y, perYear * y, temp, fastShare).soh
    return { year: y, actual: +actual.toFixed(1), obd: +(100 - (100 - actual) * OBD_VISIBILITY).toFixed(1) }
  })
}

export type Grade = 'A' | 'B' | 'C' | 'D'
export const gradeOf = (s: number): Grade => (s >= 92 ? 'A' : s >= 85 ? 'B' : s >= 78 ? 'C' : 'D')

/* Book depreciation ignores the pack; the battery factor reprices it. The gap
   between the two is the exposure a lender currently cannot see. */
const PACK_SHARE = 0.35
export const bookFactor = (years: number, km: number) =>
  Math.pow(0.86, years) * Math.max(0.55, 1 - km / 500_000)
export const batteryFactor = (soh: number) =>
  1 - PACK_SHARE + PACK_SHARE * clamp((soh - 60) / 40, 0, 1)

/** Illustrative pilot fleet — the shape of the report a partner receives. */
export type PilotRow = {
  id: string; model: string; odo: number; soh: number; grade: Grade; rated: number; meas: number
}
export const PILOT: PilotRow[] = [
  { id: 'P01', model: 'Atto 3',    odo: 18400, soh: 97.1, grade: 'A', rated: 420, meas: 408 },
  { id: 'P02', model: 'Dolphin',   odo: 62800, soh: 95.4, grade: 'A', rated: 405, meas: 386 },
  { id: 'P03', model: 'Song Plus', odo: 24100, soh: 88.2, grade: 'B', rated: 505, meas: 445 },
  { id: 'P04', model: 'Atto 3',    odo: 71500, soh: 93.8, grade: 'A', rated: 420, meas: 394 },
  { id: 'P05', model: 'Yuan Plus', odo: 33900, soh: 84.6, grade: 'C', rated: 430, meas: 364 },
  { id: 'P06', model: 'Dolphin',   odo: 47200, soh: 91.7, grade: 'B', rated: 405, meas: 371 },
  { id: 'P07', model: 'Song Plus', odo: 12600, soh: 90.3, grade: 'B', rated: 505, meas: 456 },
  { id: 'P08', model: 'Atto 3',    odo: 55400, soh: 96.2, grade: 'A', rated: 420, meas: 404 },
  { id: 'P09', model: 'e2',        odo: 88300, soh: 79.4, grade: 'C', rated: 405, meas: 322 },
  { id: 'P10', model: 'Yuan Plus', odo: 29700, soh: 74.8, grade: 'D', rated: 430, meas: 322 },
]

export type Flag = { level: 'notice' | 'warning'; text: string }
export type Benchmark = 'below' | 'average' | 'above'
export const CERTIFICATES: Record<string, {
  vehicle: string; year: number; testType: string; testDate: string; stateOfHealth: number
  grade: Grade; usableCapacityKwh: number; nominalKwh: number; estimatedRangeKm: number; location: string; status: string
  benchmark: Benchmark; flags: Flag[]
}> = {
  /* All three samples are BYD — the fleet Ethiopia actually has. */
  'RISIQ-0001': { vehicle: 'BYD Atto 3', year: 2024, testType: 'Reference Test', testDate: '2026-06-18', stateOfHealth: 94, grade: 'A', usableCapacityKwh: 57.8, nominalKwh: 60.5, estimatedRangeKm: 402, location: 'Addis Ababa, Ethiopia', status: 'Valid', benchmark: 'above', flags: [] },
  'RISIQ-0002': { vehicle: 'BYD Dolphin', year: 2023, testType: 'Rapid Check', testDate: '2026-07-02', stateOfHealth: 86, grade: 'B', usableCapacityKwh: 38.6, nominalKwh: 44.9, estimatedRangeKm: 348, location: 'Addis Ababa, Ethiopia', status: 'Valid', benchmark: 'average',
    flags: [{ level: 'notice', text: 'Rapid Check on a partial charge window — confidence band ±6% rather than ±3%' }] },
  'RISIQ-0003': { vehicle: 'BYD Yuan Plus', year: 2022, testType: 'Reference Test', testDate: '2026-07-14', stateOfHealth: 71, grade: 'C', usableCapacityKwh: 43.0, nominalKwh: 60.5, estimatedRangeKm: 305, location: 'Addis Ababa, Ethiopia', status: 'Valid', benchmark: 'below',
    flags: [{ level: 'warning', text: 'Capacity below the 80% manufacturer warranty floor' },
            { level: 'warning', text: 'Cell spread above 4 pp between weakest and strongest module' }] },
}

/** What each grade means in plain language — the same scale on every certificate. */
export const GRADES: { g: Grade; range: string; title: string; meaning: string }[] = [
  { g: 'A', range: '92–100%', title: 'Like new', meaning: 'Full value. Nothing to price in.' },
  { g: 'B', range: '85–92%', title: 'Healthy', meaning: 'Normal wear for its age and mileage.' },
  { g: 'C', range: '78–85%', title: 'Watch', meaning: 'Price the battery in, and re-test at 12 months.' },
  { g: 'D', range: 'below 78%', title: 'Below the floor', meaning: 'Under the manufacturer warranty floor. Repair or replace before lending or insuring.' },
]

export const fmt = (n: number, d = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
export const etb = (n: number) => `${fmt(Math.round(n))} Br`
/* Indicative mid-market rate, September 2026 — update when it moves. Birr stays the primary figure. */
export const ETB_PER_USD = 162
export const usd = (birr: number) => `$${fmt(Math.round(birr / ETB_PER_USD))}`

/* deterministic PRNG so a certificate's cell map is identical on every visit */
export function hashStr(s: string) {
  let a = 2166136261
  for (let i = 0; i < s.length; i++) { a ^= s.charCodeAt(i); a = Math.imul(a, 16777619) }
  return a >>> 0
}
export function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* Vehicle compatibility list for the searchable checker. Pack sizes are
   manufacturer-published figures for the trims common in East Africa. `obd`
   is what a plain reader gets from the diagnostic port; socket measurement
   works on all of them, and any BMS reading is cross-checked regardless. */
export type ObdStatus = 'locked' | 'partial' | 'readable'
export type Compat = { make: string; model: string; seg: string; kwh: string; obd: ObdStatus; common: boolean }
export const COMPAT: Compat[] = [
  { make: 'BYD', model: 'Atto 3', seg: 'Compact SUV', kwh: '49.9 / 60.5 kWh', obd: 'locked', common: true },
  { make: 'BYD', model: 'Dolphin', seg: 'Hatchback', kwh: '44.9 / 60.5 kWh', obd: 'locked', common: true },
  { make: 'BYD', model: 'Seal', seg: 'Saloon', kwh: '61.4 / 82.5 kWh', obd: 'locked', common: false },
  { make: 'BYD', model: 'Song Plus EV', seg: 'Mid-size SUV', kwh: '71.8 / 87 kWh', obd: 'locked', common: true },
  { make: 'BYD', model: 'Yuan Plus', seg: 'Compact SUV', kwh: '49.9 / 60.5 kWh', obd: 'locked', common: true },
  { make: 'BYD', model: 'e2', seg: 'Hatchback', kwh: '43.2 kWh', obd: 'locked', common: true },
  { make: 'Changan', model: 'Deepal S07', seg: 'Mid-size SUV', kwh: '68.8 / 80 kWh', obd: 'locked', common: false },
  { make: 'Changan', model: 'Lumin', seg: 'City car', kwh: '12.9 / 27.9 kWh', obd: 'locked', common: true },
  { make: 'Jetour', model: 'Ice Cream EV', seg: 'City car', kwh: '9.6 / 13.9 kWh', obd: 'locked', common: true },
  { make: 'Geely', model: 'Geometry C', seg: 'Crossover', kwh: '53 / 70 kWh', obd: 'partial', common: false },
  { make: 'Geely', model: 'Geometry E', seg: 'City SUV', kwh: '39.4 kWh', obd: 'partial', common: false },
  { make: 'Nissan', model: 'Leaf', seg: 'Hatchback', kwh: '40 / 62 kWh', obd: 'readable', common: false },
  { make: 'Hyundai', model: 'Kona Electric', seg: 'Compact SUV', kwh: '39.2 / 64 kWh', obd: 'partial', common: false },
  { make: 'Toyota', model: 'bZ4X', seg: 'Mid-size SUV', kwh: '71.4 kWh', obd: 'partial', common: false },
]
