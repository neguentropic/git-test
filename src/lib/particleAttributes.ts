/**
 * Builds GPU-ready particle geometry attributes for the main intro system.
 * Called once at module level — not inside React render.
 */
export function buildMainParticleAttributes(count: number) {
  const aDisc = new Float32Array(count * 3)
  const aBurst = new Float32Array(count * 3)
  const aWord = new Float32Array(count * 3)
  const aSeed = new Float32Array(count)
  const aSize = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * 0.25
    aDisc[i * 3] = Math.cos(angle) * r
    aDisc[i * 3 + 1] = Math.sin(angle) * r
    aDisc[i * 3 + 2] = (Math.random() - 0.5) * 0.02

    const bAngle = Math.random() * Math.PI * 2
    const bMag = 0.6 + Math.random() * 1.2
    const bZ = (Math.random() - 0.5) * 0.6
    aBurst[i * 3] = Math.cos(bAngle) * bMag
    aBurst[i * 3 + 1] = Math.sin(bAngle) * bMag
    aBurst[i * 3 + 2] = bZ

    aSeed[i] = Math.random()
    aSize[i] = 1.5 + Math.random() * 3
  }

  return { aDisc, aBurst, aWord, aSeed, aSize }
}

/**
 * Builds GPU-ready particle geometry attributes for the ambient dust system.
 */
export function buildDustParticleAttributes(count: number) {
  const aSeed = new Float32Array(count)
  const aOrigin = new Float32Array(count * 3)
  const aSize = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    aSeed[i] = Math.random()
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 1.1 + Math.random() * 0.4
    aOrigin[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    aOrigin[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    aOrigin[i * 3 + 2] = r * Math.cos(phi)
    aSize[i] = 1 + Math.random() * 2
  }

  return { aSeed, aOrigin, aSize }
}
