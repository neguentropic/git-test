import { describe, it, expect } from 'vitest'
import {
  getIntroState,
  smoothstep,
  expoOut,
  sineInOut,
} from '@/lib/introTimeline'
import {
  PHASE_DURATION,
  TOTAL_INTRO_MS,
} from '@/config/intro'

describe('getIntroState', () => {
  it('phase 0 at t=0', () => {
    const s = getIntroState(0)
    expect(s.phase).toBe(0)
    expect(s.progress).toBe(0)
    expect(s.complete).toBe(false)
  })

  it('phase 0 at mid-breathe', () => {
    const s = getIntroState(PHASE_DURATION.BREATHE / 2)
    expect(s.phase).toBe(0)
    expect(s.progress).toBeCloseTo(0.5, 5)
  })

  it('phase 1 at start of explosion', () => {
    const s = getIntroState(PHASE_DURATION.BREATHE + 1)
    expect(s.phase).toBe(1)
  })

  it('phase 2 at start of suspension', () => {
    const t = PHASE_DURATION.BREATHE + PHASE_DURATION.EXPLODE + 1
    const s = getIntroState(t)
    expect(s.phase).toBe(2)
  })

  it('phase 3 at start of contraction', () => {
    const t =
      PHASE_DURATION.BREATHE +
      PHASE_DURATION.EXPLODE +
      PHASE_DURATION.SUSPEND +
      1
    const s = getIntroState(t)
    expect(s.phase).toBe(3)
  })

  it('phase 4 after total duration', () => {
    const s = getIntroState(TOTAL_INTRO_MS + 1000)
    expect(s.phase).toBe(4)
    expect(s.complete).toBe(true)
  })

  it('progress is clamped [0, 1]', () => {
    for (let ms = 0; ms <= TOTAL_INTRO_MS + 500; ms += 250) {
      const s = getIntroState(ms)
      expect(s.progress).toBeGreaterThanOrEqual(0)
      expect(s.progress).toBeLessThanOrEqual(1)
    }
  })
})

describe('easing functions', () => {
  const cases: [string, (t: number) => number][] = [
    ['smoothstep', smoothstep],
    ['expoOut', expoOut],
    ['sineInOut', sineInOut],
  ]

  for (const [name, fn] of cases) {
    it(`${name}(0) = 0`, () => expect(fn(0)).toBeCloseTo(0, 5))
    it(`${name}(1) = 1`, () => expect(fn(1)).toBeCloseTo(1, 5))
    it(`${name} stays in [0,1]`, () => {
      for (let t = 0; t <= 1; t += 0.05) {
        expect(fn(t)).toBeGreaterThanOrEqual(0)
        expect(fn(t)).toBeLessThanOrEqual(1)
      }
    })
  }
})
