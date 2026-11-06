import { describe, it, expect } from 'vitest'
import { clamp01, easeInOutCubic, expoOut } from '@/lib/easing'

describe('clamp01', () => {
  it('bounds values between 0 and 1', () => {
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(2)).toBe(1)
  })
})

describe('easeInOutCubic', () => {
  it('starts at 0, ends at 1 and is symmetric around the middle', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1)
  })

  it('clamps out-of-range input', () => {
    expect(easeInOutCubic(-1)).toBe(0)
    expect(easeInOutCubic(2)).toBe(1)
  })
})

describe('expoOut', () => {
  it('reaches exactly 0 and 1 at the bounds', () => {
    expect(expoOut(0)).toBe(0)
    expect(expoOut(1)).toBe(1)
  })

  it('moves fast at first, then slows down', () => {
    expect(expoOut(0.1) - expoOut(0)).toBeGreaterThan(expoOut(1) - expoOut(0.9))
    expect(expoOut(0.3)).toBeGreaterThan(0.8)
  })
})
