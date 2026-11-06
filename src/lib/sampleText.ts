import {
  MOBILE_BREAKPOINT_PX,
  WORD_ALPHA_THRESHOLD,
  WORD_FONT_FAMILY,
  WORD_FONT_WEIGHT,
  WORD_LETTER_SPACING_EM,
  WORD_SAMPLE_SCALE,
  WORD_WIDTH_RATIO_DESKTOP,
  WORD_WIDTH_RATIO_MOBILE,
} from '@/config/intro'

export type WordSample = {
  // Couples x, y en pixels CSS, centrés sur le mot, y vers le haut.
  points: Float32Array
  stepPx: number
  halfWidthPx: number
  halfHeightPx: number
}

export function getWordWidthRatio(viewportWidth: number): number {
  return viewportWidth < MOBILE_BREAKPOINT_PX ? WORD_WIDTH_RATIO_MOBILE : WORD_WIDTH_RATIO_DESKTOP
}

export function countOpaquePixels(data: Uint8ClampedArray, threshold: number): number {
  let count = 0
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] >= threshold) count += 1
  }
  return count
}

// Le pas vise un point de grille par particule : le mot reste plein quelle que soit sa taille.
export function computeGridStep(opaquePixels: number, targetCount: number): number {
  return Math.max(1, Math.sqrt(opaquePixels / targetCount))
}

export function sampleGrid(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  step: number,
  threshold: number,
): number[] {
  const coords: number[] = []
  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const alpha = data[(Math.floor(y) * width + Math.floor(x)) * 4 + 3]
      if (alpha >= threshold) coords.push(x, y)
    }
  }
  return coords
}

export function centerPoints(coords: number[], scale: number): Omit<WordSample, 'stepPx'> {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < coords.length; i += 2) {
    minX = Math.min(minX, coords[i])
    maxX = Math.max(maxX, coords[i])
    minY = Math.min(minY, coords[i + 1])
    maxY = Math.max(maxY, coords[i + 1])
  }

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const points = new Float32Array(coords.length)
  for (let i = 0; i < coords.length; i += 2) {
    points[i] = (coords[i] - centerX) / scale
    points[i + 1] = (centerY - coords[i + 1]) / scale
  }

  return {
    points,
    halfWidthPx: (maxX - minX) / 2 / scale,
    halfHeightPx: (maxY - minY) / 2 / scale,
  }
}

function applyFont(ctx: CanvasRenderingContext2D, fontSize: number) {
  ctx.font = `${WORD_FONT_WEIGHT} ${fontSize}px ${WORD_FONT_FAMILY}`
  ctx.letterSpacing = `${fontSize * WORD_LETTER_SPACING_EM}px`
}

export async function sampleText(
  text: string,
  viewportWidth: number,
  targetCount: number,
): Promise<WordSample> {
  await document.fonts.load(`${WORD_FONT_WEIGHT} 100px ${WORD_FONT_FAMILY}`)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('2D canvas unavailable')

  const label = text.toUpperCase()
  const referenceSize = 100
  applyFont(ctx, referenceSize)
  const targetWidth = viewportWidth * getWordWidthRatio(viewportWidth) * WORD_SAMPLE_SCALE
  const fontSize = (referenceSize * targetWidth) / ctx.measureText(label).width

  // Redimensionner le canvas réinitialise le contexte : la police est appliquée ensuite.
  canvas.width = Math.ceil(targetWidth * 1.05)
  canvas.height = Math.ceil(fontSize * 1.5)
  applyFont(ctx, fontSize)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText(label, canvas.width / 2, canvas.height / 2)

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const step = computeGridStep(countOpaquePixels(data, WORD_ALPHA_THRESHOLD), targetCount)
  const coords = sampleGrid(data, width, height, step, WORD_ALPHA_THRESHOLD)

  return { ...centerPoints(coords, WORD_SAMPLE_SCALE), stepPx: step / WORD_SAMPLE_SCALE }
}
