# Role & Project Scope
You are an expert Principal Frontend Engineer and Lead UI/UX Designer tasked with modernizing the RISIQ EV Solutions website (https://risiqevsolutions.com/). 
Your objective is to transform this static site into a dynamic, interactive, visually striking web app that matches and exceeds the design standards of aviloo.com and eniris.com.

The site is hosted on **GitHub Pages** (static host), but MUST feel like a dynamic, high-performance web application through client-side interactivity, smooth animations, and interactive data visualization.

---

# Tech Stack Specification
- **Framework:** React + Vite + TypeScript (configured for static export)
- **Styling:** Tailwind CSS + Shadcn UI (Radix primitives)
- **Icons:** Lucide React
- **Animations:** Framer Motion (for micro-interactions & layout transitions) + GSAP ScrollTrigger (for scroll-driven reveals)
- **Charts/Visualization:** Recharts (for dynamic graphs and battery degradation visualizers)
- **Routing:** React Router (configured with HashRouter or base-path awareness for GitHub Pages)
- **CI/CD:** GitHub Actions (`actions/deploy-pages`)

---

# Key Interactive Components To Build

### 1. Interactive Battery Degradation & SoH Calculator
- A dynamic client-side widget comparing **Odometer Mileage vs. True Battery State of Health (SoH)**.
- Include interactive sliders for: Mileage (km), Charge Type Frequency (Fast vs. Slow), Climate (Temperature), and Vehicle Age.
- Output real-time calculated financial risk ($), remaining battery life %, and interactive Recharts graphs.

### 2. Live QR & Certificate Verification Demo Widget
- A dynamic verification showcase simulating the RISIQ QR validation engine.
- Allow visitors to type a sample Certificate ID or click "Simulate QR Scan".
- Render a live, cryptographically styled, animated RISIQ Battery Health Certificate displaying SoH %, Grade (A–D), Usable Capacity (kWh), Anomaly Flags, and Verification Seals.

### 3. Rapid Check vs. Reference Test Visualizer
- An interactive, tabbed visual progression showing the 15-minute test workflow.
- Step-by-step interactive timeline with dynamic progress bars and hardware socket measurement visualizers.

### 4. Interactive Competitor Feature Comparison Matrix
- An interactive feature toggle grid comparing RISIQ (Socket Measurement) against traditional OBD/BMS diagnostic readers and Fleet Analytics platforms.
- Tooltips, badge filters, and highlight cards emphasizing RISIQ's advantages on locked imported EVs.

### 5. Multi-Step Pilot Briefing Modal
- An interactive booking modal with dynamic step progress, calendar selection UI, and form validation (connected to client-side Formspree/Web3Forms webhook).

---

# Design System Guidelines
- **Brand palette (decided 2026-09):** RISIQ is a white-and-red brand, like eniris.com. The default theme is a soft paper ground (`oklch(0.968 0.004 255)`, not pure white) with RISIQ red `#ed1c24` / `#d8121b` as the accent, teal `#0d9488` for measured/positive data, amber `#b45309` for warnings and highlights, and grade colours A–D. A full dark theme (`.dark`, ground `oklch(0.178 0.022 258)`) ships behind the header toggle and is persisted in `localStorage['risiq-theme']`. Do **not** repaint the default to a dark neon palette — that direction was tried and rejected as off-brand.
- **Surfaces:** subtle glassmorphic cards (`.glass`, `backdrop-blur`) on both themes; `.bg-grid` texture behind heroes and feature panels.
- **Typography:** modern sans-serif with crisp hierarchy and tabular numbers for every metric.
- **Interactivity standard:** minimal static elements. Hover states scale subtly, statistics count up on scroll, tabs/switchers everywhere an audience or mode can be chosen.
- **Animation rule (hard-won):** anything that holds copy enters via CSS keyframes (`.animate-rise`) with a `key` remount — never `initial={{opacity:0}}` Motion tweens or GSAP `from()` on structural content, which have stranded panels invisible three times. Motion/GSAP are for hover, layout (`layoutId`) and transform-only scroll effects.
- **Tone:** marketing-first, less technical. Domain anchors stay intact: Addis Ababa, locked Chinese imports (BYD, Changan, Jetour), socket-side measurement, Eniris technology partnership. No unverifiable claims; the OBD line on the calculator is labelled illustrative.

# Deliverables Requested
1. Initialize the project directory with `vite`, `tailwind`, `framer-motion`, `recharts`, `lucide-react`, and `shadcn/ui`.
2. Generate all page layouts, hero components, calculators, interactive widgets, and certificate visualizers.
3. Include a `.nojekyll` file in the build output.
4. Generate `.github/workflows/deploy.yml` configured to build TypeScript and automatically deploy static files to GitHub Pages via `actions/deploy-pages`.

# Status (2026-09-14)
All five components above are built in `app/` (plus an audience switcher on Home, a store-and-forward "Network drop" tab in the test visualizer, anomaly flags on certificates, and an OBD-vs-socket decay chart). **Live since 2026-09-14:** GitHub Pages source is GitHub Actions; every push touching `app/**` deploys `app/dist` to risiqevsolutions.com. Printed QR codes (`/v/RISIQ-0001`) and legacy `/<page>.html` links route into the SPA via `public/404.html`. The static HTML at the repo root is no longer served and can be retired.
