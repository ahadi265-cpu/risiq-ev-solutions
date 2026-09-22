import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { hashStr, mulberry32 } from '@/lib/data'

/* seeded, so the field is identical on every visit and pure across re-renders */
const rnd = mulberry32(hashStr('risiq-hero-field'))

/* Palette follows the theme: white sparks over the brand-red band in light,
   electric cyan and emerald over obsidian in dark. */
const LIGHT = { points: '#ffffff', cells: '#ffffff', opacity: 0.55, cellOpacity: 0.28, blend: THREE.NormalBlending }
const DARK = { points: '#00f2fe', cells: '#10b981', opacity: 0.85, cellOpacity: 0.4, blend: THREE.AdditiveBlending }

const mouse = { x: 0, y: 0 }

function Particles({ count, dark }: { count: number; dark: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const pal = dark ? DARK : LIGHT
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3] = (rnd() - 0.5) * 22
      a[i * 3 + 1] = (rnd() - 0.5) * 12
      a[i * 3 + 2] = (rnd() - 0.5) * 6
    }
    return a
  }, [count])
  useFrame((state, dt) => {
    const p = ref.current
    if (!p) return
    const t = state.clock.elapsedTime
    // the whole field leans toward the cursor on a lerp, and breathes very slowly
    p.rotation.y += ((mouse.x * 0.28) - p.rotation.y) * Math.min(1, dt * 2.5)
    p.rotation.x += ((-mouse.y * 0.18) - p.rotation.x) * Math.min(1, dt * 2.5)
    p.rotation.z = Math.sin(t * 0.05) * 0.06
    p.position.y = Math.sin(t * 0.25) * 0.15
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={pal.points} size={0.045} sizeAttenuation transparent opacity={pal.opacity}
        depthWrite={false} blending={pal.blend} />
    </points>
  )
}

/** A loose array of wireframe battery cells tumbling slowly in depth. */
function Cells({ count, dark }: { count: number; dark: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(() => Array.from({ length: count }, () => ({
    x: (rnd() - 0.5) * 18, y: (rnd() - 0.5) * 9, z: -1.5 - rnd() * 4,
    rx: rnd() * Math.PI, ry: rnd() * Math.PI, spin: 0.15 + rnd() * 0.3, drift: rnd() * Math.PI * 2,
  })), [count])
  useFrame((state) => {
    const m = ref.current
    if (!m) return
    const t = state.clock.elapsedTime
    seeds.forEach((s, i) => {
      dummy.position.set(s.x + mouse.x * (0.6 + s.z * -0.1), s.y + Math.sin(t * 0.3 + s.drift) * 0.25 - mouse.y * 0.4, s.z)
      dummy.rotation.set(s.rx + t * s.spin * 0.4, s.ry + t * s.spin, 0)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  const pal = dark ? DARK : LIGHT
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.32, 0.7, 0.32]} />
      <meshBasicMaterial color={pal.cells} wireframe transparent opacity={pal.cellOpacity} depthWrite={false} />
    </instancedMesh>
  )
}

/** WebGL layer behind the hero. Lazy-loaded, pointer-events off, and never
 *  mounted under reduced motion (the parent decides). Follows the theme class. */
export default function HeroField() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const small = typeof window !== 'undefined' && window.innerWidth < 768
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
        <Particles count={small ? 900 : 2400} dark={dark} />
        <Cells count={small ? 10 : 26} dark={dark} />
      </Canvas>
    </div>
  )
}
