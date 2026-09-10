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
- **Color Palette:** High-contrast tech palette. Deep slate/black background (`#0B0F17`), neon cyan/emerald accents (`#00F2FE`, `#10B981`), and subtle glassmorphic card overlays (`backdrop-blur-md`).
- **Typography:** Modern sans-serif (Inter / Plus Jakarta Sans) with crisp hierarchy and legible tabular numbers for metrics.
- **Interactivity Standard:** Minimal static elements. Hover states must scale subtly, cards should possess smooth borders, and statistics must count up dynamically when scrolled into view.

---

# Deliverables Requested
1. Initialize the project directory with `vite`, `tailwind`, `framer-motion`, `recharts`, `lucide-react`, and `shadcn/ui`.
2. Generate all page layouts, hero components, calculators, interactive widgets, and certificate visualizers.
3. Include a `.nojekyll` file in the build output.
4. Generate `.github/workflows/deploy.yml` configured to build TypeScript and automatically deploy static files to GitHub Pages via `actions/deploy-pages`.

Let's begin setup. First, initialize the package structure and configuration files.
