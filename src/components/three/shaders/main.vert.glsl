uniform float uTime;
uniform float uPhase;
uniform float uProgress;
uniform float uDiscAngle;
uniform float uDiscScale;
uniform float uDiscRadius;
uniform vec2 uExtent;
uniform float uBurstDepth;
uniform float uTurbulence;
uniform float uStagger;
uniform float uSpiral;
uniform float uPointScale;
uniform float uWordPointSize;
uniform float uWordOpacity;
uniform vec3 uColorCool;
uniform vec3 uColorWarm;

attribute vec3 aDisc;
attribute vec3 aBurst;
attribute vec3 aWord;
attribute vec4 aSeed;
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;

const float TAU = 6.2831853;

mat2 rotation(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, s, -s, c);
}

float easeInOutCubic(float x) {
  return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
}

// Rotationnel d'un potentiel analytique : champ sans divergence, la poussière tourbillonne sans s'agglutiner.
vec2 curl(vec2 p, float t) {
  float a = p.x * 0.7 + t * 0.3;
  float b = p.y * 0.9 - t * 0.2;
  float c = p.x * 1.3 + p.y * 1.7 + t * 0.4;
  float dx = 0.7 * cos(a) * cos(b) + 0.65 * cos(c);
  float dy = -0.9 * sin(a) * sin(b) + 0.85 * cos(c);
  return vec2(dy, -dx);
}

// Le disque est sombre : le blending additif ne peut pas assombrir, sa présence vient du liseré asymétrique.
float discBrightness() {
  float radius = length(aDisc.xy);
  float rim = smoothstep(0.955, 0.995, radius);
  float angle = atan(aDisc.y, aDisc.x);
  float asymmetry = pow(0.5 + 0.5 * cos(angle - 1.1), 3.0);
  float grain = 0.5 + 0.5 * sin(angle * 3.0 + radius * 9.0);
  return mix(0.012 + 0.05 * grain, 0.1 + 0.8 * asymmetry, rim);
}

void main() {
  float burstT = 0.0;
  if (uPhase > 1.5) {
    burstT = 1.0;
  } else if (uPhase > 0.5) {
    burstT = pow(uProgress, 0.7 + 0.6 * aSeed.x);
  }

  float wordT = 0.0;
  if (uPhase > 3.5) {
    wordT = 1.0;
  } else if (uPhase > 2.5) {
    float local = clamp((uProgress - aSeed.y * uStagger) / (1.0 - uStagger), 0.0, 1.0);
    wordT = easeInOutCubic(local);
  }

  vec3 disc = vec3(rotation(uDiscAngle) * aDisc.xy * uDiscRadius * uDiscScale, aDisc.z);
  vec3 burst = vec3(aBurst.xy * uExtent, aBurst.z * uBurstDepth);
  vec3 cloud = mix(disc, burst, burstT);
  cloud.xy += curl(burst.xy + aSeed.zw * 6.0, uTime) * uTurbulence * burstT;

  vec3 position3 = mix(cloud, aWord, wordT);
  float spiral = sin(wordT * 3.1415926) * uSpiral * (0.6 + 0.8 * aSeed.y);
  position3.xy = rotation(spiral) * position3.xy;

  vec4 viewPosition = modelViewMatrix * vec4(position3, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  float twinkle = 0.82 + 0.18 * sin(uTime * (1.2 + aSeed.z * 2.0) + aSeed.z * TAU);
  float dustBrightness = (0.25 + 0.75 * aSeed.x * aSeed.x) * twinkle;
  float wordBrightness = (0.72 + 0.2 * aSeed.x) * twinkle * (1.0 + 0.05 * sin(uTime * 0.9));
  float brightness = mix(discBrightness(), dustBrightness, smoothstep(0.0, 0.25, burstT));
  brightness = mix(brightness, wordBrightness * uWordOpacity, wordT);

  float wordSize = uWordPointSize * (0.85 + 0.3 * aSeed.x);
  float size = mix(aSize, wordSize, wordT);
  gl_PointSize = max(1.0, size * uPointScale / -viewPosition.z);

  vColor = mix(uColorCool, uColorWarm, aSeed.w);
  vAlpha = brightness;
}
