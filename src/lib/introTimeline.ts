/**
 * Pure, testable timeline logic for the intro sequence.
 * Returns the current phase (0-4) and progress [0,1] within that phase
 * given the elapsed time in milliseconds.
 */

import {
  PHASE_DURATION,
  TOTAL_INTRO_MS,
} from '@/config/intro'

export type IntroPhase = 0 | 1 | 2 | 3 | 4

export interface IntroState {
  phase: IntroPhase
  /** Normalised progress within the current phase [0, 1] */
  progress: number
  /** Total elapsed time clamped to [0, TOTAL_INTRO_MS] */
  elapsed: number
  /** True once the word is fully formed (phase 4) */
  complete: boolean
}

const PHASES: { phase: IntroPhase; duration: number }[] = [
  { phase: 0, duration: PHASE_DURATION.BREATHE },
  { phase: 1, duration: PHASE_DURATION.EXPLODE },
  { phase: 2, duration: PHASE_DURATION.SUSPEND },
  { phase: 3, duration: PHASE_DURATION.CONTRACT },
]

/** Clamp a value between min and max. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/**
 * Compute the intro state from raw elapsed milliseconds.
 * This is a pure function — safe to call in Vitest.
 */
export function getIntroState(elapsedMs: number): IntroState {
  const elapsed = clamp(elapsedMs, 0, TOTAL_INTRO_MS)

  let cursor = 0
  for (const { phase, duration } of PHASES) {
    if (elapsed < cursor + duration) {
      const progress = clamp((elapsed - cursor) / duration, 0, 1)
      return { phase, progress, elapsed, complete: false }
    }
    cursor += duration
  }

  // Phase 4 — word formed, runs indefinitely
  return { phase: 4, progress: 1, elapsed, complete: true }
}

/** Smooth-step easing (3t²-2t³) used for contracts. */
export function smoothstep(t: number): number {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

/** Expo-out easing used for the explosion. */
export function expoOut(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t, 0, 1))
}

/** Sine-based ease-in-out used for breathing / contraction. */
export function sineInOut(t: number): number {
  return -(Math.cos(Math.PI * clamp(t, 0, 1)) - 1) / 2
}
