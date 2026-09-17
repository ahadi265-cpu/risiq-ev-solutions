# RISIQ EV Solutions — web app

Vite + React + TypeScript + Tailwind v4 + shadcn/ui, deployed to GitHub Pages
by GitHub Actions.

| Concern | Choice |
|---|---|
| Build | Vite 8, `tsc -b && vite build` |
| UI | shadcn/ui (new-york) on Radix primitives |
| Styling | Tailwind v4, CSS-first config in `src/index.css` |
| Animation | Motion (Framer Motion) — `motion/react` |
| Charts | Recharts 3 |
| Icons | lucide-react |
| Routing | React Router 7, `BrowserRouter` |

## Local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the built output
```

## ⚠️ Before the first deploy — one manual setting

The workflow uses `actions/deploy-pages`, which requires the repository's
Pages **source** to be *GitHub Actions*, not *Deploy from a branch*:

> Settings → Pages → Build and deployment → Source → **GitHub Actions**

Until that switch is made, the deploy job fails and the existing site keeps
serving. **Flipping it replaces the current static site with this app** — so do
it only when you are ready to cut over.

## Base path

`vite.config.ts` reads `VITE_BASE`, defaulting to `/`.

* **Custom domain** (`risiqevsolutions.com`, current setup) → leave it as `/`.
  `public/CNAME` is copied into `dist/` on every build so the domain survives.
* **Project page** (`<user>.github.io/risiq-ev-solutions/`) → build with
  `VITE_BASE=/risiq-ev-solutions/ npm run build` and set the same env var in
  `.github/workflows/deploy.yml`.

React Router reads the same value via `import.meta.env.BASE_URL`, so both
setups route correctly without further changes.

## Deep links on GitHub Pages

Pages has no server-side rewrites, so `/pilot` would 404 on a hard refresh.
`public/404.html` stores the requested path in `sessionStorage` and bounces to
the app, which restores it before React Router mounts.

## Adding shadcn components

`components.json` is configured, so the CLI works directly:

```bash
npx shadcn@latest add tooltip sheet select
```

## Layout

```
src/
  components/ui/    shadcn primitives (owned source, safe to edit)
  components/       Layout (nav dropdown, footer, dock), Reveal (CSS-driven),
                    ServiceTabs, FloatingDock, hero/certificate widgets
  pages/            Home (eager) + lazy Pilot, Tools, Verify, HowItWorks,
                    Partners, About, Contact
  lib/data.ts       fleet data, the battery model, certificate registry
  lib/usePageMeta   per-route <title>, description and canonical
  lib/utils.ts      cn()
```

The battery model in `lib/data.ts` is the single source of truth for every
number the UI shows: square-root calendar fade with an Arrhenius temperature
term, plus linear cycle fade.
