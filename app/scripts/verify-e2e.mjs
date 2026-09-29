#!/usr/bin/env node
/**
 * Headless-browser smoke check for the built site. Starts `vite preview` on
 * the current dist/, drives a real Chrome over the DevTools Protocol (no
 * Playwright — Node ≥ 22 has WebSocket built in), and asserts the things a
 * unit test cannot: WebGL mounts, Lenis engages on desktop and stays off on
 * touch, the pinned workflow pins and its background parallaxes at half
 * speed, the magnetic dialog trigger still opens a dialog, and the phone /
 * reduced-motion layout is a plain stack with no horizontal overflow.
 *
 *   npm run build && npm run verify:e2e
 *   CHROME_PATH=/path/to/chrome npm run verify:e2e   # if auto-detection fails
 */
import { spawn, execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const PORT = 4173, DBG = 9222 + Math.floor(Math.random() * 500)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const failures = []
const check = (name, ok, detail = '') => { console.log(`${ok ? '  ok ' : ' FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) failures.push(name) }

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  if (existsSync(mac)) return mac
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try { return execSync(`command -v ${bin}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { /* next */ }
  }
  throw new Error('No Chrome found. Set CHROME_PATH.')
}

const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://localhost:${PORT}/`)).ok) break } catch { /* not up */ } await sleep(250) }

const chrome = spawn(findChrome(), ['--headless=new', '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${DBG}`, '--window-size=1440,900', `--user-data-dir=/tmp/risiq-e2e-${Date.now()}`, 'about:blank'], { stdio: 'ignore' })
let targets = []
for (let i = 0; i < 120; i++) { try { targets = await (await fetch(`http://127.0.0.1:${DBG}/json`)).json(); if (targets.some((t) => t.type === 'page')) break } catch { /* not up */ } await sleep(250) }
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0; const pending = new Map(); const errors = []
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) } else if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text) }
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value
const wheel = async (dy) => { await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 450, deltaX: 0, deltaY: dy }); await sleep(60) }
/** Polls an expression until it is truthy — fixed sleeps are where these scripts get flaky. */
const until = async (expr, ms = 10_000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await ev(expr)) return true; await sleep(150) } return false }

try {
  await send('Page.enable'); await send('Runtime.enable')

  console.log('\nDesktop 1440×900')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: `http://localhost:${PORT}/` })
  check('hero headline renders', await until(`!!document.querySelector('h1')`))
  check('Lenis engaged', await until(`document.documentElement.classList.contains('lenis')`))
  // the three.js chunk is lazy and ~900 kB; give a cold preview server time to hand it over
  check('WebGL hero canvas mounted', await until(`(()=>{const c=document.querySelector('canvas');return !!c && !!(c.getContext('webgl2')||c.getContext('webgl'))})()`, 15_000))
  check('noise overlay present', await ev(`!!document.querySelector('.noise-overlay')`))
  check('font stylesheet non-blocking', await ev(`!!document.querySelector('link[rel=stylesheet][media=all]')`))

  const trig = `[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Live verification demo'))`
  check('magnetic trigger keeps aria-haspopup', (await ev(`${trig}?.getAttribute('aria-haspopup')`)) === 'dialog')
  await ev(`${trig}.click()`)
  check('magnetic trigger opens the certificate inspector', await until(`!!document.querySelector('[role=dialog]')`))
  check('inspector renders the cell heatmap', await until(`document.querySelectorAll('[role=dialog] [aria-label^="Cell "]').length === 96`))
  // dismiss through the dialog's own close control — what a user reaches for, and
  // it exercises the same Radix onOpenChange path as Escape without depending on
  // how faithfully a synthesised keydown reaches document-level listeners
  await ev(`[...document.querySelectorAll('[role=dialog] button')].find(b => b.textContent.trim() === 'Close')?.click()`)
  check('close control dismisses the dialog', await until(`!document.querySelector('[role=dialog]')`, 5_000))

  const SEC = `document.querySelector('section[aria-labelledby="wf-title"]')`
  let top = await ev(`${SEC}?.getBoundingClientRect().top`), n = 0
  while (typeof top === 'number' && top > 4 && n < 80) { await wheel(Math.min(900, Math.max(120, top - 2))); await sleep(150); top = await ev(`${SEC}?.getBoundingClientRect().top`); n++ }
  check('workflow section pins', await until(`!!document.querySelector('.pin-spacer') && Math.abs(${SEC}.getBoundingClientRect().top) < 4`, 5_000))
  for (let i = 0; i < 6; i++) { await wheel(420); await sleep(300) }
  const ratio = await ev(`(()=>{const s=${SEC};const x=(el)=>{const m=getComputedStyle(el).transform;return m==='none'?0:parseFloat(m.slice(7,-1).split(', ')[4])};const t=x(s.querySelector('.will-change-transform:not(.bg-grid)')),b=x(s.querySelector('.bg-grid'));return t?b/t:null})()`)
  check('background parallaxes at half the track speed', ratio !== null && Math.abs(ratio - 0.5) < 0.05, `ratio ${ratio?.toFixed(3)}`)
  check('scrolled through to step 04', (await ev(`${SEC}.querySelector('span.tabular')?.textContent`)) === '04 / 04')

  console.log('\nPhone 390×844, coarse pointer, reduced motion')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true })
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'coarse' }, { name: 'hover', value: 'none' }, { name: 'prefers-reduced-motion', value: 'reduce' }] })
  await send('Page.navigate', { url: `http://localhost:${PORT}/` })
  await until(`!!document.querySelector('section[aria-labelledby="wf-title"] article')`)
  const h = await ev('document.documentElement.scrollHeight')
  for (let y = 0; y < h; y += 700) { await ev(`window.scrollTo({top:${y},behavior:'instant'})`); await sleep(60) }
  check('no horizontal overflow', (await ev('document.documentElement.scrollWidth')) === 390)
  check('Lenis stays off on touch', !(await ev(`document.documentElement.classList.contains('lenis')`)))
  check('no WebGL canvas under reduced motion', !(await ev(`!!document.querySelector('canvas')`)))
  check('workflow is a plain stack (no pin)', !(await ev(`!!document.querySelector('.pin-spacer')`)) && (await ev(`document.querySelectorAll('section[aria-labelledby="wf-title"] article').length`)) === 4)
  check('nothing left invisible', (await ev(`[...document.querySelectorAll('.reveal, .reveal-item, section, article')].filter(e=>getComputedStyle(e).opacity==='0').length`)) === 0)

  check('no uncaught exceptions', errors.length === 0, errors.join(' | '))
} finally {
  ws.close(); chrome.kill(); preview.kill()
}

console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed')
process.exit(failures.length ? 1 : 0)
