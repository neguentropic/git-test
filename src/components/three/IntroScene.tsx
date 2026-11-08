import { Suspense, lazy, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { IntroPhase } from '@/lib/introTimeline'

const MainParticles = lazy(
  () => import('@/components/three/MainParticles'),
)
const AmbientDust = lazy(
  () => import('@/components/three/AmbientDust'),
)

type Props = {
  skipToEnd?: boolean
}

export default function IntroScene({ skipToEnd = false }: Props) {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const [phase, setPhase] = useState<IntroPhase>(0)

  const handlePhaseChange = useCallback((p: IntroPhase) => {
    setPhase(p)
  }, [])

  const dustVisible = phase >= 3

  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 2], fov: 60 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
      gl={{ antialias: false }}
    >
      <Suspense fallback={null}>
        <MainParticles
          isMobile={isMobile}
          reducedMotion={reducedMotion}
          onPhaseChange={handlePhaseChange}
          skipToEnd={skipToEnd}
        />
        <AmbientDust isMobile={isMobile} visible={dustVisible} />
      </Suspense>
    </Canvas>
  )
}
