uniform float uTime;
uniform float uPeriod;
uniform float uOpacity;
uniform float uSpiral;
uniform float uPointScale;
uniform vec2 uExtent;
uniform vec2 uWordHalf;
uniform vec3 uColorCool;
uniform vec3 uColorWarm;

attribute vec3 aSpawn;
attribute vec4 aSeed;
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;

void main() {
  float period = uPeriod * (0.7 + 0.6 * aSeed.y);
  float life = fract(uTime / period + aSeed.x);
  float pull = life * life;

  vec3 spawn = vec3(aSpawn.xy * uExtent, aSpawn.z);
  vec3 target = vec3(aSeed.zw * uWordHalf, 0.0);
  vec3 position3 = mix(spawn, target, pull);

  float angle = (1.0 - pull) * uSpiral;
  float s = sin(angle);
  float c = cos(angle);
  position3.xy = mat2(c, s, -s, c) * position3.xy;

  vec4 viewPosition = modelViewMatrix * vec4(position3, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = max(1.0, aSize * uPointScale / -viewPosition.z);

  float fade = smoothstep(0.0, 0.2, life) * (1.0 - smoothstep(0.72, 0.96, life));
  vColor = mix(uColorCool, uColorWarm, aSeed.y);
  vAlpha = fade * uOpacity * (0.2 + 0.45 * aSeed.x);
}
