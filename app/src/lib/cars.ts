/** The one place vehicle photos and their credits live. Photos are CC-licensed
 *  Wikimedia Commons images with the background removed; the figcaption must
 *  carry the credit (and CC BY-SA cutouts stay share-alike). Sizes are the files'
 *  intrinsic pixels, so images reserve their space and never shift layout. */
export type CarCredit = { author: string; license: string; url: string; source: string }
export type CarAsset = { id: string; src: string; w: number; h: number; alt: string; credit: CarCredit }

const BASE = import.meta.env.BASE_URL
const CC = {
  by4: 'https://creativecommons.org/licenses/by/4.0',
  bysa2: 'https://creativecommons.org/licenses/by-sa/2.0',
  bysa4: 'https://creativecommons.org/licenses/by-sa/4.0',
  cc0: 'https://creativecommons.org/publicdomain/zero/1.0',
}

export const CAR_ASSETS: Record<string, CarAsset> = {
  atto3: { id: 'atto3', src: `${BASE}img/cars/atto3.webp`, w: 1200, h: 460, alt: 'BYD Atto 3, side view',
    credit: { author: 'Hubert Berberich (HubiB)', license: 'CC BY 4.0', url: CC.by4, source: 'https://commons.wikimedia.org/' } },
  dolphin: { id: 'dolphin', src: `${BASE}img/cars/dolphin.webp`, w: 1400, h: 711, alt: 'BYD Dolphin, front three-quarter view',
    credit: { author: 'RL GNZLZ', license: 'CC BY-SA 2.0', url: CC.bysa2, source: 'https://commons.wikimedia.org/wiki/File:BYD_Dolphin_2024.jpg' } },
  deepalS07: { id: 'deepalS07', src: `${BASE}img/cars/deepal.webp`, w: 1200, h: 777, alt: 'Changan Deepal S07, front three-quarter view',
    credit: { author: 'Sulthan Naufal', license: 'CC BY 4.0', url: CC.by4, source: 'https://commons.wikimedia.org/' } },
  deepalE07: { id: 'deepalE07', src: `${BASE}img/cars/deepal-e07.webp`, w: 1400, h: 554, alt: 'Changan Deepal E07 (sold in China as the Nevo E07), front three-quarter view',
    credit: { author: 'KitsuneDP', license: 'CC0', url: CC.cc0, source: 'https://commons.wikimedia.org/wiki/File:Nevo_E07_006.jpg' } },
  iceCream: { id: 'iceCream', src: `${BASE}img/cars/jetour.webp`, w: 1200, h: 759, alt: 'Jetour Ice Cream EV, front three-quarter view',
    credit: { author: 'Quzhouliulian', license: 'CC BY-SA 4.0', url: CC.bysa4, source: 'https://commons.wikimedia.org/' } },
}

/** Compatibility-list entries ("Make Model") that have a photo. Anything absent has none yet. */
const BY_MODEL: Record<string, string> = {
  'BYD Atto 3': 'atto3',
  'BYD Dolphin': 'dolphin',
  'Changan Deepal S07': 'deepalS07',
  'Changan Deepal E07': 'deepalE07',
  'Jetour Ice Cream EV': 'iceCream',
}

export const carAssetFor = (make: string, model: string): CarAsset | undefined => {
  const id = BY_MODEL[`${make} ${model}`]
  return id ? CAR_ASSETS[id] : undefined
}
export const PHOTO_MODELS = Object.keys(BY_MODEL)
