import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(n) ? [p] : [] })

/** A Recharts chart outside a ResponsiveContainer has a fixed pixel size and overflows a phone. */
describe('Recharts instances', () => {
  const src = join(__dirname, '..')
  const chartRe = /<(Line|Area|Bar|RadialBar|Pie|Composed|Scatter|Radar)Chart\b/g
  for (const f of walk(src)) {
    const text = readFileSync(f, 'utf8'); const charts = text.match(chartRe)?.length ?? 0
    if (!charts) continue
    it(`${f.slice(src.length + 1)}: all ${charts} chart(s) sit inside a ResponsiveContainer`, () => {
      expect(text.match(/<ResponsiveContainer\b/g)?.length ?? 0).toBeGreaterThanOrEqual(charts)
    })
  }
  it('finds the charts it is meant to guard', () => {
    const files = walk(src).filter((f) => (readFileSync(f, 'utf8').match(chartRe)?.length ?? 0) > 0)
    expect(files.length).toBeGreaterThanOrEqual(3) // BlindSpotChart, Tools, Pilot
  })
})
