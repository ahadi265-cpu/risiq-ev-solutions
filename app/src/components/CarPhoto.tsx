import { CarFront } from 'lucide-react'
import type { CarAsset } from '@/lib/cars'
import { cn } from '@/lib/utils'

/** The vehicle cutout, standing on a soft ground shadow, with its licence credit.
 *  Falls back to an honest placeholder for models we have no licensed photo of —
 *  never a different car. Width/height attributes reserve the intrinsic ratio; the image itself is absolutely positioned with object-contain so an auto grid row can never grow to the photo's pixel height. */
export function CarPhoto({ asset, make, model, className }: { asset?: CarAsset; make: string; model: string; className?: string }) {
  return (
    <figure>
      <div data-car={asset ? asset.id : 'none'}
        className={cn('relative grid place-items-center overflow-hidden rounded-xl border border-slate-800/80 bg-[radial-gradient(65%_80%_at_50%_100%,rgba(0,242,254,0.10),transparent_72%),radial-gradient(40%_50%_at_20%_0%,rgba(226,35,26,0.10),transparent_70%)]', className ?? 'h-40 sm:h-48')}>
        {asset ? (
          <>
            <div aria-hidden className="absolute inset-x-[14%] bottom-3 h-3 rounded-[50%] bg-black/70 blur-md" />
            <img src={asset.src} width={asset.w} height={asset.h} alt={asset.alt} loading="lazy" decoding="async"
              className="absolute inset-0 size-full object-contain px-[5%] pt-3 pb-5 drop-shadow-[0_18px_22px_rgba(0,0,0,0.5)]" />
          </>
        ) : (
          <div className="grid justify-items-center gap-2 p-3 text-center text-muted-foreground">
            <CarFront className="size-9 opacity-60" strokeWidth={1.4} />
            <span className="font-mono text-[0.66rem] tracking-[0.14em] uppercase">{make} {model}</span>
            <span className="text-xs">No licensed photo yet — the test works the same.</span>
          </div>
        )}
      </div>
      {asset && (
        <figcaption className="mt-2 text-[0.68rem] leading-snug text-muted-foreground">
          Photo: {asset.credit.author},{' '}
          <a className="underline underline-offset-2 hover:text-teal" href={asset.credit.url} target="_blank" rel="noopener noreferrer">{asset.credit.license}</a>
          , via Wikimedia Commons; background removed.
        </figcaption>
      )}
    </figure>
  )
}
