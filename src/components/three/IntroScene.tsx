import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { CAMERA_FOV, CAMERA_Z } from '@/config/intro'
import { useDocumentVisible } from '@/hooks/useDocumentVisible'
import AmbientDust from './AmbientDust'
import MainParticles from './MainParticles'
import { createSceneState, type SceneState } from './sceneState'

export type IntroSceneProps = {
  isHome: boolean
  reducedMotion: boolean
}

function getFrameloop(visible: boolean, reducedMotion: boolean) {
  if (!visible) return 'never'
  return reducedMotion ? 'demand' : 'always'
}

export default function IntroScene({ isHome, reducedMotion }: IntroSceneProps) {
  const visible = useDocumentVisible()
  const sceneRef = useRef<SceneState>(createSceneState(isHome ? 1 : 0))

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-1">
      <Canvas
        dpr={[1, 2]}
        frameloop={getFrameloop(visible, reducedMotion)}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z] }}
      >
        <MainParticles sceneRef={sceneRef} isHome={isHome} reducedMotion={reducedMotion} />
        <AmbientDust sceneRef={sceneRef} />
      </Canvas>
    </div>
  )
}
