import { describe, it, expect } from 'vitest'
import { BURST_REACH, DUST_SHELL_MAX, DUST_SHELL_MIN, PARTICLE_BUDGET } from '@/config/intro'
import {
  assignWordTargets,
  createDustAttributes,
  createMainAttributes,
  createRng,
  getParticleBudget,
} from '@/lib/particleData'

describe('getParticleBudget', () => {
  it('picks the budget from the viewport width', () => {
    expect(getParticleBudget(375)).toBe(PARTICLE_BUDGET.mobile)
    expect(getParticleBudget(1280)).toBe(PARTICLE_BUDGET.desktop)
  })

  it('stays within the documented limits', () => {
    const { desktop, mobile } = PARTICLE_BUDGET
    expect(desktop.main + desktop.dust).toBeLessThanOrEqual(50000)
    expect(mobile.main + mobile.dust).toBeLessThanOrEqual(8000)
  })
})

describe('createRng', () => {
  it('is deterministic and stays in [0, 1)', () => {
    const first = createRng(1)
    const second = createRng(1)
    for (let i = 0; i < 100; i += 1) {
      const value = first()
      expect(value).toBe(second())
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('createMainAttributes', () => {
  const count = 500
  const attributes = createMainAttributes(count, createRng(2))

  it('sizes each attribute for the particle count', () => {
    expect(attributes.aDisc).toHaveLength(count * 3)
    expect(attributes.aBurst).toHaveLength(count * 3)
    expect(attributes.aWord).toHaveLength(count * 3)
    expect(attributes.aSeed).toHaveLength(count * 4)
    expect(attributes.aSize).toHaveLength(count)
  })

  it('keeps the disc within the unit circle and the burst within reach', () => {
    for (let i = 0; i < count; i += 1) {
      const discRadius = Math.hypot(attributes.aDisc[i * 3], attributes.aDisc[i * 3 + 1])
      const burstRadius = Math.hypot(attributes.aBurst[i * 3], attributes.aBurst[i * 3 + 1])
      expect(discRadius).toBeLessThanOrEqual(1 + 1e-6)
      expect(burstRadius).toBeLessThanOrEqual(BURST_REACH + 1e-6)
    }
  })
})

describe('createDustAttributes', () => {
  it('spawns particles inside the shell', () => {
    const count = 200
    const { aSpawn } = createDustAttributes(count, createRng(3))
    for (let i = 0; i < count; i += 1) {
      const radius = Math.hypot(aSpawn[i * 3], aSpawn[i * 3 + 1])
      expect(radius).toBeGreaterThanOrEqual(DUST_SHELL_MIN - 1e-6)
      expect(radius).toBeLessThanOrEqual(DUST_SHELL_MAX + 1e-6)
    }
  })
})

describe('assignWordTargets', () => {
  const points = new Float32Array([0, 0, 10, 0, 20, 0, 30, 0])

  it('covers every point when there are enough particles', () => {
    const out = new Float32Array(4 * 3)
    assignWordTargets(out, points, 1, 0, createRng(4))
    const targets = [out[0], out[3], out[6], out[9]].sort((a, b) => a - b)
    expect(targets).toEqual([0, 10, 20, 30])
  })

  it('does not follow the order of the letters', () => {
    const line = new Float32Array(200)
    for (let i = 0; i < 100; i += 1) line[i * 2] = i
    const out = new Float32Array(100 * 3)
    assignWordTargets(out, line, 1, 0, createRng(5))
    const inOrder = Array.from({ length: 100 }, (_, i) => out[i * 3]).every((x, i) => x === i)
    expect(inOrder).toBe(false)
  })

  it('reuses points when particles outnumber them', () => {
    const out = new Float32Array(10 * 3)
    assignWordTargets(out, points, 2, 0, createRng(6))
    for (let i = 0; i < 10; i += 1) expect([0, 20, 40, 60]).toContain(out[i * 3])
  })

  it('gives the same targets for the same seed', () => {
    const first = new Float32Array(4 * 3)
    const second = new Float32Array(4 * 3)
    assignWordTargets(first, points, 1, 1, createRng(7))
    assignWordTargets(second, points, 1, 1, createRng(7))
    expect(second).toEqual(first)
  })

  it('leaves targets untouched without any point', () => {
    const out = new Float32Array(3)
    assignWordTargets(out, new Float32Array(0), 1, 0, createRng(8))
    expect(Array.from(out)).toEqual([0, 0, 0])
  })
})
