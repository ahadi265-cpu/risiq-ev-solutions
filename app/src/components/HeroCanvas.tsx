import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { hashStr, mulberry32 } from '@/lib/data'
import { repelSpringStep, type Cursor } from '@/lib/physics'

/* Its own chunk: postprocessing (plus maath/n8ao) is real weight, and only
   dark-mode desktop visitors ever render it — see HeroPostFX.tsx. */
const HeroPostFX = lazy(() => import('@/components/HeroPostFX'))

/* seeded, so the field is identical on every visit and pure across re-renders */
const rnd = mulberry32(hashStr('risiq-hero-field'))

/* Palette follows the theme: white sparks over the brand-red band in light,
   electric cyan and emerald over obsidian in dark. Bloom/chromatic aberration
   only mount in dark mode — see the note on <HeroCanvas> below. */
const LIGHT = { points: '#ffffff', cells: '#ffffff', opacity: 0.55, cellOpacity: 0.28, blend: THREE.NormalBlending }
const DARK = { points: '#00f2fe', cells: '#10b981', opacity: 0.85, cellOpacity: 0.4, blend: THREE.AdditiveBlending }

/* Updated by a single window listener; read by every particle each frame
   rather than re-rendering React on every pointer move. */
const mouse = { x: 0, y: 0 }

/** Casts the mouse ray onto the z=0 plane once per frame and returns the world
 *  point every particle repels from. Shared by both meshes via a ref so the
 *  raycaster/plane/vector allocate once, not per particle. */
function useWorldCursor() {
  const { camera } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const world = useMemo(() => new THREE.Vector3(), [])
  return (): Cursor => {
    ndc.set(mouse.x * 2, -mouse.y * 2)
    raycaster.setFromCamera(ndc, camera)
    raycaster.ray.intersectPlane(plane, world)
    return world
  }
}

function Particles({ count, dark, selRef }: { count: number; dark: boolean; selRef: React.RefObject<THREE.Points | null> }) {
  const pal = dark ? DARK : LIGHT
  const getCursor = useWorldCursor()

  // Base (rest) positions, live positions and velocities — one flat buffer
  // each, all mutated imperatively every frame inside useFrame. `count` never
  // changes for a mounted instance here, so a lazy useState initializer
  // computes this exactly once and hands back a stable object; nothing ever
  // calls the setter, so it never triggers a re-render either — the typed
  // arrays are then free to mutate in place every frame, which is the whole
  // point (driving 2,400 particles through React state instead would defeat
  // the reason useFrame exists).
  const [bufs] = useState(() => {
    const base = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      base[i * 3] = (rnd() - 0.5) * 22
      base[i * 3 + 1] = (rnd() - 0.5) * 12
      base[i * 3 + 2] = (rnd() - 0.5) * 6
    }
    return { base, positions: base.slice(), velocity: new Float32Array(count * 3) }
  })

  useFrame((state, rawDt) => {
    const p = selRef.current
    if (!p) return
    // oxlint flags mutating a useState value below (a generic "never mutate a
    // hook's return" purity rule) — correct in general, but incompatible with
    // any imperative useFrame animation, which is the standard, documented
    // R3F technique for exactly this (driving thousands of particles through
    // React state instead would defeat the reason useFrame exists). Same
    // category this codebase already accepts for set-state-in-effect elsewhere.
    const { base, positions, velocity } = bufs
    repelSpringStep(positions, base, velocity, count, getCursor(), rawDt)
    const attr = p.geometry.getAttribute('position') as THREE.BufferAttribute
    attr.needsUpdate = true

    // slow ambient bob on the whole field, independent of the per-particle physics
    const t = state.clock.elapsedTime
    p.position.y = Math.sin(t * 0.25) * 0.15
    p.rotation.z = Math.sin(t * 0.05) * 0.06
  })

  return (
    <points ref={selRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[bufs.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={pal.points} size={0.045} sizeAttenuation transparent opacity={pal.opacity}
        depthWrite={false} blending={pal.blend} />
    </points>
  )
}

/** A loose array of wireframe battery cells that repel from the cursor with
 *  the same spring physics as the particle field, plus a slow ambient tumble. */
function Cells({ count, dark, selRef }: { count: number; dark: boolean; selRef: React.RefObject<THREE.InstancedMesh | null> }) {
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const getCursor = useWorldCursor()
  // Same reasoning as Particles above: mutable animation state computed once
  // via a lazy useState initializer. xyz buffers share the particle step; the
  // per-cell tumble parameters are read-only after seeding.
  const [cellBufs] = useState(() => {
    const base = new Float32Array(count * 3)
    const rx = new Float32Array(count), ry = new Float32Array(count)
    const spin = new Float32Array(count), drift = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      base[i * 3] = (rnd() - 0.5) * 18
      base[i * 3 + 1] = (rnd() - 0.5) * 9
      base[i * 3 + 2] = -1.5 - rnd() * 4
      rx[i] = rnd() * Math.PI; ry[i] = rnd() * Math.PI
      spin[i] = 0.15 + rnd() * 0.3; drift[i] = rnd() * Math.PI * 2
    }
    return { base, positions: base.slice(), velocity: new Float32Array(count * 3), rx, ry, spin, drift }
  })

  useFrame((state, rawDt) => {
    const m = selRef.current
    if (!m) return
    // see the matching note in Particles above — same accepted false positive.
    const { base, positions, velocity, rx, ry, spin, drift } = cellBufs
    const t = state.clock.elapsedTime
    repelSpringStep(positions, base, velocity, count, getCursor(), rawDt)
    for (let i = 0; i < count; i++) {
      const bob = Math.sin(t * 0.3 + drift[i]) * 0.25
      dummy.position.set(positions[i * 3], positions[i * 3 + 1] + bob, positions[i * 3 + 2])
      dummy.rotation.set(rx[i] + t * spin[i] * 0.4, ry[i] + t * spin[i], 0)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  const pal = dark ? DARK : LIGHT
  return (
    <instancedMesh ref={selRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.32, 0.7, 0.32]} />
      <meshBasicMaterial color={pal.cells} wireframe transparent opacity={pal.cellOpacity} depthWrite={false} />
    </instancedMesh>
  )
}

/** WebGL layer behind the hero. Lazy-loaded, pointer-events off, and never
 *  mounted under reduced motion (the parent decides). Follows the theme
 *  class; postprocessing (bloom/chromatic aberration/grain) is dark-mode
 *  only — in light mode the particles are dim white sparks over the red
 *  band, not a neon palette, so there is nothing there worth the extra
 *  render passes or the extra download. */
export default function HeroCanvas() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const small = typeof window !== 'undefined' && window.innerWidth < 768
  const particlesRef = useRef<THREE.Points>(null)
  const cellsRef = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5 }
    window.addEventListener('pointermove', onMove, { passive: true })
    const mo = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => { window.removeEventListener('pointermove', onMove); mo.disconnect() }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }} style={{ position: 'absolute', inset: 0 }}>
        <Particles count={small ? 900 : 2400} dark={dark} selRef={particlesRef} />
        <Cells count={small ? 10 : 26} dark={dark} selRef={cellsRef} />
        {dark && !small && (
          <Suspense fallback={null}><HeroPostFX particlesRef={particlesRef} cellsRef={cellsRef} /></Suspense>
        )}
      </Canvas>
    </div>
  )
}
