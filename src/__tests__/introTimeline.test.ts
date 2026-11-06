import { describe, it, expect } from 'vitest'
import {
  DISC_BREATH_AMPLITUDE,
  DISC_BREATH_PERIOD_MS,
  DUST_FADE_MS,
  DUST_FADE_START_MS,
  INTRO_BURST_MS,
  INTRO_CONTRACT_MS,
  INTRO_HOLD_MS,
  INTRO_SUSPEND_MS,
  INTRO_TOTAL_MS,
} from '@/config/intro'
import {
  createIntroState,
  getDiscAngle,
  getDiscScale,
  getDustOpacity,
  getIntroState,
} from '@/lib/introTimeline'

const burstStart = INTRO_HOLD_MS
const suspendStart = burstStart + INTRO_BURST_MS
const contractStart = suspendStart + INTRO_SUSPEND_MS

describe('getIntroState', () => {
  it.each([
    [0, 0],
    [INTRO_HOLD_MS - 1, 0],
    [burstStart, 1],
    [suspendStart - 1, 1],
    [suspendStart, 2],
    [contractStart, 3],
    [INTRO_TOTAL_MS - 1, 3],
    [INTRO_TOTAL_MS, 4],
    [INTRO_TOTAL_MS * 10, 4],
  ])('at %i ms is in phase %i', (elapsedMs, phase) => {
    expect(getIntroState(elapsedMs).phase).toBe(phase)
  })

  it('reports linear progress within a phase', () => {
    expect(getIntroState(burstStart + INTRO_BURST_MS / 2).progress).toBeCloseTo(0.5)
    expect(getIntroState(contractStart + INTRO_CONTRACT_MS / 4).progress).toBeCloseTo(0.25)
  })

  it('applies expo.out to the burst only', () => {
    const burst = getIntroState(burstStart + INTRO_BURST_MS / 2)
    expect(burst.shaderProgress).toBeGreaterThan(burst.progress)

    const contraction = getIntroState(contractStart + INTRO_CONTRACT_MS / 2)
    expect(contraction.shaderProgress).toBe(contraction.progress)
  })

  it('reuses the provided state object', () => {
    const out = createIntroState()
    expect(getIntroState(burstStart, out)).toBe(out)
  })

  it('forms the word within the 7 to 9 second target', () => {
    expect(INTRO_TOTAL_MS).toBeGreaterThanOrEqual(7000)
    expect(INTRO_TOTAL_MS).toBeLessThanOrEqual(9000)
  })
})

describe('disc motion', () => {
  it('rotates between 10 and 15 degrees per second', () => {
    const degrees = (getDiscAngle(1000) * 180) / Math.PI
    expect(degrees).toBeGreaterThanOrEqual(10)
    expect(degrees).toBeLessThanOrEqual(15)
  })

  it('breathes around 1 within the configured amplitude', () => {
    expect(getDiscScale(0)).toBe(1)
    expect(getDiscScale(DISC_BREATH_PERIOD_MS / 4)).toBeCloseTo(1 + DISC_BREATH_AMPLITUDE)
    expect(getDiscScale((DISC_BREATH_PERIOD_MS * 3) / 4)).toBeCloseTo(1 - DISC_BREATH_AMPLITUDE)
  })
})

describe('getDustOpacity', () => {
  it('fades in once, then stays at full opacity', () => {
    expect(getDustOpacity(0)).toBe(0)
    expect(getDustOpacity(DUST_FADE_START_MS)).toBe(0)
    expect(getDustOpacity(DUST_FADE_START_MS + DUST_FADE_MS / 2)).toBeCloseTo(0.5)
    expect(getDustOpacity(DUST_FADE_START_MS + DUST_FADE_MS)).toBe(1)
  })
})
