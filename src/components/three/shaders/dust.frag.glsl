varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(0.88, 0.92, 1.0, alpha * vAlpha * 0.6);
}
