varying vec3 vColor;
varying float vAlpha;

void main() {
  float distanceToCenter = length(gl_PointCoord - 0.5);
  float softness = smoothstep(0.5, 0.15, distanceToCenter);
  gl_FragColor = vec4(vColor, softness * vAlpha);
}
