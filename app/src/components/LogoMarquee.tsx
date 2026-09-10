import { useReducedMotion } from 'motion/react'

const LOGOS = [
  { src: 'awash-bank.svg', alt: 'Awash Bank', h: 34 },
  { src: 'dashen-bank.png', alt: 'Dashen Bank', h: 52 },
  { src: 'agar-microfinance.png', alt: 'Agar Microfinance S.C.', h: 52 },
  { src: 'awash-insurance.png', alt: 'Awash Insurance', h: 40 },
  { src: 'nyala-insurance.png', alt: 'Nyala Insurance S.C.', h: 30 },
]

/** Continuous logo rail. The track holds two identical sets and translates by
 *  exactly -50%, so the loop is seamless. */
export function LogoMarquee() {
  const reduce = useReducedMotion()
  const set = (hidden: boolean) =>
    LOGOS.map((l) => (
      <li key={(hidden ? 'b-' : 'a-') + l.src} aria-hidden={hidden || undefined}
        className="flex shrink-0 items-center opacity-80 transition-all duration-300 hover:opacity-100 hover:-translate-y-0.5">
        <img src={`img/logos/${l.src}`} alt={hidden ? '' : l.alt} style={{ height: l.h }} className="w-auto" loading="lazy" />
      </li>
    ))

  return (
    <div className="relative overflow-hidden border-y bg-card py-7
      [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <ul className={`flex w-max items-center gap-16 ${reduce ? '' : 'animate-[marq_34s_linear_infinite] hover:[animation-play-state:paused]'}`}>
        {set(false)}{set(true)}
      </ul>
    </div>
  )
}
