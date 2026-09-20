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
- **Brand palette (decided 2026-09):** RISIQ is a white-and-red brand, like eniris.com. The default theme follows risiqbs.com: warm white ground `#fefcfa`, neutral greys `#f5f5f5` / `#d4d4d4`, brand red `#e2231a` with `#b81a13` on hover, red glow orbs (no teal/cyan in the atmosphere), teal `#0d9488` for measured/positive data, amber `#b45309` for warnings and highlights, and grade colours A–D. A full dark theme (`.dark`, ground `oklch(0.178 0.022 258)`) ships behind the header toggle and is persisted in `localStorage['risiq-theme']`. Do **not** repaint the default to a dark neon palette — that direction was tried and rejected as off-brand.
- **Hero (owner-approved 2026-09-17):** the Home hero is a full-bleed brand-red band with white type — RISIQ Group is a red-and-white brand, so keep it red. Do not revert to the white hero.
- **Chrome (eniris.com scale):** full-width sticky header, logo `h-14`, bold `~1rem` nav, red "Register" button, 5px brand-red rule under the header; hero headline `~5.8rem` with a live certificate card; dark slate footer with the same red rule.
- **Surfaces:** subtle glassmorphic cards (`.glass`, `backdrop-blur`) on both themes; `.bg-grid` texture behind heroes and feature panels.
- **Typography:** modern sans-serif with crisp hierarchy and tabular numbers for every metric.
- **Interactivity standard:** minimal static elements. Hover states scale subtly, statistics count up on scroll, tabs/switchers everywhere an audience or mode can be chosen.
- **Animation rule (hard-won):** anything that holds copy enters via CSS keyframes (`.animate-rise`) with a `key` remount — never `initial={{opacity:0}}` Motion tweens or GSAP `from()` on structural content, which have stranded panels invisible three times. Motion/GSAP are for hover, layout (`layoutId`) and transform-only scroll effects.
- **Method messaging (owner instruction 2026-09-17):** RISIQ reads the car's BMS data where the vehicle allows it and calibrates it against its own socket-side measurement. Say, everywhere it fits, that RISIQ has **its own calibrated database** and that **every BMS reading collected is cross-checked against that database and calibrated** before it reaches the certificate. Do not dismiss BMS data as useless (the old "the car says no" framing is retired), and do not expose the technical depth — the site is marketing; "coulomb counting" and the model internals stay off the page.
- **BYD first (owner instruction 2026-09-17):** BYD and other Chinese brands dominate Ethiopia's fleet, so every sample certificate, simulator label and illustration is a BYD (Atto 3, Dolphin, Yuan Plus, Song Plus, e2). Changan and Jetour stay as "also certified". The Atto 3 cutout in `public/img/byd-atto3.webp` is derived from a CC BY 4.0 Wikimedia Commons photo by Hubert Berberich (HubiB) — keep the figcaption attribution.
- **Competitor-informed structure (Aviloo, Moba, TWAICE reviewed 2026-09-17):** plain-language value proposition up top with proof chips; a "fleet benchmark" scale (below / average / above comparable cars in the RISIQ calibrated database) on every certificate view; a plain-language A–D grade legend; a listing-badge preview showing the certificate inside a used-car ad; a "Buyers & sellers" audience alongside institutions. No fabricated proof numbers (test counts, customer logos) — RISIQ is pre-pilot.
- **Tone:** marketing-first, less technical. Domain anchors stay intact: Addis Ababa, locked Chinese imports (BYD, Changan, Jetour), socket-side measurement, Eniris technology partnership. No unverifiable claims; the OBD line on the calculator is labelled illustrative.

# Deliverables Requested
1. Initialize the project directory with `vite`, `tailwind`, `framer-motion`, `recharts`, `lucide-react`, and `shadcn/ui`.
2. Generate all page layouts, hero components, calculators, interactive widgets, and certificate visualizers.
3. Include a `.nojekyll` file in the build output.
4. Generate `.github/workflows/deploy.yml` configured to build TypeScript and automatically deploy static files to GitHub Pages via `actions/deploy-pages`.

# Status (2026-09-14)
All five components above are built in `app/` (plus an audience switcher on Home, a store-and-forward "Network drop" tab in the test visualizer, anomaly flags on certificates, an OBD-vs-socket decay chart, a live HTML hero certificate with 3D tilt and counting gauge, a full-screen Certificate Inspector modal, a Socket Measurement Simulator with animated current flow and an OBD-blocked mode, ambient cursor-following glow orbs, running-gradient metric cards, and an animated theme switch). **Live since 2026-09-14:** GitHub Pages source is GitHub Actions; every push touching `app/**` deploys `app/dist` to risiqevsolutions.com. Printed QR codes (`/v/RISIQ-0001`) and legacy `/<page>.html` links route into the SPA via `public/404.html`. The static HTML at the repo root was removed on 2026-09-20 (Pages serves `app/dist` from the workflow; the root is never deployed). `api/`, `lib/`, `vercel.json` remain as the parked Vercel form-relay experiment.

# Status (2026-09-17) — eniris-parity pass
- **Reveals are CSS now.** `components/Reveal.tsx` starts a CSS keyframe via an IntersectionObserver `data-in` attribute (with a synchronous in-viewport check on mount); `CountUp` has the same check plus a settle timer. No Motion opacity tweens remain on structural content — the blank-section failure (seen on Tools/About/Partners in tall viewports) is closed. `revealItem` is kept as an empty `Variants` for call-site compatibility.
- **Chrome (eniris-style):** grouped nav — Home · Solution ▾ (How It Works, Battery Tools, Verify) · The Pilot · Partners · About · Contact — with a hover/focus dropdown, a header that shrinks on scroll, a grouped mobile menu, a four-column dark footer with a "Verify a certificate" box, and a floating "Book a pilot briefing" dock (hidden on /contact) that opens `BriefingModal`.
- **Home:** full-bleed brand-red hero band (white headline with a self-drawing underline, live certificate card, four-seat audience rail that preselects `AudienceSwitcher` via a `risiq:audience` window event and scrolls to `#audience`), logo marquee directly under the hero, metric count-ups, an eniris-style **ServiceTabs** switcher (Rapid Check / Reference Test / Certificate & Registry / Fleet Programme, all copy grounded in existing pages), and a stats-tiles + Addis photo block.
- **Performance/SEO:** routes are `React.lazy` (Home eager) so Recharts is only fetched on Pilot/Tools; first-paint preloads are runtime + React + Motion + router. Scroll resets to top on navigation. `lib/usePageMeta.ts` sets per-route title/description/canonical. `index.html` carries Open Graph/Twitter tags (`public/img/og.jpg`, 1200×630), theme-color and Organization JSON-LD. `public/robots.txt` and `public/sitemap.xml` now ship in the build (the repo-root copies pointed at retired `.html` URLs).
- **Verification method when the Claude Chrome extension is unavailable:** headless Chrome CLI screenshots (`--virtual-time-budget`) for static captures, and a dependency-free CDP script (Node ≥22 `WebSocket`) to drive hover/scroll/click states — see the session scratchpad `cdp.mjs` pattern. Note that virtual-time captures starve rAF, so count-ups/recharts animations show 0 in them; the CDP run confirms real values.
- **Polish pass (same day):** scroll-progress fill inside the header brand rule, skip-to-content link, keyed `.animate-rise` route transition around the Outlet, smooth anchor scrolling (reduced-motion aware), visible focus rings on hero rail / dropdown / tab controls, 44 px icon buttons, drifting white orbs in the hero. New `CalibrationFlow` section on Home ("Two sources. One calibrated number.") and a third "Cross-checked against our database" card on How It Works carry the BMS-plus-calibration message.

# Status (2026-09-18) — gap pass against the "hyper-interactive" brief
Owner chose to **keep the red-and-white brand** (the brief's obsidian/cyan/emerald theme was declined; the no-dark-neon rule stands). Built the gaps instead:
- Hero: three floating stat chips (15 min, ±3 %, < 2 s) around the certificate, desktop only; hero demo button now reads "Live verification demo".
- `BydFocus` is now an **EV selector**: BYD Atto 3, BYD Dolphin, Changan Deepal S07, Jetour Ice Cream EV — image swaps with a CSS entrance, rated pack/range per model, and an OBD-port vs RISIQ-socket status toggle. Photos in `public/img/cars/` are Wikimedia Commons cutouts: Atto 3 (Hubert Berberich, CC BY 4.0), Dolphin (MoCars, CC0), Deepal S07 (Sulthan Naufal, CC BY 4.0), Ice Cream (Quzhouliulian, CC BY-SA 4.0 — share-alike applies to the cutout). Keep the figcaption credits.
- `BriefingModal` is glassmorphic (`.glass` on DialogContent).
- Tools: odometer 0–150,000 km, continuous daily-temperature slider with the climate presets as quick-picks, and an indicative dollar readout next to the birr figures (`ETB_PER_USD = 162` in `lib/data.ts`, labelled indicative — update when the rate moves).

# Status (2026-09-18, second brief) — dark mode is obsidian; light stays red-and-white
The owner's second brief repeated the obsidian/cyan/emerald styling after choosing red-and-white earlier the same day. Reconciled as: **light default unchanged; the `.dark` theme is now the obsidian palette** (`#0B0F17` ground, `--teal` = electric cyan `#00F2FE` for measured data, `--grade-a` = emerald `#10B981`, cyan-tinted glass borders, cyan/emerald ambient orbs). To make obsidian the default, change the fallback in `index.html`'s theme bootstrap (`if(!t)t='light'`) and `ThemeToggle.initial()` to `'dark'` — nothing else.
Gaps built: hero **audience impact switcher** (the rail rewrites eyebrow + paragraph via `HERO_COPY`, CSS entrance, and preselects the switcher); **`BlindSpotExplorer`** replaces the static two-car cards (odometer 0–100k slider, gentle-AC vs fast-DC-taxi toggle, lazy Recharts line chart — the chart chunk mounts only when the panel nears the viewport); the "What we issue" PNG is replaced by the live tilting `HeroCertificate` with four numbered hotspots and a legend; the playable `TestVisualizer` (with its network-drop tab) is lazy-mounted on Home under How It Works; `CompareMatrix` gained "Only RISIQ" badges and title tooltips. `OdometerProof.tsx` is now unused.
- **Header (2026-09-18 fix):** `.glass` only at scroll 0; once scrolled the header switches to `.glass-solid` (96 % background, 18 px blur). The 72 % glass let the red hero's copy show through the sticky header — keep the solid variant when scrolled.

# Status (2026-09-18, third brief) — Blind Spot simulator, wizard fleet size
- `BlindSpotExplorer` is now a Car A vs Car B simulator: Car A is fixed gentle commuting; Car B has an odometer (0–150,000 km, shared), fast-charging %, daily temperature and vehicle-age sliders, with two presets ("Gentle, like Car A" / "Taxi in heat"). Outputs per car: SoH, grade, usable kWh; plus the financial risk the odometer hides in birr and ≈ $. Chart x-axis to 150k, y floor 70 %.
- `BriefingModal` step 1 has an optional "Vehicles you would certify" number field, carried into the request message.
- Locked-car panel wording: "Access denied · BMS encrypted" vs "100 % direct electrical energy signal captured".
- **Declined (stated to owner):** React Hook Form + Zod. The two forms are small, already typed and validated with plain state; the libraries would add weight for no user-visible change. Add them only if the forms grow.
- **Test-script gotcha:** `html { scroll-behavior: smooth }` means `scrollIntoView` animates in headless Chrome; a second scroll call right after cancels it. Use `window.scrollTo({ top, behavior: 'instant' })` in verification scripts.
- **Bug fixed 2026-09-18:** `dark:` utilities followed the OS media query (no `@custom-variant dark` was declared), so visitors with a dark OS setting saw light-mode pages with dark-only colours (white-on-white booking dock). `@custom-variant dark (&:is(.dark *));` now binds them to the header toggle's `.dark` class. Verify theme work under `Emulation.setEmulatedMedia prefers-color-scheme: dark` as well as the toggle.

# Status (2026-09-20) — compatibility search, persona CTA/stat
- New `CompatibilitySearch` (Home, under the EV selector): real-time filter over `COMPAT` in `lib/data.ts` (BYD Atto 3/Dolphin/Seal/Song Plus/Yuan Plus/e2, Changan Deepal S07/Lumin, Jetour Ice Cream EV, Geely Geometry C/E, Nissan Leaf, Hyundai Kona, Toyota bZ4X). Three badges per car: socket measurement 100 % supported; OBD BMS status (locked / partial / readable — Leaf is readable and says "still cross-checked"); test time. Unknown query → "if it charges, we can test it". Pack sizes are manufacturer-rated; keep `obd` honest per model.
- Hero persona switcher now also morphs a per-audience stat chip and the primary CTA label (`HERO_COPY.stat` / `.cta`).
- Blind Spot cards show true range (km) alongside usable kWh.
- The brief's "Jetour Dashing" is a petrol car; the electric Jetour on Ethiopian roads is the Ice Cream EV, which is what the list carries.

