import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Pilot from '@/pages/Pilot'
import Tools from '@/pages/Tools'
import Verify from '@/pages/Verify'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="pilot" element={<Pilot />} />
        <Route path="tools" element={<Tools />} />
        <Route path="verify" element={<Verify />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
