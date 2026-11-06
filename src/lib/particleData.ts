import {
  BURST_REACH,
  DISC_RIM_SHARE,
  DUST_DEPTH,
  DUST_SHELL_MAX,
  DUST_SHELL_MIN,
  MOBILE_BREAKPOINT_PX,
  PARTICLE_BUDGET,
  WORD_DEPTH_NOISE,
} from '@/config/intro'

export type Rng = () => number

export type MainAttributes = {
  aDisc: Float32Array
  aBurst: Float32Array
  aWord: Float32Array
  aSeed: Float32Array
  aSize: Float32Array
}

export type DustAttributes = {
  aSpawn: Float32Array
  aSeed: Float32Array
  aSize: Float32Array
}

export function getParticleBudget(viewportWidth: number) {
  return viewportWidth < MOBILE_BREAKPOINT_PX ? PARTICLE_BUDGET.mobile : PARTICLE_BUDGET.desktop
}

// Générateur déterministe (mulberry32) : un redimensionnement garde la même cible à chaque particule.
export function createRng(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createMainAttributes(count: number, rng: Rng): MainAttributes {
  const aDisc = new Float32Array(count * 3)
  const aBurst = new Float32Array(count * 3)
  const aWord = new Float32Array(count * 3)
  const aSeed = new Float32Array(count * 4)
  const aSize = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    const discAngle = rng() * Math.PI * 2
    const discRadius = rng() < DISC_RIM_SHARE ? 0.97 + rng() * 0.03 : Math.sqrt(rng()) * 0.97
    aDisc[i * 3] = Math.cos(discAngle) * discRadius
    aDisc[i * 3 + 1] = Math.sin(discAngle) * discRadius
    aDisc[i * 3 + 2] = (rng() - 0.5) * 0.05

    const burstAngle = rng() * Math.PI * 2
    const burstRadius = Math.sqrt(rng()) * BURST_REACH
    aBurst[i * 3] = Math.cos(burstAngle) * burstRadius
    aBurst[i * 3 + 1] = Math.sin(burstAngle) * burstRadius
    aBurst[i * 3 + 2] = rng() * 2 - 1

    aSeed[i * 4] = rng()
    aSeed[i * 4 + 1] = rng()
    aSeed[i * 4 + 2] = rng()
    aSeed[i * 4 + 3] = rng()

    aSize[i] = 0.7 + 2 * rng() ** 3
  }

  return { aDisc, aBurst, aWord, aSeed, aSize }
}

export function createDustAttributes(count: number, rng: Rng): DustAttributes {
  const aSpawn = new Float32Array(count * 3)
  const aSeed = new Float32Array(count * 4)
  const aSize = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    const angle = rng() * Math.PI * 2
    const radius = DUST_SHELL_MIN + rng() * (DUST_SHELL_MAX - DUST_SHELL_MIN)
    aSpawn[i * 3] = Math.cos(angle) * radius
    aSpawn[i * 3 + 1] = Math.sin(angle) * radius
    aSpawn[i * 3 + 2] = (rng() * 2 - 1) * DUST_DEPTH

    aSeed[i * 4] = rng()
    aSeed[i * 4 + 1] = rng()
    aSeed[i * 4 + 2] = rng() * 2 - 1
    aSeed[i * 4 + 3] = rng() * 2 - 1

    aSize[i] = 0.8 + 1.6 * rng() ** 2
  }

  return { aSpawn, aSeed, aSize }
}

function shuffledIndices(length: number, rng: Rng): Uint32Array {
  const indices = new Uint32Array(length)
  for (let i = 0; i < length; i += 1) indices[i] = i
  for (let i = length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const swap = indices[i]
    indices[i] = indices[j]
    indices[j] = swap
  }
  return indices
}

// Cibles tirées au hasard, pas dans l'ordre des lettres : la contraction reste organique.
export function assignWordTargets(
  out: Float32Array,
  points: Float32Array,
  unitsPerPx: number,
  jitterPx: number,
  rng: Rng,
) {
  const pointCount = points.length / 2
  if (pointCount === 0) return

  const order = shuffledIndices(pointCount, rng)
  const particleCount = out.length / 3
  for (let i = 0; i < particleCount; i += 1) {
    const point = order[i % pointCount]
    out[i * 3] = (points[point * 2] + (rng() - 0.5) * jitterPx) * unitsPerPx
    out[i * 3 + 1] = (points[point * 2 + 1] + (rng() - 0.5) * jitterPx) * unitsPerPx
    out[i * 3 + 2] = (rng() - 0.5) * 2 * WORD_DEPTH_NOISE
  }
}
