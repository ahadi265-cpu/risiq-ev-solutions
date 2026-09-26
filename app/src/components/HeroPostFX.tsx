import { EffectComposer, SelectiveBloom, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type * as THREE from 'three'

/** Bloom limited to the particle field and battery cells via THREE.Layers
 *  (SelectiveBloom's `selection`), plus a hairline chromatic-aberration lens
 *  offset and a whisper of film grain. This whole module is its own lazy
 *  chunk (see HeroCanvas) — postprocessing + its maath/n8ao dependencies are
 *  real weight, and only dark-mode desktop visitors ever render this. */
export default function HeroPostFX({ particlesRef, cellsRef }: {
  particlesRef: React.RefObject<THREE.Points | null>; cellsRef: React.RefObject<THREE.InstancedMesh | null>
}) {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <SelectiveBloom selection={[particlesRef, cellsRef]} ignoreBackground
        intensity={1.1} luminanceThreshold={0.18} luminanceSmoothing={0.9} mipmapBlur radius={0.6} />
      <ChromaticAberration offset={[0.0008, 0.0008]} radialModulation={false} modulationOffset={0} />
      {/* subtle film grain on the canvas itself — the DOM .noise-overlay already
          textures the whole page, so this stays faint rather than doubling up */}
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.025} />
    </EffectComposer>
  )
}
