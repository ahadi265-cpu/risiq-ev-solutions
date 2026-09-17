import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { BriefingModal } from '@/components/BriefingModal'
import { cn } from '@/lib/utils'

/** eniris-style persistent booking dock. Slides in once the visitor has read
 *  past the hero, stays out of the way on the Contact page, and opens the
 *  multi-step briefing modal. Transform/opacity only. */
export function FloatingDock() {
  const [show, setShow] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const visible = show && pathname !== '/contact'

  return (
    <div className={cn('fixed right-4 bottom-4 z-40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:right-6 md:bottom-6 print:hidden',
      visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')}>
      <BriefingModal trigger={
        <button type="button" aria-label="Book a pilot briefing"
          className="group flex cursor-pointer items-center gap-3 rounded-full border border-white/15 bg-ink py-2 pr-2 pl-2 text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-12px_rgba(0,0,0,0.6)] md:pr-5">
          <span className="relative grid size-11 place-items-center rounded-full bg-brand transition-colors group-hover:bg-brand-dark">
            <CalendarCheck className="size-5" />
            <span aria-hidden className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-grade-a ring-2 ring-ink">
              <span className="absolute inset-0 animate-ping rounded-full bg-grade-a/70" />
            </span>
          </span>
          <span className="hidden text-left leading-tight md:block">
            <b className="block text-sm">Book a pilot briefing</b>
            <small className="block text-[0.7rem] text-white/60">Mon–Fri · Addis Ababa time</small>
          </span>
        </button>
      } />
    </div>
  )
}
