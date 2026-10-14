import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Layered glass for cards on the stage (owner brief 2026-10-14): frosted, translucent slate, a hairline
 *  border and a faint cyan-tinted depth shadow. The blur only means something over a patterned ground, so
 *  it lives here, on the stage, rather than on every card in the app. */
export const GLASS = 'backdrop-blur-xl bg-slate-900/50 border border-slate-800/80 shadow-2xl shadow-cyan-500/5'

/** Add to glass cards that hold controls or hover behaviour: a soft cyan bloom on hover, depth shadow kept. */
export const GLASS_HOVER = 'transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(0,242,254,0.15),0_25px_50px_-12px_rgba(6,182,212,0.05)]'

/** Soft outer cyan halo for primary actions on the stage; stronger on hover (see .glow-cyan). */
export const PRIMARY_GLOW = 'glow-cyan'

/**
 * An obsidian "stage" that works inside the red-and-white site. The `dark` class
 * re-scopes every design token (colours, shadcn controls, Recharts' CSS-variable
 * colours) to the obsidian palette for everything inside it, whatever theme the
 * rest of the page is in — so the glass cards have a dark, glowing ground to
 * blur and the site's light theme stays untouched.
 */
export function Stage({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('dark relative isolate overflow-hidden rounded-3xl border border-slate-800/60 bg-[#0B0F17] text-foreground shadow-[0_30px_80px_-34px_rgba(0,0,0,0.6)]', className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_88%_-4%,rgba(0,242,254,0.16),transparent_70%),radial-gradient(48%_46%_at_-4%_104%,rgba(226,35,26,0.20),transparent_70%),radial-gradient(40%_40%_at_50%_50%,rgba(16,185,129,0.06),transparent_75%)]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(85%_85%_at_50%_45%,#000_30%,transparent_100%)]" />
      {children}
    </div>
  )
}
