import {
  INTRO_HOLD_MS,
  INTRO_IMPLOSION_MS,
  INTRO_WORD_FORMATION_MS,
  INTRO_SLOGAN_DELAY_MS,
} from '@/config/intro'

// Phase 0 : Respiration  — champ d'étoiles + trou noir respirant
// Phase 1 : Implosion    — les étoiles sont aspirées par le trou noir
// Phase 2 : Formation    — particules forment le mot depuis le centre
// Phase 3 : Poussière    — le mot attire la poussière cosmique
// Phase 4 : Slogan       — slogan + bouton apparaissent, scroll activé
export const IntroPhase = {
  Disc: 0,
  Implosion: 1,
  WordFormation: 2,
  DustAttraction: 3,
  SloganReveal: 4,
} as const

export type IntroPhaseValue = (typeof IntroPhase)[keyof typeof IntroPhase]

export interface IntroState {
  phase: IntroPhaseValue
  progress: number
}

export function getIntroState(elapsedMs: number): IntroState {
  if (elapsedMs < INTRO_HOLD_MS)
    return { phase: IntroPhase.Disc, progress: elapsedMs / INTRO_HOLD_MS }

  let t = elapsedMs - INTRO_HOLD_MS
  if (t < INTRO_IMPLOSION_MS)
    return { phase: IntroPhase.Implosion, progress: t / INTRO_IMPLOSION_MS }

  t -= INTRO_IMPLOSION_MS
  if (t < INTRO_WORD_FORMATION_MS)
    return { phase: IntroPhase.WordFormation, progress: t / INTRO_WORD_FORMATION_MS }

  t -= INTRO_WORD_FORMATION_MS
  if (t < INTRO_SLOGAN_DELAY_MS)
    return { phase: IntroPhase.DustAttraction, progress: t / INTRO_SLOGAN_DELAY_MS }

  return { phase: IntroPhase.SloganReveal, progress: 1 }
}

export function easeExpoOut(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function easeExpoIn(t: number): number {
  return t <= 0 ? 0 : Math.pow(2, 10 * t - 10)
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
