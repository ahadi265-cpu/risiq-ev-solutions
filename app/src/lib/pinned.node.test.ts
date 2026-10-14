import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PIN_QUERY } from '@/lib/pinned'

describe('pinned workflow: one condition for the layout and the pin', () => {
  const css = readFileSync(join(__dirname, '../index.css'), 'utf8')
  it('the CSS `pinned:` variant uses exactly the query the GSAP pin uses', () => {
    const m = css.match(/@custom-variant pinned \(@media (\([^;]+\))\);/)
    expect(m, 'index.css must define @custom-variant pinned').not.toBeNull()
    expect(m![1]).toBe(PIN_QUERY)
  })
  it('requires a wide screen, a fine pointer and motion — so touch and reduced-motion get the stack', () => {
    expect(PIN_QUERY).toContain('min-width: 1024px')
    expect(PIN_QUERY).toContain('pointer: fine')
    expect(PIN_QUERY).toContain('prefers-reduced-motion: no-preference')
  })
  it('the workflow component no longer uses lg: for its horizontal layout', () => {
    const src = readFileSync(join(__dirname, '../components/WorkflowScroller.tsx'), 'utf8')
    expect(src).not.toMatch(/\blg:/)
    expect(src).toContain('PIN_QUERY')
  })
})
