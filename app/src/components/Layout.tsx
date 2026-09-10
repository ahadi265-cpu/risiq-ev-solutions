import { NavLink, Outlet, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useGsapReveal } from '@/lib/useGsapReveal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/pilot', label: 'The Pilot' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/tools', label: 'Tools' },
  { to: '/verify', label: 'Verify' },
  { to: '/partners', label: 'Partners' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Layout() {
  const [open, setOpen] = useState(false)
  useGsapReveal()
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-3 z-40 mx-3">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 rounded-full border bg-card/95 px-5 py-2.5 shadow-sm backdrop-blur-md">
          <Link to="/" className="flex items-center gap-3" aria-label="RISIQ EV Solutions — home">
            <img src="img/risiq-logo.png" alt="RISIQ" width={1600} height={614} className="h-9 w-auto" />
            <span className="hidden font-mono text-[0.6rem] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:inline">EV Solutions</span>
          </Link>
          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className={({ isActive }) => cn(
                  'relative rounded-full px-3 py-2 text-[0.87rem] transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  {({ isActive }) => (<>
                    {n.label}
                    {isActive && <motion.span layoutId="nav-pill" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                  </>)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex"><Link to="/pilot">Register for the Pilot</Link></Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </nav>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-2 max-w-[1440px] rounded-2xl border bg-card p-2 shadow-lg lg:hidden">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm hover:bg-accent">{n.label}</NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="mt-28 border-t bg-card py-12">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-6 text-sm text-muted-foreground md:grid-cols-2">
          <div><img src="img/risiq-logo.png" alt="RISIQ" width={1600} height={614} className="mb-4 h-8 w-auto" />
            <p className="max-w-[42ch]">Independent, engineering-grade EV battery-health certification for Ethiopia's electric fleet. Part of RISIQ Group.</p></div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end" aria-label="Footer">
            {NAV.slice(1).map((n) => (
              <Link key={n.to} to={n.to} className="hover:text-primary hover:underline">{n.label}</Link>
            ))}
          </nav>
          <p className="md:col-span-2 md:text-right">
            Addis Ababa, Ethiopia · <a className="text-primary hover:underline" href="mailto:Khalid@risiqbs.com">Khalid@risiqbs.com</a>
            <br className="hidden md:block" />
            <a className="text-primary hover:underline" href="tel:+251911223871">+251 911 223 871</a>{' '}
            &middot; <a className="text-primary hover:underline" href="tel:+32489976231">+32 489 97 62 31</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export function Section({ children, className, muted = false }: {
  children: React.ReactNode; className?: string; muted?: boolean
}) {
  return (
    <section className={cn('py-20 md:py-24', muted && 'bg-muted/40', className)}>
      <div className="mx-auto max-w-[1440px] px-6">{children}</div>
    </section>
  )
}

export function SectionHead({ eyebrow, title, children }: {
  eyebrow: string; title: string; children?: React.ReactNode
}) {
  return (
    <div className="mb-12 max-w-[46rem]">
      <span className="flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] text-amber uppercase">
        <span className="size-1.5 rounded-full bg-amber ring-3 ring-amber/20" />{eyebrow}
      </span>
      <h2 data-settle className="mt-4 text-3xl font-semibold md:text-[2.6rem] md:leading-[1.1]">{title}</h2>
      {children && <p className="mt-4 text-lg text-muted-foreground text-pretty">{children}</p>}
    </div>
  )
}
