import { Suspense, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Menu, X, ChevronDown, Plug, Gauge, QrCode, Mail, Phone, MapPin, ArrowRight, Search, ExternalLink,
} from 'lucide-react'
import { useGsapReveal } from '@/lib/useGsapReveal'
import { usePageMeta } from '@/lib/usePageMeta'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AmbientOrbs } from '@/components/AmbientOrbs'
import { FloatingDock } from '@/components/FloatingDock'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* Root-relative so the header still finds it on /v/RISIQ-0001. */
const LOGO = `${import.meta.env.BASE_URL}img/risiq-logo.png`

type Item = { to: string; label: string; end?: boolean; icon?: typeof Plug; desc?: string }
type Group = { label: string; items: Item[] }
type Entry = Item | Group
const isGroup = (e: Entry): e is Group => 'items' in e

const SOLUTION: Item[] = [
  { to: '/how-it-works', label: 'How It Works', icon: Plug, desc: 'Socket-side measurement, four steps, works offline' },
  { to: '/tools', label: 'Battery Tools', icon: Gauge, desc: 'Degradation model and collateral calculator' },
  { to: '/verify', label: 'Verify a Certificate', icon: QrCode, desc: 'Check any RISIQ record in under two seconds' },
]
const COMPANY: Item[] = [
  { to: '/pilot', label: 'The Pilot' },
  { to: '/partners', label: 'Partners' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]
const NAV: Entry[] = [
  { to: '/', label: 'Home', end: true },
  { label: 'Solution', items: SOLUTION },
  ...COMPANY,
]

const linkCls = 'relative block rounded-lg px-3.5 py-2.5 text-[0.98rem] font-semibold transition-colors cursor-pointer'
const Underline = () => (
  <motion.span layoutId="nav-pill" aria-hidden className="absolute inset-x-3.5 -bottom-0.5 h-[3px] rounded-full bg-brand"
    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
)

/** eniris-style dropdown: opens on hover or focus, closes on leave, blur,
 *  Escape or navigation. The panel enters on CSS keyframes. */
function NavDropdown({ group }: { group: Group }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const timer = useRef(0)
  const active = group.items.some((i) => pathname.startsWith(i.to))
  const show = () => { window.clearTimeout(timer.current); setOpen(true) }
  const hide = () => { timer.current = window.setTimeout(() => setOpen(false), 140) }
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <li className="relative" onMouseEnter={show} onMouseLeave={hide}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false) }}
      onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}>
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={show} onFocus={show}
        className={cn(linkCls, 'flex items-center gap-1', active || open ? 'text-brand' : 'text-foreground hover:text-brand')}>
        {group.label}
        <ChevronDown className={cn('size-4 transition-transform duration-300', open && 'rotate-180')} />
        {active && <Underline />}
      </button>
      {open && (
        <div className="animate-drop absolute top-full left-1/2 z-50 mt-3 w-[min(92vw,700px)] -translate-x-1/2 rounded-2xl border bg-card p-2 shadow-2xl">
          <div className="grid gap-1 sm:grid-cols-3">
            {group.items.map((i) => {
              const Icon = i.icon!
              return (
                <NavLink key={i.to} to={i.to}
                  className={({ isActive }) => cn('group flex gap-3 rounded-xl p-3.5 outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50', isActive && 'bg-accent')}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <b className="block text-sm">{i.label}</b>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{i.desc}</span>
                  </span>
                </NavLink>
              )
            })}
          </div>
          <Link to="/pilot" className="mt-1 flex items-center justify-between rounded-xl bg-muted px-4 py-3 text-sm font-medium transition-colors hover:bg-brand hover:text-white">
            <span>Not sure where to start? See the October pilot.</span><ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </li>
  )
}

const mobLink = 'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold hover:bg-accent [&.active]:text-brand'
const Label = ({ children }: { children: string }) => (
  <span className="mt-1 block px-4 pt-3 pb-1 font-mono text-[0.66rem] tracking-[0.16em] text-muted-foreground uppercase">{children}</span>
)
function MobileMenu({ onPick }: { onPick: () => void }) {
  return (
    <div className="animate-drop mx-4 mt-2 mb-4 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border bg-card p-3 shadow-xl lg:hidden">
      <NavLink to="/" end onClick={onPick} className={mobLink}>Home</NavLink>
      <Label>Solution</Label>
      {SOLUTION.map((i) => { const Icon = i.icon!; return (
        <NavLink key={i.to} to={i.to} onClick={onPick} className={mobLink}><Icon className="size-4 text-brand" />{i.label}</NavLink>
      ) })}
      <Label>Company</Label>
      {COMPANY.map((i) => <NavLink key={i.to} to={i.to} onClick={onPick} className={mobLink}>{i.label}</NavLink>)}
      <Button asChild className="mt-3 w-full rounded-lg bg-brand hover:bg-brand-dark">
        <Link to="/pilot" onClick={onPick}>Register for the Pilot</Link>
      </Button>
    </div>
  )
}

function PageFallback() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-24" aria-busy="true" aria-label="Loading">
      <div className="h-6 w-44 animate-pulse rounded-full bg-muted" />
      <div className="mt-6 h-14 w-3/4 animate-pulse rounded-xl bg-muted" />
      <div className="mt-4 h-6 w-1/2 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}

function FooterCol({ title, items }: { title: string; items: Item[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">{title}</h3>
      <ul className="mt-4 grid gap-2.5 text-[0.95rem]">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="group inline-flex items-center gap-1.5 text-foreground/85 transition-colors hover:text-brand">
              {i.label}<ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function VerifyBox() {
  const nav = useNavigate()
  const [id, setId] = useState('')
  return (
    <form className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4"
      onSubmit={(e) => { e.preventDefault(); const v = id.trim().toUpperCase(); if (v) nav(`/v/${encodeURIComponent(v)}`) }}>
      <label htmlFor="footer-verify" className="flex items-center gap-2 text-sm font-semibold">
        <QrCode className="size-4 text-brand" />Verify a certificate
      </label>
      <div className="mt-3 flex gap-2">
        <input id="footer-verify" value={id} onChange={(e) => setId(e.target.value)} placeholder="RISIQ-0001"
          autoComplete="off" spellCheck={false}
          className="h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-background/60 px-3 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-brand" />
        <Button type="submit" size="sm" className="h-10 rounded-lg bg-brand px-4 hover:bg-brand-dark"><Search />Check</Button>
      </div>
    </form>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const progress = useRef<HTMLDivElement>(null)
  const { pathname, hash } = useLocation()
  useGsapReveal()
  usePageMeta()

  /* New page, top of page — React Router leaves scroll where it was. */
  useEffect(() => {
    setOpen(false)
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      // reading progress, painted into the brand rule (transform-only)
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-dvh flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:font-semibold focus:text-white">Skip to content</a>
      <AmbientOrbs />
      {/* glass at the top of the page; near-solid once content scrolls beneath it, so the red hero never bleeds through */}
      <header className={cn('sticky top-0 z-40 transition-[box-shadow,background-color] duration-300 print:static', scrolled ? 'glass-solid shadow-md' : 'glass shadow-sm')}>
        <nav aria-label="Primary" className={cn('mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 transition-[padding] duration-300', scrolled ? 'py-2' : 'py-3 md:py-4')}>
          <Link to="/" className="flex items-center gap-3.5" aria-label="RISIQ EV Solutions — home">
            <img src={LOGO} alt="RISIQ" width={1600} height={614}
              className={cn('w-auto transition-[height] duration-300', scrolled ? 'h-9 md:h-11' : 'h-11 md:h-14')} />
            <span className="hidden font-mono text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase md:inline">EV Solutions</span>
          </Link>
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((e) => isGroup(e) ? <NavDropdown key={e.label} group={e} /> : (
              <li key={e.to}>
                <NavLink to={e.to} end={e.end} className={({ isActive }) => cn(linkCls, isActive ? 'text-brand' : 'text-foreground hover:text-brand')}>
                  {({ isActive }) => (<>{e.label}{isActive && <Underline />}</>)}
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
        <div aria-hidden className="brand-rule relative h-[5px] overflow-hidden">
          <div ref={progress} className="absolute inset-y-0 left-0 w-full origin-left bg-white/40 will-change-transform" style={{ transform: 'scaleX(0)' }} />
        </div>
        {open && <MobileMenu onPick={() => setOpen(false)} />}
      </header>

      <main id="main" className="flex-1">
        {/* keyed remount + CSS entrance: a soft page transition between routes */}
        <div key={pathname} className="animate-rise">
          <Suspense fallback={<PageFallback />}><Outlet /></Suspense>
        </div>
      </main>

      <footer className="dark relative mt-28 overflow-hidden bg-background text-foreground">
        <div aria-hidden className="brand-rule absolute inset-x-0 top-0 h-[5px]" />
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 pt-16 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr]">
          <div>
            <img src={LOGO} alt="RISIQ" width={1600} height={614} className="h-10 w-auto" />
            <p className="mt-5 max-w-[40ch] text-[0.95rem] text-muted-foreground">
              Know what an electric car is really worth, before you buy it, lend against it, or insure it.
            </p>
            <p className="mt-4 max-w-[44ch] text-xs text-muted-foreground">
              Built by <b className="text-foreground">RISIQ Tech</b>, a subsidiary of{' '}
              <b className="text-foreground">RISIQ Group</b>, in technology partnership with{' '}
              <b className="text-foreground">Eniris</b>.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {['Independent', 'Tamper-evident', 'Works on locked imports'].map((t) => (
                <li key={t} className="rounded-full border border-white/12 px-3 py-1 font-mono text-[0.68rem] tracking-wide text-muted-foreground">{t}</li>
              ))}
            </ul>
          </div>
          <FooterCol title="Solution" items={SOLUTION} />
          <FooterCol title="Company" items={COMPANY} />
          <div>
            <h3 className="font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">Contact</h3>
            <ul className="mt-4 grid gap-3 text-[0.95rem]">
              <li><a href="mailto:Khalid@risiqbs.com" className="flex items-center gap-3 transition-colors hover:text-brand"><Mail className="size-4 shrink-0 text-brand" />Khalid@risiqbs.com</a></li>
              <li><a href="tel:+251911223871" className="flex items-center gap-3 transition-colors hover:text-brand"><Phone className="size-4 shrink-0 text-brand" />+251 911 223 871</a></li>
              <li><a href="tel:+32489976231" className="flex items-center gap-3 transition-colors hover:text-brand"><Phone className="size-4 shrink-0 text-brand" />+32 489 97 62 31 <span className="text-muted-foreground">· Belgium</span></a></li>
              <li className="flex items-center gap-3"><MapPin className="size-4 shrink-0 text-brand" />Addis Ababa, Ethiopia</li>
            </ul>
            <VerifyBox />
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} RISIQ EV Solutions. All rights reserved.</span>
            <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span>Part of RISIQ Group</span>
              <a href="https://eniris.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-brand">
                Technology partner: Eniris<ExternalLink className="size-3" />
              </a>
            </span>
          </div>
        </div>
      </footer>

      <FloatingDock />
    </div>
  )
}

export function Section({ children, className, muted = false, id }: {
  children: React.ReactNode; className?: string; muted?: boolean; id?: string
}) {
  return (
    <section id={id} className={cn('py-20 md:py-24 scroll-mt-24', muted && 'bg-muted', className)}>
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
