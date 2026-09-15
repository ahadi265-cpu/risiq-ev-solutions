import { NavLink, Outlet, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useGsapReveal } from '@/lib/useGsapReveal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AmbientOrbs } from '@/components/AmbientOrbs'
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
      <AmbientOrbs />
      <header className="glass sticky top-0 z-40 shadow-sm">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-3 md:py-4">
          <Link to="/" className="flex items-center gap-3.5" aria-label="RISIQ EV Solutions — home">
            <img src="img/risiq-logo.png" alt="RISIQ" width={1600} height={614} className="h-11 w-auto md:h-14" />
            <span className="hidden font-mono text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase md:inline">EV Solutions</span>
          </Link>
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className={({ isActive }) => cn(
                  'relative block rounded-lg px-3.5 py-2.5 text-[0.98rem] font-semibold transition-colors',
                  isActive ? 'text-brand' : 'text-foreground hover:text-brand')}>
                  {({ isActive }) => (<>
                    {n.label}
                    {isActive && <motion.span layoutId="nav-pill" className="absolute inset-x-3.5 -bottom-0.5 h-[3px] rounded-full bg-brand" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                  </>)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="hidden sm:inline-flex rounded-lg bg-brand px-5 hover:bg-brand-dark"><Link to="/pilot">Register for the Pilot</Link></Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </nav>
        <div aria-hidden className="brand-rule h-[5px]" />
        {open && (
          <motion.ul initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-2 rounded-2xl border bg-card p-2 shadow-lg lg:hidden">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-semibold hover:bg-accent">{n.label}</NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="dark relative mt-28 overflow-hidden bg-background py-16 text-foreground">
        <div aria-hidden className="brand-rule absolute inset-x-0 top-0 h-[5px]" />
        <div className="mx-auto grid max-w-[1440px] gap-8 px-6 text-sm text-muted-foreground md:grid-cols-2">
          <div><img src="img/risiq-logo.png" alt="RISIQ" width={1600} height={614} className="mb-5 h-10 w-auto" />
            <p className="max-w-[44ch]">Know what an electric car is really worth, before you buy it, lend against it, or insure it.</p>
            <p className="mt-4 max-w-[44ch] text-xs">
              Built by <b className="text-foreground">RISIQ Tech</b>, a subsidiary of{' '}
              <b className="text-foreground">RISIQ Group</b>, in collaboration with{' '}
              <b className="text-foreground">Eniris</b>.
            </p></div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2.5 text-base font-medium text-foreground/80 md:justify-end" aria-label="Footer">
            {NAV.slice(1).map((n) => (
              <Link key={n.to} to={n.to} className="hover:text-brand hover:underline">{n.label}</Link>
            ))}
          </nav>
          <p className="md:col-span-2 md:text-right">
            Addis Ababa, Ethiopia · <a className="text-brand hover:underline" href="mailto:Khalid@risiqbs.com">Khalid@risiqbs.com</a>
            <br className="hidden md:block" />
            <a className="text-brand hover:underline" href="tel:+251911223871">+251 911 223 871</a>{' '}
            &middot; <a className="text-brand hover:underline" href="tel:+32489976231">+32 489 97 62 31</a>
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
    <section className={cn('py-20 md:py-24', muted && 'bg-muted', className)}>
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
