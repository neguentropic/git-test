// Centralised constants for the intro sequence (§20).
// All timings in milliseconds, all counts are max values for desktop.

export const INTRO_HOLD_MS = 1000 // Phase 0: breathing circle hold

// Phase durations (ms)
export const PHASE_DURATION = {
  BREATHE: INTRO_HOLD_MS,
  EXPLODE: 2500,
  SUSPEND: 400,
  CONTRACT: 3500,
} as const

export const TOTAL_INTRO_MS =
  PHASE_DURATION.BREATHE +
  PHASE_DURATION.EXPLODE +
  PHASE_DURATION.SUSPEND +
  PHASE_DURATION.CONTRACT

// Particle budgets
export const PARTICLES = {
  DESKTOP_MAIN: 30_000,
  DESKTOP_DUST: 4_000,
  MOBILE_MAIN: 6_000,
  MOBILE_DUST: 800,
} as const

// Circle breathing
export const BREATH_SCALE_RANGE = 0.035 // ±3.5%
export const BREATH_PERIOD_MS = 5_000 // sinusoidal period
export const CIRCLE_ROTATION_DEG_PER_S = 12

// Text
export const INTRO_WORD = 'Neguentropia'
export const TEXT_FONT_WEIGHT = '800'
export const TEXT_FONT_FAMILY = 'Orbitron'
export const TEXT_VIEWPORT_RATIO_DESKTOP = 0.7
export const TEXT_VIEWPORT_RATIO_MOBILE = 0.88
export const MOBILE_BREAKPOINT_PX = 768

// Easings (string names for use in comments / GSAP if needed)
export const EASING = {
  EXPLODE: 'expo.out',
  CONTRACT: 'easeInOut',
} as const

// Delta cap (ms) to prevent animation jumps on tab focus restore
export const MAX_DELTA_MS = 100
