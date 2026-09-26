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
          // postprocessing (+ maath/n8ao) is only reachable through HeroPostFX's own
          // dynamic import — leave it out of the 'three' vendor bucket so Rollup keeps
          // it in that lazy chunk instead of merging it back into a bundle every
          // HeroCanvas visitor (including the default light theme) has to download.
          if (id.includes('@react-three/postprocessing') || id.includes('/postprocessing/') || id.includes('/maath/') || id.includes('/n8ao/')) return
          if (id.includes('/three/') || id.includes('@react-three')) return 'three'
          if (id.includes('motion') || id.includes('framer')) return 'motion'
          if (id.includes('react-router')) return 'router'
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react'
        },
      },
    },
  },
})
