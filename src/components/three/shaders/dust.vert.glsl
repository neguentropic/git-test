// Ambient dust vertex shader — phase 4 floating particles.
// Each particle has a random seed that drives its unique orbit.

uniform float uTime;
uniform float uVisible; // 0 → 1 fade-in

attribute float aSeed;
attribute vec3 aOrigin; // birth position on a shell around origin
attribute float aSize;

varying float vAlpha;

void main() {
  // Each particle completes one loop in a unique period
  float period = 6.0 + aSeed * 4.0; // 6s to 10s
  float t = mod(uTime * (1.0 / period) + aSeed, 1.0);

  // Spiral inward from shell toward origin
  float r = mix(1.2, 0.0, t * t); // ease in
  float angle = aSeed * 6.28318 + uTime * (0.3 + aSeed * 0.2);
  vec3 pos = vec3(
    aOrigin.x * r + cos(angle) * r * 0.1,
    aOrigin.y * r + sin(angle) * r * 0.1,
    aOrigin.z * r
  );

  // Fade out as it approaches the word
  float fade = 1.0 - smoothstep(0.1, 0.0, r);
  vAlpha = fade * uVisible * (0.5 + 0.5 * sin(uTime * 1.5 + aSeed * 6.28));

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (200.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
