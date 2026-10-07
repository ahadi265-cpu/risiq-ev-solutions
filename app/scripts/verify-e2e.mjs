#!/usr/bin/env node
/**
 * Headless-browser smoke check for the built site. Starts `vite preview` on
 * the current dist/, drives a real Chrome over the DevTools Protocol (no
 * Playwright — Node ≥ 22 has WebSocket built in), and asserts the things a
 * unit test cannot: WebGL mounts, Lenis engages on desktop and stays off on
 * touch, the pinned workflow pins and its background parallaxes at half
 * speed, the magnetic dialog trigger still opens a dialog, the collateral
 * gauge follows real slider input, the socket rig seats its plug / refuses its
 * OBD probe / scrubs its signal with scroll, the page survives a missing WebGL
 * context, and the phone / reduced-motion layout is a plain stack with no
 * horizontal overflow.
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
/** A genuine pointer press at a fraction of a slider's track — what a finger or mouse does.
 *  Waits for the track to stop moving (Lenis may still be gliding) and to be under the pointer. */
const pressSlider = async (label, f) => {
  const probe = `(()=>{const t=document.querySelector('[role=slider][aria-label="${label}"]').closest('[data-slot=slider]');const r=t.getBoundingClientRect();return {x:r.left,y:r.top+r.height/2,w:r.width}})()`
  let r = await ev(probe), still = 0
  for (let i = 0; i < 60 && still < 3; i++) { await sleep(120); const n = await ev(probe); still = n.x === r.x && n.y === r.y ? still + 1 : 0; r = n }
  const x = r.x + Math.max(2, Math.min(r.w - 2, r.w * f))
  await ev(`document.elementFromPoint(${x}, ${r.y})?.closest('[data-slot=slider]') ? true : false`)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: r.y })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y: r.y, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y: r.y, button: 'left', clickCount: 1 })
  await sleep(150)
}
/** Scrolls with real wheel input until `delta` (an expression over `el`) is ~0. Lenis ignores native
 *  scrollTo while it is still gliding from earlier wheel input, so a user-faithful scroll is the only
 *  reliable one on desktop; on touch (no Lenis) an instant scroll is exact. */
const scrollUntil = async (sel, delta) => {
  const D = `(()=>{const el=document.querySelector(${JSON.stringify(sel)});${'return ' + delta}})()`
  if (!(await ev(`document.documentElement.classList.contains('lenis')`))) { await ev(`window.scrollBy({top:${D},behavior:'instant'})`); return true }
  for (let i = 0; i < 150; i++) {
    const d = await ev(D)
    if (Math.abs(d) < 40) { await sleep(450); if (Math.abs(await ev(D)) < 60) return true; continue }
    await wheel(Math.max(-1200, Math.min(1200, d))); await sleep(140)
  }
  return false
}
const MID = 'el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2 - innerHeight / 2'
const centre = (sel) => scrollUntil(sel, MID)
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

  console.log('\nSignature components, desktop')
  // ---- collateral gauge
  await centre('[role=meter]')
  check('every slider thumb has an accessible name', await ev(`[...document.querySelectorAll('[role=slider]')].length >= 4 && [...document.querySelectorAll('[role=slider]')].every(t => t.getAttribute('aria-label'))`))
  const GAUGE = `(()=>{const m=document.querySelector('[role=meter]');const q=(k)=>m.querySelector('[data-gauge="'+k+'"]');const risk=document.querySelectorAll('[aria-label="Battery collateral risk"] b.font-mono')[2].querySelector('[aria-hidden]').textContent;return {now:+m.getAttribute('aria-valuenow'),angle:+/rotate\\(([-\\d.]+)/.exec(q('needle').getAttribute('transform'))[1],color:m.style.color,risk:+risk.replace(/[^\\d]/g,'')}})()`
  await until(`document.querySelector('[role=meter]').getAttribute('aria-valuenow')`)
  await sleep(1500)
  const g0 = await ev(GAUGE)
  check('gauge starts on the default life (needle on its reading)', Math.abs(g0.angle - (-135 + 2.7 * g0.now)) < 1.5, `${g0.now}% · ${g0.angle}°`)
  await pressSlider('Odometer (both cars)', 1); await pressSlider('Car B · fast charging', 1); await pressSlider('Car B · daily temperature', 1)
  check('dragging the sliders lowers the reading', await until(`+document.querySelector('[role=meter]').getAttribute('aria-valuenow') < ${g0.now - 3}`, 8_000))
  check('the needle springs onto the new reading', await until(`(()=>{const m=document.querySelector('[role=meter]');const a=+/rotate\\(([-\\d.]+)/.exec(m.querySelector('[data-gauge=needle]').getAttribute('transform'))[1];return Math.abs(a-(-135+2.7*+m.getAttribute('aria-valuenow')))<1})()`, 15_000))
  const g1 = await ev(GAUGE)
  check('the needle rotated anticlockwise', g1.angle < g0.angle - 5, `${g0.angle}° → ${g1.angle}°`)
  check('colour moves off emerald as health falls', g1.color !== g0.color, `${g0.color} → ${g1.color}`)
  check('value-at-risk counter rises with the damage', g1.risk > g0.risk, `$${g0.risk} → $${g1.risk}`)
  check('financial counters use tabular figures', await ev(`[...document.querySelectorAll('[aria-label="Battery collateral risk"] b.font-mono > [aria-hidden]')].every(e => getComputedStyle(e).fontVariantNumeric.includes('tabular-nums'))`))
  check('primary action carries the cyan glow', (await ev(`getComputedStyle([...document.querySelectorAll('a')].find(a => a.textContent.includes('Open the full calculator'))).boxShadow`)).includes('0, 242, 254'))

  // ---- socket rig
  const BOARD = `document.querySelector('[data-rig=board]')`
  const RATIO = `(()=>{const r=document.querySelector('[data-rig=plug]').getBoundingClientRect(),q=${BOARD}.getBoundingClientRect();return (r.right-q.left)/q.width})()`
  await centre('[data-rig=board]')
  check('socket mode: the plug seats and the link goes live', await until(`${BOARD}.dataset.phase === 'live'`, 25_000))
  const seat = await ev(RATIO)
  check('plug is flush in the inlet (tip at 87% of the board)', Math.abs(seat - 0.8703) < 0.012, `ratio ${seat?.toFixed(4)}`)
  check('current wave and meter are live', (await ev(`document.querySelector('[data-rig=wave]').dataset.live`)) === 'true')
  const kwh = () => ev(`parseFloat(document.querySelector('[data-rig=kwh]').textContent)`)
  const k0 = await kwh(); await sleep(1500)
  check('meter counts energy while connected', (await kwh()) > k0, `${k0} → ${await kwh()}`)
  await ev(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Replay connection')).click()`)
  check('replay returns the plug to its holster (layout animation both ways)', await until(`(${RATIO}) < 0.52`, 10_000))
  check('…and it snaps home again', await until(`${BOARD}.dataset.phase === 'live' && Math.abs((${RATIO}) - 0.8703) < 0.012`, 25_000))

  // ---- scroll-scrubbed signal: draws in as the link scrolls through the viewport
  const SCRUB = `(()=>{const d=document.querySelector('[data-rig=wave] .scrub-draw');return d?parseFloat(d.style.strokeDashoffset):null})()`
  await scrollUntil('[data-rig=wave]', 'el.getBoundingClientRect().top - innerHeight * 0.97')
  await sleep(1200)
  const off0 = await ev(SCRUB)
  await scrollUntil('[data-rig=wave]', 'el.getBoundingClientRect().bottom - innerHeight * 0.2')
  check('signal trace draws itself with scroll', typeof off0 === 'number' && off0 > 20 && await until(`(${SCRUB}) < 2`, 10_000), `offset ${off0?.toFixed?.(0)} → ${await ev(SCRUB)}`)

  // ---- OBD mode
  await centre('[data-rig=board]')
  await ev(`[...document.querySelectorAll('[role=tab]')].find(t => t.textContent.includes('Standard OBD diagnostics')).click()`)
  check('OBD mode: link goes dead and the meter has no path', await until(`document.querySelector('[data-rig=wave]').dataset.live === 'false' && document.querySelector('[data-rig=kwh]').textContent.includes('—')`, 5_000))
  check('OBD mode: "Encrypted / Access denied" overlay appears', await until(`getComputedStyle(document.querySelector('[data-rig=deny]')).opacity > 0.9 && document.querySelector('[data-rig=deny]').textContent.includes('ACCESS DENIED')`, 12_000))
  let lo = 1, hi = 0
  for (let i = 0; i < 24; i++) { const v = await ev(`(()=>{const r=document.querySelector('[data-rig=probe]').getBoundingClientRect(),q=${BOARD}.getBoundingClientRect();return (r.right-q.left)/q.width})()`); lo = Math.min(lo, v); hi = Math.max(hi, v); await sleep(250) }
  check('probe approaches the port but is refused short of its face', hi < 0.643 && hi - lo > 0.05, `probe tip ${lo.toFixed(3)}–${hi.toFixed(3)} of board (face at 0.643)`)

  console.log('\nPhone 390×844, coarse pointer, reduced motion')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await send('Emulation.setTouchEmulationEnabled', { enabled: true })
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'coarse' }, { name: 'hover', value: 'none' }, { name: 'prefers-reduced-motion', value: 'reduce' }] })
  await send('Page.navigate', { url: `http://localhost:${PORT}/` })
  await until(`!!document.querySelector('section[aria-labelledby="wf-title"] article')`)
  const h = await ev('document.documentElement.scrollHeight')
  for (let y = 0; y < h; y += 700) { await ev(`window.scrollTo({top:${y},behavior:'instant'})`); await sleep(60) }
  check('no horizontal overflow', (await ev('document.documentElement.scrollWidth')) === 390)
  await centre('[data-rig=board]')
  check('reduced motion: plug is seated and live without animating', await until(`document.querySelector('[data-rig=board]').dataset.phase === 'live'`, 15_000))
  check('phone: no horizontal overflow with the rig and gauge in view', (await ev('document.documentElement.scrollWidth')) === 390)
  check('Lenis stays off on touch', !(await ev(`document.documentElement.classList.contains('lenis')`)))
  check('no WebGL canvas under reduced motion', !(await ev(`!!document.querySelector('canvas')`)))
  check('workflow is a plain stack (no pin)', !(await ev(`!!document.querySelector('.pin-spacer')`)) && (await ev(`document.querySelectorAll('section[aria-labelledby="wf-title"] article').length`)) === 4)
  check('nothing left invisible', (await ev(`[...document.querySelectorAll('.reveal, .reveal-item, section, article')].filter(e=>getComputedStyle(e).opacity==='0').length`)) === 0)

  console.log('\nDesktop, WebGL unavailable')
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'fine' }, { name: 'hover', value: 'hover' }, { name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await send('Emulation.setTouchEmulationEnabled', { enabled: false })
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/i.test(t) ? null : g.call(this, t, ...a) }` })
  await send('Page.navigate', { url: `http://localhost:${PORT}/` })
  await until(`!!document.querySelector('h1')`)
  await sleep(4_000) // let the lazy hero canvas mount, fail, and be caught
  check('page still renders when the WebGL context cannot be created', await ev(`document.getElementById('root').children.length > 0 && !!document.querySelector('h1') && document.body.innerText.length > 2000`))
  check('the failed hero canvas is removed, not left half-mounted', !(await ev(`!!document.querySelector('canvas')`)))

  check('no uncaught exceptions', errors.length === 0, errors.join(' | '))
} finally {
  ws.close(); chrome.kill(); preview.kill()
}

console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed')
process.exit(failures.length ? 1 : 0)
