/**
 * sampleText — renders INTRO_WORD into an offscreen canvas and returns
 * a Float32Array of [x, y, z] triplets in NDC-like space.
 *
 * Usage:
 *   const positions = await sampleText(width, height, particleCount)
 */

import {
  INTRO_WORD,
  TEXT_FONT_WEIGHT,
  TEXT_FONT_FAMILY,
  TEXT_VIEWPORT_RATIO_DESKTOP,
  TEXT_VIEWPORT_RATIO_MOBILE,
  MOBILE_BREAKPOINT_PX,
} from '@/config/intro'

function getFontSize(viewportWidth: number): number {
  const ratio =
    viewportWidth < MOBILE_BREAKPOINT_PX
      ? TEXT_VIEWPORT_RATIO_MOBILE
      : TEXT_VIEWPORT_RATIO_DESKTOP

  // Measure at a large size, then scale
  const probe = 200
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  ctx.font = `${TEXT_FONT_WEIGHT} ${probe}px ${TEXT_FONT_FAMILY}`
  const measured = ctx.measureText(INTRO_WORD).width
  return (probe * viewportWidth * ratio) / measured
}

export async function sampleText(
  viewportWidth: number,
  viewportHeight: number,
  particleCount: number,
): Promise<Float32Array> {
  // Wait for the font to be ready
  await document.fonts.load(
    `${TEXT_FONT_WEIGHT} 100px ${TEXT_FONT_FAMILY}`,
  )

  const fontSize = getFontSize(viewportWidth)

  // Off-screen canvas sized to the text
  const canvas = document.createElement('canvas')
  canvas.width = viewportWidth
  canvas.height = viewportHeight

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.font = `${TEXT_FONT_WEIGHT} ${fontSize}px ${TEXT_FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(INTRO_WORD, viewportWidth / 2, viewportHeight / 2)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data, width, height } = imageData

  // Collect opaque pixel coords
  const opaque: [number, number][] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > 128) {
        opaque.push([x, y])
      }
    }
  }

  // Sample `particleCount` random pixels from the opaque set
  const result = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const idx = Math.floor(Math.random() * opaque.length)
    const [px, py] = opaque[idx]

    // Convert pixel coords to NDC [-1, 1]
    const nx = (px / width) * 2 - 1
    const ny = -((py / height) * 2 - 1) // flip Y
    const nz = (Math.random() - 0.5) * 0.05 // slight Z depth

    result[i * 3] = nx
    result[i * 3 + 1] = ny
    result[i * 3 + 2] = nz
  }

  return result
}
