import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import dustVert from './shaders/dust.vert.glsl?raw'
import dustFrag from './shaders/dust.frag.glsl?raw'
import { PARTICLES } from '@/config/intro'
import { buildDustParticleAttributes } from '@/lib/particleAttributes'

type Props = {
  isMobile: boolean
  visible: boolean
}

export default function AmbientDust({ isMobile, visible }: Props) {
  const count = isMobile ? PARTICLES.MOBILE_DUST : PARTICLES.DESKTOP_DUST
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const visRef = useRef(0)

  const { geometry, uniforms } = useMemo(() => {
    const { aSeed, aOrigin, aSize } = buildDustParticleAttributes(count)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(aOrigin.slice(), 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1))
    geo.setAttribute('aOrigin', new THREE.BufferAttribute(aOrigin, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1))

    const unis = {
      uTime: { value: 0 },
      uVisible: { value: 0 },
    }
    return { geometry: geo, uniforms: unis }
  }, [count])

  useFrame((_, delta) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value += delta
    const target = visible ? 1 : 0
    visRef.current += (target - visRef.current) * Math.min(delta * 0.5, 1)
    matRef.current.uniforms.uVisible.value = visRef.current
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
