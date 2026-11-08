// Fragment shader — round soft discs with additive blending.
// §19: particles are off-white with slight warm/cold tint variation.

varying float vAlpha;
varying float vSeed;

void main() {
  // Distance from centre of point sprite
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);

  // Soft disc (smooth edge)
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
  if (alpha < 0.01) discard;

  // Slight warm/cold tint per particle
  float warm = step(0.5, fract(vSeed * 7.3));
  vec3 warmTint  = vec3(1.0, 0.97, 0.92);
  vec3 coldTint  = vec3(0.92, 0.95, 1.0);
  vec3 tint = mix(coldTint, warmTint, warm);

  gl_FragColor = vec4(tint, alpha * vAlpha);
}
