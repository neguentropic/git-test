import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import type { IntroSceneProps } from '@/components/three/IntroScene'
import { INTRO_LOAD_TIMEOUT_MS } from '@/config/intro'
import { useIntroStatus } from '@/hooks/useIntroStatus'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { introStore } from '@/lib/introStore'
import { isWebGLAvailable } from '@/lib/webgl'

type IntroStageProps = {
  isHome: boolean
}

const IntroScene = lazy<ComponentType<IntroSceneProps>>(() =>
  import('@/components/three/IntroScene').catch(() => {
    introStore.setStatus('fallback')
    return { default: () => null }
  }),
)

function skipIntro() {
  introStore.setStatus('done')
}

export default function IntroStage({ isHome }: IntroStageProps) {
  const status = useIntroStatus()
  const reducedMotion = useReducedMotion()
  const [webglAvailable] = useState(isWebGLAvailable)

  useEffect(() => {
    const current = introStore.getStatus()
    if (current === 'done' || current === 'fallback') return

    if (!webglAvailable) introStore.setStatus('fallback')
    else if (reducedMotion || !isHome) introStore.setStatus('done')
  }, [isHome, reducedMotion, webglAvailable])

  useEffect(() => {
    if (status !== 'loading') return

    // Sans ce filet, un échec de la scène laisserait le site verrouillé sur l'écran de chargement.
    const timeout = setTimeout(() => introStore.setStatus('fallback'), INTRO_LOAD_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [status])

  useEffect(() => {
    if (status !== 'playing') return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' || event.key === 'Enter') skipIntro()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('pointerdown', skipIntro)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('pointerdown', skipIntro)
    }
  }, [status])

  return (
    <>
      {webglAvailable && status !== 'fallback' && (
        <Suspense fallback={null}>
          <IntroScene isHome={isHome} reducedMotion={reducedMotion} />
        </Suspense>
      )}
      {status === 'loading' && <div aria-hidden="true" className="intro-circle" />}
      {status === 'playing' && (
        <button
          type="button"
          onClick={skipIntro}
          className="fixed bottom-6 right-6 z-30 text-xs uppercase tracking-widest text-text-muted transition-colors duration-300 hover:text-text"
        >
          Passer l&apos;intro
        </button>
      )}
    </>
  )
}
