import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'

/* Home is eager — it is the first paint. Every other page is its own chunk,
   so the Recharts bundle only loads when Pilot or Tools is actually opened. */
const Pilot = lazy(() => import('@/pages/Pilot'))
const Tools = lazy(() => import('@/pages/Tools'))
const Verify = lazy(() => import('@/pages/Verify'))
const HowItWorks = lazy(() => import('@/pages/HowItWorks'))
const Partners = lazy(() => import('@/pages/Partners'))
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="pilot" element={<Pilot />} />
        <Route path="tools" element={<Tools />} />
        <Route path="verify" element={<Verify />} />
        <Route path="v/:id" element={<Verify />} /> {/* QR codes on printed certificates */}
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="partners" element={<Partners />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
