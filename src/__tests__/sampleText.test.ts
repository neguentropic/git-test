import { describe, it, expect } from 'vitest'
import {
  centerPoints,
  computeGridStep,
  countOpaquePixels,
  getWordWidthRatio,
  sampleGrid,
} from '@/lib/sampleText'

function createMask(width: number, height: number, isOpaque: (x: number, y: number) => boolean) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      data[(y * width + x) * 4 + 3] = isOpaque(x, y) ? 255 : 0
    }
  }
  return data
}

describe('getWordWidthRatio', () => {
  it('is wider on mobile than on desktop', () => {
    expect(getWordWidthRatio(375)).toBe(0.88)
    expect(getWordWidthRatio(1280)).toBe(0.7)
  })
})

describe('countOpaquePixels', () => {
  it('counts pixels at or above the alpha threshold', () => {
    expect(
      countOpaquePixels(
        createMask(4, 4, (x) => x < 2),
        128,
      ),
    ).toBe(8)
  })
})

describe('computeGridStep', () => {
  it('yields about one grid point per particle', () => {
    expect(computeGridStep(40000, 10000)).toBe(2)
  })

  it('never goes below one pixel', () => {
    expect(computeGridStep(100, 10000)).toBe(1)
  })
})

describe('sampleGrid', () => {
  it('keeps only opaque pixels', () => {
    const coords = sampleGrid(
      createMask(10, 10, (x) => x < 5),
      10,
      10,
      1,
      128,
    )
    expect(coords).toHaveLength(50 * 2)
    for (let i = 0; i < coords.length; i += 2) expect(coords[i]).toBeLessThan(5)
  })

  it('takes fewer points with a larger step', () => {
    const data = createMask(20, 20, () => true)
    expect(sampleGrid(data, 20, 20, 2, 128)).toHaveLength(100 * 2)
  })
})

describe('centerPoints', () => {
  it('centers on the bounding box, flips y and converts to CSS pixels', () => {
    const { points, halfWidthPx, halfHeightPx } = centerPoints([0, 0, 8, 4], 2)
    expect(Array.from(points)).toEqual([-2, 1, 2, -1])
    expect(halfWidthPx).toBe(2)
    expect(halfHeightPx).toBe(1)
  })
})
