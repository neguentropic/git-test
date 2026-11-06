import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  type Points,
} from 'three'
import {
  CAMERA_Z,
  DUST_PERIOD_S,
  DUST_SPIRAL_RAD,
  PARTICLE_COLOR_COOL,
  PARTICLE_COLOR_WARM,
  WORLD_HEIGHT,
} from '@/config/intro'
import { getDustOpacity } from '@/lib/introTimeline'
import { createDustAttributes, createRng, getParticleBudget } from '@/lib/particleData'
import type { SceneState } from './sceneState'
import fragmentShader from './shaders/particle.frag.glsl?raw'
import vertexShader from './shaders/dust.vert.glsl?raw'

type AmbientDustProps = {
  sceneRef: RefObject<SceneState>
}

const ATTRIBUTES_SEED = 22

function createGeometry(count: number) {
  const { aSpawn, aSeed, aSize } = createDustAttributes(count, createRng(ATTRIBUTES_SEED))
  const geometry = new BufferGeometry()
  const spawn = new BufferAttribute(aSpawn, 3)
  geometry.setAttribute('position', spawn)
  geometry.setAttribute('aSpawn', spawn)
  geometry.setAttribute('aSeed', new BufferAttribute(aSeed, 4))
  geometry.setAttribute('aSize', new BufferAttribute(aSize, 1))
  return geometry
}

function createMaterial() {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPeriod: { value: DUST_PERIOD_S },
      uOpacity: { value: 0 },
      uSpiral: { value: DUST_SPIRAL_RAD },
      uPointScale: { value: 1 },
      uExtent: { value: [1, 1] },
      uWordHalf: { value: [0, 0] },
      uColorCool: { value: new Color(PARTICLE_COLOR_COOL) },
      uColorWarm: { value: new Color(PARTICLE_COLOR_WARM) },
    },
  })
}

export default function AmbientDust({ sceneRef }: AmbientDustProps) {
  const pointsRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null)
  const size = useThree((state) => state.size)
  const dpr = useThree((state) => state.viewport.dpr)

  const [count] = useState(() => getParticleBudget(window.innerWidth).dust)
  const geometry = useMemo(() => createGeometry(count), [count])
  const material = useMemo(() => createMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useEffect(() => {
    const points = pointsRef.current
    if (!points) return

    const extentY = WORLD_HEIGHT / 2
    points.material.uniforms.uExtent.value = [(extentY * size.width) / size.height, extentY]
    points.material.uniforms.uPointScale.value = dpr * CAMERA_Z
  }, [dpr, size])

  useFrame(() => {
    const points = pointsRef.current
    if (!points) return

    const scene = sceneRef.current
    const opacity = getDustOpacity(scene.elapsedMs)
    const { uniforms } = points.material
    uniforms.uTime.value = scene.timeS
    uniforms.uOpacity.value = opacity
    uniforms.uWordHalf.value[0] = scene.wordHalfWidth
    uniforms.uWordHalf.value[1] = scene.wordHalfHeight
    points.visible = opacity > 0
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      visible={false}
    />
  )
}
