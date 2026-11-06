import {
  BURST_EXPO_STRENGTH,
  DISC_BREATH_AMPLITUDE,
  DISC_BREATH_PERIOD_MS,
  DISC_ROTATION_DEG_PER_S,
  DUST_FADE_MS,
  DUST_FADE_START_MS,
  INTRO_BURST_MS,
  INTRO_CONTRACT_MS,
  INTRO_HOLD_MS,
  INTRO_SUSPEND_MS,
} from '@/config/intro'
import { clamp01, easeInOutCubic, expoOut } from '@/lib/easing'

export type IntroPhase = 0 | 1 | 2 | 3 | 4

export type IntroState = {
  phase: IntroPhase
  progress: number
  // Phase 3 reste linéaire : le shader applique l'easing par particule, après le décalage de départ.
  shaderProgress: number
}

const BURST_END_MS = INTRO_HOLD_MS + INTRO_BURST_MS
const SUSPEND_END_MS = BURST_END_MS + INTRO_SUSPEND_MS
const CONTRACT_END_MS = SUSPEND_END_MS + INTRO_CONTRACT_MS

export function createIntroState(): IntroState {
  return { phase: 0, progress: 0, shaderProgress: 0 }
}

// Écrit dans `out` : cette fonction est appelée à chaque frame et ne doit rien allouer.
export function getIntroState(elapsedMs: number, out: IntroState = createIntroState()): IntroState {
  if (elapsedMs < INTRO_HOLD_MS) {
    out.phase = 0
    out.progress = clamp01(elapsedMs / INTRO_HOLD_MS)
    out.shaderProgress = out.progress
  } else if (elapsedMs < BURST_END_MS) {
    out.phase = 1
    out.progress = (elapsedMs - INTRO_HOLD_MS) / INTRO_BURST_MS
    out.shaderProgress = expoOut(out.progress, BURST_EXPO_STRENGTH)
  } else if (elapsedMs < SUSPEND_END_MS) {
    out.phase = 2
    out.progress = (elapsedMs - BURST_END_MS) / INTRO_SUSPEND_MS
    out.shaderProgress = out.progress
  } else if (elapsedMs < CONTRACT_END_MS) {
    out.phase = 3
    out.progress = (elapsedMs - SUSPEND_END_MS) / INTRO_CONTRACT_MS
    out.shaderProgress = out.progress
  } else {
    out.phase = 4
    out.progress = 1
    out.shaderProgress = 1
  }
  return out
}

export function getDiscAngle(elapsedMs: number): number {
  return (elapsedMs / 1000) * DISC_ROTATION_DEG_PER_S * (Math.PI / 180)
}

export function getDiscScale(elapsedMs: number): number {
  return 1 + DISC_BREATH_AMPLITUDE * Math.sin((elapsedMs / DISC_BREATH_PERIOD_MS) * Math.PI * 2)
}

export function getDustOpacity(elapsedMs: number): number {
  return easeInOutCubic((elapsedMs - DUST_FADE_START_MS) / DUST_FADE_MS)
}
