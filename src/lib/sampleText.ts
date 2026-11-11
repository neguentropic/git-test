import {
  WORD_WIDTH_FRACTION_DESKTOP,
  WORD_WIDTH_FRACTION_MOBILE,
  CAMERA_FOV,
  CAMERA_Z,
} from '@/config/intro'

export async function sampleText(
  text: string,
  count: number,
  viewportWidth: number,
  viewportHeight: number,
): Promise<Float32Array> {
  await document.fonts.load('800 100px Orbitron')

  const isMobile = viewportWidth < 768
  const widthFraction = isMobile ? WORD_WIDTH_FRACTION_MOBILE : WORD_WIDTH_FRACTION_DESKTOP

  const worldWidth = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_Z
  const worldHeight = worldWidth * (viewportHeight / viewportWidth)

  const cw = 1200
  const ch = Math.round(cw * (viewportHeight / viewportWidth))

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!

  let fontSize = 100
  ctx.font = `800 ${fontSize}px Orbitron`
  const measured = ctx.measureText(text)
  fontSize = Math.floor((fontSize * cw * widthFraction) / measured.width)

  ctx.clearRect(0, 0, cw, ch)
  ctx.font = `800 ${fontSize}px Orbitron`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cw / 2, ch / 2)

  const { data } = ctx.getImageData(0, 0, cw, ch)

  const opaque: Array<[number, number]> = []
  for (let y = 0; y < ch; y += 2) {
    for (let x = 0; x < cw; x += 2) {
      if (data[(y * cw + x) * 4 + 3] > 100) {
        opaque.push([x, y])
      }
    }
  }

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    if (opaque.length === 0) break
    const [px, py] = opaque[Math.floor(Math.random() * opaque.length)]
    positions[i * 3 + 0] = (px / cw - 0.5) * worldWidth
    positions[i * 3 + 1] = -(py / ch - 0.5) * worldHeight
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1
  }

  return positions
}
