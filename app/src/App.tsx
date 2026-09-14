import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Pilot from '@/pages/Pilot'
import Tools from '@/pages/Tools'
import Verify from '@/pages/Verify'
import HowItWorks from '@/pages/HowItWorks'
import Partners from '@/pages/Partners'
import About from '@/pages/About'
import Contact from '@/pages/Contact'

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
