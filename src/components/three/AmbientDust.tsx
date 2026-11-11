import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DUST_COUNT_DESKTOP, DUST_COUNT_MOBILE } from '@/config/intro'
import { dustVert, dustFrag } from './shaders'
import { useIntroPhase } from '@/lib/introState'
import { IntroPhase } from '@/lib/introTimeline'

function makeDustOrigins(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const phi = Math.random() * Math.PI * 2
    const cosT = Math.random() * 2 - 1
    const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT))
    const r = 3 + Math.random() * 2
    arr[i * 3 + 0] = r * sinT * Math.cos(phi)
    arr[i * 3 + 1] = r * sinT * Math.sin(phi) * 0.5
    arr[i * 3 + 2] = r * cosT * 0.3
  }
  return arr
}

export default function AmbientDust() {
  const phase = useIntroPhase()
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const count = isMobile ? DUST_COUNT_MOBILE : DUST_COUNT_DESKTOP

  const matRef = useRef<THREE.ShaderMaterial>(null!)

  const origins = useMemo(() => makeDustOrigins(count), [count])
  const seeds = useMemo(() => {
    const a = new Float32Array(count)
    for (let i = 0; i < count; i++) a[i] = Math.random()
    return a
  }, [count])
  const phaseOffsets = useMemo(() => {
    const a = new Float32Array(count)
    for (let i = 0; i < count; i++) a[i] = Math.random()
    return a
  }, [count])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(origins.slice(), 3))
    g.setAttribute('aOrigin', new THREE.BufferAttribute(origins, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setAttribute('aPhaseOff', new THREE.BufferAttribute(phaseOffsets, 1))
    return g
  }, [origins, seeds, phaseOffsets])

  useFrame((_, delta) => {
    if (!matRef.current) return
    if (document.visibilityState === 'hidden') return
    matRef.current.uniforms.uTime.value += Math.min(delta, 0.1)
    matRef.current.uniforms.uPhase.value = phase
  })

  if (phase < IntroPhase.DustAttraction) return null

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        uniforms={{
          uTime: { value: 0 },
          uPhase: { value: phase },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
