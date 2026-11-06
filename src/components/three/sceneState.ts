// Valeurs partagées entre les systèmes de particules, lues et écrites hors du cycle de rendu React.
export type SceneState = {
  elapsedMs: number
  timeS: number
  wordReady: boolean
  firstFrameRendered: boolean
  wordOpacity: number
  wordHalfWidth: number
  wordHalfHeight: number
}

export function createSceneState(wordOpacity: number): SceneState {
  return {
    elapsedMs: 0,
    timeS: 0,
    wordReady: false,
    firstFrameRendered: false,
    wordOpacity,
    wordHalfWidth: 0,
    wordHalfHeight: 0,
  }
}
