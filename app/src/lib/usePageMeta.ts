import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'RISIQ EV Solutions'
const META: Record<string, [title: string, description: string]> = {
  '/': ['RISIQ EV Solutions — EV Battery Certification for Ethiopia',
    'Independent, verifiable EV battery-health certificates in fifteen minutes — measured at the charging socket, so they work on locked imports. Built for Ethiopian banks, insurers and importers.'],
  '/pilot': ['The Pilot — Ten BYDs, ninety days, one standard',
    'A 90-day EV battery certification pilot in Addis Ababa, late October 2026. Founding places for banks, micro-finance institutions and insurers.'],
  '/how-it-works': ['How It Works — Socket-side battery measurement',
    'RISIQ measures the real energy flowing into the battery at the charging socket. No OBD unlock, no manufacturer cooperation, and it works offline.'],
  '/tools': ['Battery Tools — Degradation & collateral calculator',
    'Model state of health, usable capacity, range and battery-adjusted residual value for BYD models in Ethiopian climates.'],
  '/verify': ['Verify a Certificate — RISIQ registry',
    'Check a RISIQ battery-health certificate against the public registry by ID or QR code, in under two seconds.'],
  '/partners': ['Partners — One certificate, value for every institution',
    'How insurers, banks, importers and ministries use RISIQ battery certificates, and the no-capex partner model.'],
  '/about': ['About RISIQ — Certifying the batteries behind Ethiopia’s electric future',
    'The team, advisors and story behind RISIQ EV Solutions, part of RISIQ Group, in technology partnership with Eniris.'],
  '/contact': ['Contact — Register for the pilot',
    'Talk to RISIQ EV Solutions in Addis Ababa about certifying your fleet, loan book or insured vehicles.'],
}

/** Per-route <title> and meta description for a client-rendered site. */
export function usePageMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    const key = pathname.startsWith('/v/') ? '/verify' : pathname.replace(/\/$/, '') || '/'
    const [title, description] = META[key] ?? META['/']
    document.title = title.includes(SITE) ? title : `${title} · ${SITE}`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://risiqevsolutions.com${key === '/' ? '/' : key}`)
  }, [pathname])
}
