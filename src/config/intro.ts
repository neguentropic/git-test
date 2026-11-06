export const INTRO_WORD = 'Neguentropia'

export const INTRO_HOLD_MS = 1000
export const INTRO_BURST_MS = 2500
export const INTRO_SUSPEND_MS = 400
export const INTRO_CONTRACT_MS = 3500
export const INTRO_TOTAL_MS = INTRO_HOLD_MS + INTRO_BURST_MS + INTRO_SUSPEND_MS + INTRO_CONTRACT_MS

export const INTRO_LOAD_TIMEOUT_MS = 10000
export const MAX_FRAME_DELTA_S = 0.05
export const RESIZE_DEBOUNCE_MS = 200
export const WORD_FADE_RATE = 3

export const WORLD_HEIGHT = 10
export const CAMERA_FOV = 50
export const CAMERA_Z = WORLD_HEIGHT / 2 / Math.tan((CAMERA_FOV * Math.PI) / 360)

export const MOBILE_BREAKPOINT_PX = 768
export const PARTICLE_BUDGET = {
  desktop: { main: 30000, dust: 4000 },
  mobile: { main: 6000, dust: 800 },
} as const

export const DISC_ROTATION_DEG_PER_S = 12
export const DISC_BREATH_AMPLITUDE = 0.035
export const DISC_BREATH_PERIOD_MS = 5000
export const DISC_RADIUS_RATIO_HEIGHT = 0.16
export const DISC_RADIUS_RATIO_HALF_WIDTH = 0.7
export const DISC_RIM_SHARE = 0.18

export const BURST_EXPO_STRENGTH = 10
export const BURST_REACH = 1.2
export const BURST_DEPTH = 4
export const BURST_TURBULENCE = 0.35

export const CONTRACT_STAGGER = 0.3
export const CONTRACT_SPIRAL_RAD = 1.1

export const WORD_FONT_WEIGHT = 800
export const WORD_FONT_FAMILY = 'Orbitron'
export const WORD_LETTER_SPACING_EM = 0.06
export const WORD_WIDTH_RATIO_DESKTOP = 0.7
export const WORD_WIDTH_RATIO_MOBILE = 0.88
export const WORD_SAMPLE_SCALE = 2
export const WORD_ALPHA_THRESHOLD = 128
export const WORD_DEPTH_NOISE = 0.12
export const WORD_POINT_SIZE_RATIO = 1.35
export const WORD_POINT_SIZE_MIN_DEVICE_PX = 1.9
export const WORD_JITTER_RATIO = 0.6

export const DUST_FADE_START_MS = INTRO_HOLD_MS + INTRO_BURST_MS + INTRO_SUSPEND_MS + 1500
export const DUST_FADE_MS = 2000
export const DUST_PERIOD_S = 14
export const DUST_SHELL_MIN = 0.75
export const DUST_SHELL_MAX = 1.3
export const DUST_DEPTH = 3
export const DUST_SPIRAL_RAD = 0.9

export const PARTICLE_COLOR_COOL = '#dfe6ff'
export const PARTICLE_COLOR_WARM = '#fff1df'
