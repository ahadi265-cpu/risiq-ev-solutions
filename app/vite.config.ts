import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * BASE PATH — this repo publishes to the custom domain risiqevsolutions.com,
 * so assets are served from the domain root and `base` must stay '/'.
 * Without a custom domain (i.e. ahadi265-cpu.github.io/risiq-ev-solutions/),
 * build with:  VITE_BASE=/risiq-ev-solutions/ npm run build
 */
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2022',
    rollupOptions: {
      output: {
        // Vendor groups for long-lived caching. Recharts is deliberately NOT
        // grouped here: routes are lazy, so it lands in a chunk shared only by
        // Pilot and Tools. Grouping it pulled shared helpers into that chunk
        // and made the first paint preload 444 kB of charts.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (id.includes('motion') || id.includes('framer')) return 'motion'
          if (id.includes('react-router')) return 'router'
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react'
        },
      },
    },
  },
})
