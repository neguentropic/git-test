import { Canvas } from '@react-three/fiber'
import { Suspense, lazy, useEffect, useRef } from 'react'
import useReducedMotion from '@/hooks/useReducedMotion'
import { useIntroPhase } from '@/lib/introState'
import { IntroPhase } from '@/lib/introTimeline'
import { getLenis } from '@/lib/lenis'

const MainParticles = lazy(() => import('./MainParticles'))
const AmbientDust = lazy(() => import('./AmbientDust'))
const BackgroundStars = lazy(() => import('./BackgroundStars'))

export default function IntroScene() {
  const reduced = useReducedMotion()
  const phase = useIntroPhase()
  const skippedRef = useRef(false)

  useEffect(() => {
    const lenis = getLenis()
    if (phase < IntroPhase.SloganReveal) {
      lenis.stop()
    } else {
      lenis.start()
    }
  }, [phase])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        skippedRef.current = true
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleSkipClick = () => {
    skippedRef.current = true
  }

  const showSkip = phase > IntroPhase.Disc && phase < IntroPhase.SloganReveal

  return (
    <>
      <Canvas
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        camera={{ fov: 75, near: 0.01, far: 100, position: [0, 0, 5] }}
        gl={{ alpha: true, antialias: false }}
        dpr={[1, 2]}
        aria-hidden
      >
        <Suspense fallback={null}>
          <BackgroundStars />
          <MainParticles reduced={reduced} skippedRef={skippedRef} />
          <AmbientDust />
        </Suspense>
      </Canvas>

      {showSkip && (
        <button
          onClick={handleSkipClick}
          className="fixed bottom-6 right-6 z-20 rounded border border-white/10 px-4 py-2 font-['Orbitron'] text-xs uppercase tracking-widest text-[--color-text-muted] transition-opacity duration-500 hover:border-[--color-accent]/30 hover:text-[--color-text]"
          aria-label="Passer l'introduction"
        >
          Passer
        </button>
      )}
    </>
  )
}
