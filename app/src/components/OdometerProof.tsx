import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CARS = [
  { id: 'a', tag: 'Car A · gentle life', km: '50,000 km', soh: 96, grade: 'A',
    life: 'Home-charged overnight, kept cool, easy commuting.',
    verdict: 'Practically new', good: true },
  { id: 'b', tag: 'Car B · taxi life', km: '50,000 km', soh: 71, grade: 'C',
    life: 'Fast-charged daily to 100%, parked in the sun, driven hard.',
    verdict: '~$15,000 battery risk', good: false },
]

/** The site's core argument, made interactive: identical odometers, opposite
 *  batteries. Hovering either card reveals the measured truth. */
export function OdometerProof() {
  const [active, setActive] = useState<string | null>(null)
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {CARS.map((c) => {
        const on = active === c.id
        return (
          <motion.button key={c.id} type="button"
            onMouseEnter={() => setActive(c.id)} onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(c.id)} onBlur={() => setActive(null)}
            onClick={() => setActive(on ? null : c.id)}
            whileHover={{ y: -4 }}
            className={cn('cursor-pointer rounded-2xl border p-7 text-left transition-colors duration-300',
              c.good ? 'border-teal/25 bg-teal/5' : 'border-destructive/25 bg-destructive/5')}>
            <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">{c.tag}</span>
            <b className="mt-4 block font-mono text-2xl tabular">{c.km}</b>
            <p className="mt-2 text-sm text-muted-foreground">{c.life}</p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-background/70">
              <motion.i
                className={cn('block h-full rounded-full', c.good ? 'bg-teal' : 'bg-destructive')}
                initial={{ width: 0 }} whileInView={{ width: `${c.soh}%` }}
                viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className={cn('flex items-center gap-2 text-sm font-semibold',
                c.good ? 'text-teal' : 'text-destructive')}>
                {c.good ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
                {c.verdict}
              </span>
              <motion.span
                animate={{ opacity: on ? 1 : 0.45 }}
                className="font-mono text-sm tabular">
                {c.soh}% · Grade {c.grade}
              </motion.span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
