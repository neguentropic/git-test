// Vertex shader for the main particle system (§20 architecture).
// Attributes per particle:
//   aDisc   — position on the breathing disc (phase 0)
//   aBurst  — direction + speed for the explosion (phase 1)
//   aWord   — target position forming "Neguentropia" (phase 3)
//   aSeed   — random seed [0,1] for staggered timing
//   aSize   — base point size

// Uniforms:
//   uTime        — elapsed seconds (capped delta, continuous)
//   uPhase       — current phase (0–4 float)
//   uProgress    — normalised progress within phase [0,1]
//   uBreath      — breathing scale factor (phase 0)
//   uAspect      — viewport aspect ratio (width/height)

uniform float uTime;
uniform float uPhase;
uniform float uProgress;
uniform float uBreath;
uniform float uAspect;

attribute vec3 aDisc;
attribute vec3 aBurst;
attribute vec3 aWord;
attribute float aSeed;
attribute float aSize;

varying float vAlpha;
varying float vSeed;

// Smooth-step
float ss(float t) {
  return t * t * (3.0 - 2.0 * t);
}

// Expo-out
float expoOut(float t) {
  return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
}

// Sine ease-in-out
float sineInOut(float t) {
  return -(cos(3.14159265 * t) - 1.0) / 2.0;
}

void main() {
  vec3 pos = aDisc;
  float alpha = 1.0;

  if (uPhase < 1.0) {
    // Phase 0: breathing disc
    float scale = 1.0 + uBreath;
    pos = aDisc * scale;

  } else if (uPhase < 2.0) {
    // Phase 1: explosion
    float t = expoOut(uProgress);
    // stagger: each particle starts slightly later based on seed
    float stagger = clamp((uProgress - aSeed * 0.3) / 0.7, 0.0, 1.0);
    float te = expoOut(stagger);
    pos = mix(aDisc, aDisc + aBurst, te);

  } else if (uPhase < 3.0) {
    // Phase 2: suspension — particles at burst end position
    pos = aDisc + aBurst;

  } else if (uPhase < 4.0) {
    // Phase 3: contraction toward word targets
    float stagger = clamp((uProgress - aSeed * 0.25) / 0.75, 0.0, 1.0);
    float tc = sineInOut(stagger);
    vec3 burstPos = aDisc + aBurst;
    // Slight spiral: rotate around z by seed * 0.4 rad
    float angle = aSeed * 0.4 * (1.0 - tc);
    float c = cos(angle);
    float s = sin(angle);
    vec3 spiralled = vec3(
      burstPos.x * c - burstPos.y * s,
      burstPos.x * s + burstPos.y * c,
      burstPos.z
    );
    pos = mix(spiralled, aWord, tc);

  } else {
    // Phase 4: word formed, gentle shimmer
    pos = aWord;
    // Subtle shimmer: tiny oscillation per particle
    pos.x += sin(uTime * 1.3 + aSeed * 6.28) * 0.0008;
    pos.y += cos(uTime * 1.1 + aSeed * 6.28) * 0.0008;
  }

  // Scintillation on size
  float shimmer = 0.85 + 0.15 * sin(uTime * 2.0 + aSeed * 12.566);
  float pointSize = aSize * shimmer;

  // Fade in/out during explosion
  if (uPhase >= 1.0 && uPhase < 2.0) {
    alpha = 0.6 + 0.4 * expoOut(uProgress);
  }

  vAlpha = alpha;
  vSeed = aSeed;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = pointSize * (300.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
