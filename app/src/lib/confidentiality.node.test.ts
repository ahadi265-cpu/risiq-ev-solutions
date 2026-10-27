import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { COMPAT, EVIDENCE, FIELD_BADGE } from '@/lib/data'

/* Owner directive (2026-10-27): field results are presented through an institutional lens only —
   certification, asset valuation and fleet intelligence. No bus identifiers, diagnostic service
   codes, parameter addresses, raw payloads or protocol detail may appear in public copy or code.
   This guard fails the build if any of it ever lands in the files that carry field content. */
const HEX_ID = /\b0x[0-9a-f]{2,}\b/i
const BANNED: [RegExp, string][] = [
  [/\bUDS\b/, 'a diagnostic service name'],
  [/\b(PID|DID)s?\b/, 'a parameter identifier'],
  [/\bCAN\s?(ID|bus)/i, 'a bus identifier'],
  [/\bservice\s+0x/i, 'a service code'],
  [/\b(7E[0-9A-F]|78[0-9]|1FF[A-F])\b/, 'a bare bus or parameter address'],
  [/\b[0-9a-f]{2}( [0-9a-f]{2}){3,}\b/i, 'a raw byte payload'],
]
/* In source files the hex rule applies to copy only — a string literal or JSX text on the same
   line — so a genuine hex constant in code (the seeded PRNG in data.ts) is not a false positive. */
const HEX_IN_COPY = /(['"`>])[^'"`<\n]*\b0x[0-9a-f]{2,}\b/i
const PUBLIC_SOURCES = ['lib/data.ts', 'components/FieldEvidence.tsx', 'components/CompatibilitySearch.tsx', 'pages/Home.tsx']

describe('confidentiality guard', () => {
  const blob = JSON.stringify({ COMPAT, EVIDENCE, FIELD_BADGE })
  it('field data carries no hexadecimal identifier', () => { expect(blob).not.toMatch(HEX_ID) })
  for (const [re, what] of BANNED) {
    it(`field data carries no ${what}`, () => { expect(blob).not.toMatch(re) })
  }
  for (const f of PUBLIC_SOURCES) {
    it(`${f} carries no protocol detail in its copy`, () => {
      const src = readFileSync(join(__dirname, '..', f), 'utf8')
      expect(src, `${f}: a hexadecimal identifier in copy`).not.toMatch(HEX_IN_COPY)
      for (const [re, what] of BANNED) expect(src, `${f}: ${what}`).not.toMatch(re)
    })
  }
  it('would catch a leak', () => {
    expect('"request 0x7E7, reply 0x7EF"').toMatch(HEX_IN_COPY)
    expect('<p>service 0x22 reads</p>').toMatch(HEX_IN_COPY)
    expect('header 781 → 789').toMatch(BANNED[4][0])
    expect('a = (a + 0x6d2b79f5) | 0').not.toMatch(HEX_IN_COPY)
  })
})
