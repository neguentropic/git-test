import { useState, useEffect } from 'react'
import { IntroPhase } from './introTimeline'
import type { IntroPhaseValue } from './introTimeline'

type Listener = (phase: IntroPhaseValue) => void
const listeners = new Set<Listener>()
let currentPhase: IntroPhaseValue = IntroPhase.Disc

export function setIntroPhase(phase: IntroPhaseValue): void {
  currentPhase = phase
  listeners.forEach((l) => l(phase))
}

export function useIntroPhase(): IntroPhaseValue {
  const [phase, setPhase] = useState<IntroPhaseValue>(currentPhase)
  useEffect(() => {
    listeners.add(setPhase)
    return () => {
      listeners.delete(setPhase)
    }
  }, [])
  return phase
}
