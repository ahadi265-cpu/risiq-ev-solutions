import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

/* Vite injects the configured base; React Router needs it as the basename so
   both a custom domain ('/') and a project page ('/repo/') resolve. */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename || '/'}>
      <App />
    </BrowserRouter>
  </StrictMode>
)
