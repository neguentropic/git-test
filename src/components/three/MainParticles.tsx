import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleText } from '@/lib/sampleText'
import { getIntroState, IntroPhase } from '@/lib/introTimeline'
import type { IntroPhaseValue } from '@/lib/introTimeline'
import { MAIN_COUNT_DESKTOP, MAIN_COUNT_MOBILE } from '@/config/intro'
import { setIntroPhase } from '@/lib/introState'
import { mainVert, mainFrag } from './shaders'

interface Props {
  reduced: boolean
  skippedRef: React.RefObject<boolean>
}

// Rayon de l'anneau ≈ 2.0 → diamètre ≈ moitié de la hauteur visible (demi-hauteur ≈ 3.84)
function makeStarField(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const rng = Math.random()
    let r: number
    if (rng < 0.65) {
      // étoiles lointaines, hors de l'anneau
      r = 2.5 + Math.random() * 4.5
    } else if (rng < 0.88) {
      // anneau du trou noir (r ≈ 2.0)
      r = 1.8 + Math.random() * 0.4
    } else {
      // halo interne (intérieur de l'anneau)
      r = Math.random() * 1.6
    }
    const theta = Math.random() * Math.PI * 2
    const flatZ = r < 2.3 ? 0.04 : 1.0
    arr[i * 3 + 0] = r * Math.cos(theta)
    arr[i * 3 + 1] = r * Math.sin(theta)
    arr[i * 3 + 2] = (Math.random() - 0.5) * flatZ
  }
  return arr
}

function makeGather(count: number): Float32Array {
  // point de rassemblement au centre (destination de l'implosion)
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const r = Math.random() * 0.06
    arr[i * 3 + 0] = r * Math.cos(theta)
    arr[i * 3 + 1] = r * Math.sin(theta)
    arr[i * 3 + 2] = (Math.random() - 0.5) * 0.02
  }
  return arr
}

export default function MainParticles({ reduced, skippedRef }: Props) {
  const { size, gl } = useThree()
  const isMobile = size.width < 768
  const count = isMobile ? MAIN_COUNT_MOBILE : MAIN_COUNT_DESKTOP

  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const clockMs = useRef(0)
  const prevPhase = useRef<IntroPhaseValue>(-1 as IntroPhaseValue)
  const uTime = useRef(0)

  const [wordPos, setWordPos] = useState<Float32Array | null>(null)

  useEffect(() => {
    sampleText('Neguentropia', count, size.width, size.height).then(setWordPos)
  }, [count, size.width, size.height])

  const discPos = useMemo(() => makeStarField(count), [count])
  const burstPos = useMemo(() => makeGather(count), [count])
  const seeds = useMemo(() => {
    const a = new Float32Array(count)
    for (let i = 0; i < count; i++) a[i] = Math.random()
    return a
  }, [count])
  const sizes = useMemo(() => {
    const a = new Float32Array(count)
    for (let i = 0; i < count; i++) a[i] = 1.0 + Math.random() * 2.0
    return a
  }, [count])

  const dpr = gl.getPixelRatio()

  const geo = useMemo(() => {
    if (!wordPos) return null
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(discPos.slice(), 3))
    g.setAttribute('aDisc', new THREE.BufferAttribute(discPos, 3))
    g.setAttribute('aBurst', new THREE.BufferAttribute(burstPos, 3))
    g.setAttribute('aWord', new THREE.BufferAttribute(wordPos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    return g
  }, [wordPos, discPos, burstPos, seeds, sizes])

  useEffect(() => {
    return () => {
      geo?.dispose()
    }
  }, [geo])

  useFrame((_, delta) => {
    if (!matRef.current || !wordPos) return
    if (document.visibilityState === 'hidden') return

    const cappedDelta = Math.min(delta, 0.1)
    uTime.current += cappedDelta

    if (reduced || skippedRef.current) {
      matRef.current.uniforms.uPhase.value = IntroPhase.SloganReveal
      matRef.current.uniforms.uProgress.value = 1
      matRef.current.uniforms.uTime.value = uTime.current
      if (prevPhase.current !== IntroPhase.SloganReveal) {
        prevPhase.current = IntroPhase.SloganReveal
        setIntroPhase(IntroPhase.SloganReveal)
      }
      return
    }

    clockMs.current += cappedDelta * 1000
    const { phase, progress } = getIntroState(clockMs.current)

    matRef.current.uniforms.uTime.value = uTime.current
    matRef.current.uniforms.uPhase.value = phase
    matRef.current.uniforms.uProgress.value = progress

    if (phase !== prevPhase.current) {
      prevPhase.current = phase
      setIntroPhase(phase)
    }
  })

  if (!geo) return null

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={mainVert}
        fragmentShader={mainFrag}
        uniforms={{
          uTime: { value: 0 },
          uPhase: { value: 0 },
          uProgress: { value: 0 },
          uDPR: { value: dpr },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
