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
  BURST_DEPTH,
  BURST_TURBULENCE,
  CAMERA_Z,
  CONTRACT_SPIRAL_RAD,
  CONTRACT_STAGGER,
  DISC_RADIUS_RATIO_HALF_WIDTH,
  DISC_RADIUS_RATIO_HEIGHT,
  INTRO_TOTAL_MS,
  INTRO_WORD,
  MAX_FRAME_DELTA_S,
  PARTICLE_COLOR_COOL,
  PARTICLE_COLOR_WARM,
  RESIZE_DEBOUNCE_MS,
  WORD_FADE_RATE,
  WORD_JITTER_RATIO,
  WORD_POINT_SIZE_MIN_DEVICE_PX,
  WORD_POINT_SIZE_RATIO,
  WORLD_HEIGHT,
} from '@/config/intro'
import { introStore } from '@/lib/introStore'
import { createIntroState, getDiscAngle, getDiscScale, getIntroState } from '@/lib/introTimeline'
import {
  assignWordTargets,
  createMainAttributes,
  createRng,
  getParticleBudget,
} from '@/lib/particleData'
import { sampleText } from '@/lib/sampleText'
import type { SceneState } from './sceneState'
import fragmentShader from './shaders/particle.frag.glsl?raw'
import vertexShader from './shaders/main.vert.glsl?raw'

type MainParticlesProps = {
  sceneRef: RefObject<SceneState>
  isHome: boolean
  reducedMotion: boolean
}

const ATTRIBUTES_SEED = 20
const TARGETS_SEED = 21

function createGeometry(count: number) {
  const { aDisc, aBurst, aWord, aSeed, aSize } = createMainAttributes(
    count,
    createRng(ATTRIBUTES_SEED),
  )
  const geometry = new BufferGeometry()
  const disc = new BufferAttribute(aDisc, 3)
  // three déduit le nombre de points de `position`, que le shader n'utilise pas directement.
  geometry.setAttribute('position', disc)
  geometry.setAttribute('aDisc', disc)
  geometry.setAttribute('aBurst', new BufferAttribute(aBurst, 3))
  geometry.setAttribute('aWord', new BufferAttribute(aWord, 3))
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
      uPhase: { value: 0 },
      uProgress: { value: 0 },
      uDiscAngle: { value: 0 },
      uDiscScale: { value: 1 },
      uDiscRadius: { value: 1 },
      uExtent: { value: [1, 1] },
      uBurstDepth: { value: BURST_DEPTH },
      uTurbulence: { value: BURST_TURBULENCE },
      uStagger: { value: CONTRACT_STAGGER },
      uSpiral: { value: CONTRACT_SPIRAL_RAD },
      uPointScale: { value: 1 },
      uWordPointSize: { value: 1 },
      uWordOpacity: { value: 1 },
      uColorCool: { value: new Color(PARTICLE_COLOR_COOL) },
      uColorWarm: { value: new Color(PARTICLE_COLOR_WARM) },
    },
  })
}

export default function MainParticles({ sceneRef, isHome, reducedMotion }: MainParticlesProps) {
  const pointsRef = useRef<Points<BufferGeometry, ShaderMaterial>>(null)
  const introState = useRef(createIntroState())
  const size = useThree((state) => state.size)
  const dpr = useThree((state) => state.viewport.dpr)
  const invalidate = useThree((state) => state.invalidate)

  const [count] = useState(() => getParticleBudget(window.innerWidth).main)
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

    const { uniforms } = points.material
    const extentY = WORLD_HEIGHT / 2
    const extentX = (extentY * size.width) / size.height
    uniforms.uExtent.value = [extentX, extentY]
    uniforms.uDiscRadius.value = Math.min(
      WORLD_HEIGHT * DISC_RADIUS_RATIO_HEIGHT,
      extentX * DISC_RADIUS_RATIO_HALF_WIDTH,
    )
    uniforms.uPointScale.value = dpr * CAMERA_Z

    let cancelled = false
    const scene = sceneRef.current
    const timeout = setTimeout(
      async () => {
        const sample = await sampleText(INTRO_WORD, size.width, count)
        if (cancelled) return

        const unitsPerPx = WORLD_HEIGHT / size.height
        const attribute = points.geometry.getAttribute('aWord') as BufferAttribute
        assignWordTargets(
          attribute.array as Float32Array,
          sample.points,
          unitsPerPx,
          sample.stepPx * WORD_JITTER_RATIO,
          createRng(TARGETS_SEED),
        )
        attribute.needsUpdate = true

        uniforms.uWordPointSize.value = Math.max(
          WORD_POINT_SIZE_MIN_DEVICE_PX / dpr,
          sample.stepPx * WORD_POINT_SIZE_RATIO,
        )
        scene.wordHalfWidth = sample.halfWidthPx * unitsPerPx
        scene.wordHalfHeight = sample.halfHeightPx * unitsPerPx
        scene.wordReady = true
        invalidate()
      },
      scene.wordReady ? RESIZE_DEBOUNCE_MS : 0,
    )

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [count, dpr, invalidate, sceneRef, size])

  useEffect(() => {
    invalidate()
  }, [invalidate, isHome])

  useFrame((_, delta) => {
    const points = pointsRef.current
    const scene = sceneRef.current
    if (!points || !scene.wordReady) return

    const dt = Math.min(delta, MAX_FRAME_DELTA_S)
    const status = introStore.getStatus()

    // Le chronomètre attend une première image rendue, police chargée.
    if (status === 'loading' && scene.firstFrameRendered) {
      introStore.setStatus('playing')
    } else if (status === 'playing') {
      scene.elapsedMs += dt * 1000
      if (scene.elapsedMs >= INTRO_TOTAL_MS) introStore.setStatus('done')
    } else if (status === 'done') {
      scene.elapsedMs = INTRO_TOTAL_MS
    }
    scene.firstFrameRendered = true
    if (!reducedMotion) scene.timeS += dt

    const targetOpacity = isHome ? 1 : 0
    scene.wordOpacity = reducedMotion
      ? targetOpacity
      : scene.wordOpacity + (targetOpacity - scene.wordOpacity) * Math.min(1, dt * WORD_FADE_RATE)

    const state = getIntroState(scene.elapsedMs, introState.current)
    const { uniforms } = points.material
    uniforms.uTime.value = scene.timeS
    uniforms.uPhase.value = state.phase
    uniforms.uProgress.value = state.shaderProgress
    uniforms.uDiscAngle.value = getDiscAngle(scene.elapsedMs)
    uniforms.uDiscScale.value = getDiscScale(scene.elapsedMs)
    uniforms.uWordOpacity.value = scene.wordOpacity
    points.visible = state.phase < 4 || scene.wordOpacity > 0.001
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
