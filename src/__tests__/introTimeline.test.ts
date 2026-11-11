import { describe, it, expect } from 'vitest'
import {
  getIntroState,
  IntroPhase,
  easeExpoOut,
  easeInOutCubic,
} from '@/lib/introTimeline'
import {
  INTRO_HOLD_MS,
  INTRO_IMPLOSION_MS,
  INTRO_WORD_FORMATION_MS,
  INTRO_SLOGAN_DELAY_MS,
} from '@/config/intro'

describe('getIntroState', () => {
  it('returns Disc phase at t=0', () => {
    const s = getIntroState(0)
    expect(s.phase).toBe(IntroPhase.Disc)
    expect(s.progress).toBe(0)
  })

  it('returns Disc phase mid-hold', () => {
    const s = getIntroState(INTRO_HOLD_MS / 2)
    expect(s.phase).toBe(IntroPhase.Disc)
    expect(s.progress).toBeCloseTo(0.5)
  })

  it('transitions to Implosion after hold', () => {
    const s = getIntroState(INTRO_HOLD_MS + 1)
    expect(s.phase).toBe(IntroPhase.Implosion)
  })

  it('transitions to WordFormation after implosion', () => {
    const s = getIntroState(INTRO_HOLD_MS + INTRO_IMPLOSION_MS + 1)
    expect(s.phase).toBe(IntroPhase.WordFormation)
  })

  it('transitions to DustAttraction after word formation', () => {
    const s = getIntroState(INTRO_HOLD_MS + INTRO_IMPLOSION_MS + INTRO_WORD_FORMATION_MS + 1)
    expect(s.phase).toBe(IntroPhase.DustAttraction)
  })

  it('returns SloganReveal after full sequence', () => {
    const s = getIntroState(
      INTRO_HOLD_MS + INTRO_IMPLOSION_MS + INTRO_WORD_FORMATION_MS + INTRO_SLOGAN_DELAY_MS + 100,
    )
    expect(s.phase).toBe(IntroPhase.SloganReveal)
    expect(s.progress).toBe(1)
  })
})

describe('easing functions', () => {
  it('easeExpoOut(0) === 0', () => expect(easeExpoOut(0)).toBe(0))
  it('easeExpoOut(1) === 1', () => expect(easeExpoOut(1)).toBe(1))
  it('easeExpoOut is fast at start', () => {
    expect(easeExpoOut(0.1)).toBeGreaterThan(0.4)
  })
  it('easeInOutCubic(0) === 0', () => expect(easeInOutCubic(0)).toBe(0))
  it('easeInOutCubic(1) === 1', () => expect(easeInOutCubic(1)).toBe(1))
  it('easeInOutCubic(0.5) === 0.5', () => expect(easeInOutCubic(0.5)).toBeCloseTo(0.5))
})
