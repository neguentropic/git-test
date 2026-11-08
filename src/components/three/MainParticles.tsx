import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import mainVert from './shaders/main.vert.glsl?raw'
import mainFrag from './shaders/main.frag.glsl?raw'
import {
  PARTICLES,
  BREATH_SCALE_RANGE,
  BREATH_PERIOD_MS,
  MAX_DELTA_MS,
} from '@/config/intro'
import {
  getIntroState,
  type IntroPhase,
} from '@/lib/introTimeline'
import { sampleText } from '@/lib/sampleText'
import { buildMainParticleAttributes } from '@/lib/particleAttributes'

type Props = {
  isMobile: boolean
  reducedMotion: boolean
  onPhaseChange?: (phase: IntroPhase) => void
  skipToEnd?: boolean
}

export default function MainParticles({
  isMobile,
  reducedMotion,
  onPhaseChange,
  skipToEnd,
}: Props) {
  const count = isMobile ? PARTICLES.MOBILE_MAIN : PARTICLES.DESKTOP_MAIN
  const { size } = useThree()

  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const elapsedRef = useRef(0)
  const lastPhaseRef = useRef<IntroPhase>(-1 as IntroPhase)

  // Build geometry attributes once per count value
  const { geometry, uniforms } = useMemo(() => {
    const { aDisc, aBurst, aWord, aSeed, aSize } =
      buildMainParticleAttributes(count)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(aDisc, 3))
    geo.setAttribute('aDisc', new THREE.BufferAttribute(aDisc, 3))
    geo.setAttribute('aBurst', new THREE.BufferAttribute(aBurst, 3))
    geo.setAttribute('aWord', new THREE.BufferAttribute(aWord, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1))

    const unis = {
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uProgress: { value: 0 },
      uBreath: { value: 0 },
      uAspect: { value: size.width / size.height },
    }

    return { geometry: geo, uniforms: unis }
  }, [count, size.width, size.height])

  // Load word positions async
  useEffect(() => {
    sampleText(size.width, size.height, count).then((positions) => {
      const attr = geometry.getAttribute('aWord') as THREE.BufferAttribute
      const aspect = size.width / size.height
      for (let i = 0; i < count; i++) {
        attr.array[i * 3] = positions[i * 3] * aspect * 1.1
        attr.array[i * 3 + 1] = positions[i * 3 + 1] * 1.1
        attr.array[i * 3 + 2] = positions[i * 3 + 2]
      }
      attr.needsUpdate = true
    })
  }, [count, size, geometry])

  // If skip requested, jump to end immediately
  useEffect(() => {
    if (skipToEnd) {
      elapsedRef.current = Infinity
    }
  }, [skipToEnd])

  useFrame((_, delta) => {
    if (!materialRef.current) return
    const mat = materialRef.current
    const cappedDelta = Math.min(delta * 1000, MAX_DELTA_MS)

    if (!reducedMotion) {
      elapsedRef.current += cappedDelta
    }

    const state = reducedMotion
      ? { phase: 4 as IntroPhase, progress: 1, elapsed: Infinity, complete: true }
      : getIntroState(elapsedRef.current)

    if (state.phase !== lastPhaseRef.current) {
      lastPhaseRef.current = state.phase
      onPhaseChange?.(state.phase)
    }

    const breathT =
      Math.sin((Date.now() / BREATH_PERIOD_MS) * Math.PI * 2) * BREATH_SCALE_RANGE

    mat.uniforms.uTime.value += delta
    mat.uniforms.uPhase.value = state.phase
    mat.uniforms.uProgress.value = state.phase < 4 ? state.progress : 1
    mat.uniforms.uBreath.value = state.phase === 0 ? breathT : 0
    mat.uniforms.uAspect.value = size.width / size.height
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={mainVert}
        fragmentShader={mainFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
