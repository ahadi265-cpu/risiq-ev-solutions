import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { CAR_ASSETS, PHOTO_MODELS, carAssetFor } from '@/lib/cars'
import { COMPAT } from '@/lib/data'

/** Reads a WebP's canvas size and alpha flag from its VP8X header. */
function webpInfo(path: string) {
  const b = readFileSync(path)
  expect(b.toString('ascii', 0, 4)).toBe('RIFF'); expect(b.toString('ascii', 8, 12)).toBe('WEBP')
  expect(b.toString('ascii', 12, 16)).toBe('VP8X') // extended format: required for alpha
  return { alpha: (b[20] & 0x10) !== 0, w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3), kb: b.length / 1024 }
}
const file = (src: string) => join(__dirname, '../../public', src.replace(/^\//, ''))

describe('vehicle photo assets', () => {
  for (const a of Object.values(CAR_ASSETS)) {
    it(`${a.id}: a transparent, high-resolution, right-sized WebP that matches its declared size`, () => {
      expect(existsSync(file(a.src))).toBe(true)
      const i = webpInfo(file(a.src))
      expect(i.alpha).toBe(true)
      expect(i.w).toBeGreaterThanOrEqual(1200)
      expect({ w: i.w, h: i.h }).toEqual({ w: a.w, h: a.h })   // declared size === real size, so layout never shifts
      expect(i.kb).toBeLessThan(180)                            // a cutout is a few tens of KB, not a hero JPEG
    })
    it(`${a.id}: carries a complete credit and meaningful alt text`, () => {
      expect(a.credit.author.length).toBeGreaterThan(1)
      expect(a.credit.license).toMatch(/^(CC0|CC BY(-SA)? \d\.\d)$/)
      expect(a.credit.url).toMatch(/^https:\/\/creativecommons\.org\//)
      expect(a.alt.length).toBeGreaterThan(15)
    })
  }
})

describe('photo ↔ compatibility list', () => {
  it('every photographed model is actually in the compatibility list', () => {
    const listed = new Set(COMPAT.map((c) => `${c.make} ${c.model}`))
    for (const m of PHOTO_MODELS) expect(listed.has(m), m).toBe(true)
  })
  it('resolves the models the owner named — the Deepal E07 gets its own photo, distinct from the S07', () => {
    for (const [make, model] of [['BYD', 'Atto 3'], ['BYD', 'Dolphin'], ['Changan', 'Deepal E07']] as const) expect(carAssetFor(make, model), model).toBeDefined()
    expect(carAssetFor('Changan', 'Deepal E07')!.id).not.toBe(carAssetFor('Changan', 'Deepal S07')!.id)
  })
  it('returns nothing for a model without a photo rather than the wrong car', () => {
    expect(carAssetFor('BYD', 'Seal')).toBeUndefined()
  })
  it('keeps petrol cars off the EV list (Jetour Dashing is an ICE/PHEV model; the electric Jetour is the Ice Cream)', () => {
    expect(COMPAT.some((c) => /dashing/i.test(c.model))).toBe(false)
    expect(COMPAT.some((c) => c.make === 'Jetour' && /ice cream/i.test(c.model))).toBe(true)
  })
})
