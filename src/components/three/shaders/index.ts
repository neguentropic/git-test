// Phases: 0=Disc, 1=Implosion, 2=WordFormation, 3=DustAttraction, 4=SloganReveal
export const mainVert = /* glsl */ `
uniform float uTime;
uniform float uPhase;
uniform float uProgress;
uniform float uDPR;

attribute vec3 aDisc;
attribute vec3 aBurst;
attribute vec3 aWord;
attribute float aSeed;
attribute float aSize;

varying float vOpacity;
varying float vSeed;

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0)*0.5;
}

vec3 curlNoise(vec3 p) {
  return vec3(
    sin(p.y*2.4 + p.z*1.3) * cos(p.z*2.1 - p.y*0.8),
    sin(p.z*1.7 + p.x*2.2) * cos(p.x*1.5 - p.z*1.9),
    sin(p.x*2.3 + p.y*1.6) * cos(p.y*2.0 - p.x*1.4)
  );
}

void main() {
  vSeed = aSeed;

  float discR = length(aDisc.xy);

  // Anneau/halo : particules dont discR < 2.4 restent TOUJOURS sur l'anneau
  // (anneau centré à r ≈ 2.0, demi-hauteur visible ≈ 3.84 → ≈ moitié de la page)
  float isRingParticle = 1.0 - step(2.4, discR);

  // --- Anneau : respiration et rotation permanentes (toutes phases) ---
  float breathe = 1.0 + sin(uTime * 1.25664) * 0.035;
  float rot = uTime * 0.20944;
  float cosR = cos(rot); float sinR = sin(rot);
  vec2 rotXY = vec2(aDisc.x*cosR - aDisc.y*sinR, aDisc.x*sinR + aDisc.y*cosR);
  float isRingZone = smoothstep(1.6, 1.85, discR);
  vec3 ringPos = vec3(
    mix(aDisc.x, rotXY.x, isRingZone),
    mix(aDisc.y, rotXY.y, isRingZone),
    aDisc.z
  ) * mix(1.0, breathe, isRingZone);

  // Opacité anneau/halo permanente
  float ringFactor  = smoothstep(1.75, 2.0, discR) * (1.0 - smoothstep(2.0, 2.3, discR));
  float innerFactor = 1.0 - smoothstep(0.1, 1.5, discR);
  float hotAngle    = atan(ringPos.y, ringPos.x);
  float asymmetry   = 0.4 + 0.6 * pow(0.5 + 0.5 * sin(hotAngle + 0.9), 2.0);
  float ringOp      = ringFactor  * (0.18 + aSeed * 0.22) * asymmetry;
  float innerOp     = innerFactor * 0.012;
  float ringParticleOp = max(ringOp, innerOp);

  // --- Étoiles : aspiration continue via courbe de Bézier aDisc → aBurst → aWord ---
  vec3 starPos = aDisc;
  float starOp = smoothstep(2.3, 3.5, discR) * (0.05 + aSeed * 0.09);

  if (uPhase >= 0.5 && uPhase < 2.5) {
    float t;
    float rawArrival = 0.0;

    if (uPhase < 1.5) {
      // Phase 1 : mouvement linéaire, lent et constant (0.0 → 0.5)
      t = uProgress * 0.5;
    } else {
      // Phase 2 : formation du mot (0.5 → 1.0), délai organique par particule
      float delay = aSeed * 0.28;
      rawArrival = clamp((uProgress - delay) / (1.0 - delay), 0.0, 1.0);
      t = 0.5 + easeInOutCubic(rawArrival) * 0.5;
    }

    // Bézier quadratique : continuité parfaite entre phases 1 et 2
    float u = 1.0 - t;
    starPos = u * u * aDisc + 2.0 * u * t * aBurst + t * t * aWord;

    // Légère dérive cosmique douce
    vec3 drift = curlNoise(aDisc * 0.3 + vec3(aSeed * 1.5, aSeed * 0.9, aSeed * 2.1));
    starPos += drift * 0.04 * sin(t * 3.14159);

    if (uPhase < 1.5) {
      // Étoiles restent visibles pendant l'aspiration, s'estompent légèrement
      starOp = smoothstep(2.3, 3.5, discR) * (0.05 + aSeed * 0.09) * (1.0 - uProgress * 0.4);
    } else {
      // Fade in progressif à l'arrivée sur le mot
      starOp = easeInOutCubic(rawArrival) * (0.65 + 0.35 * aSeed);
    }

  } else if (uPhase >= 2.5) {
    // Phases 3 & 4 : scintillement sur le mot formé
    float tw = sin(uTime * (1.0 + aSeed * 1.5) + aSeed * 6.28318) * 0.003;
    starPos = aWord + vec3(tw, tw * 0.5, 0.0);
    starOp = 0.55 + 0.45 * (0.5 + 0.5 * sin(uTime * (0.5 + aSeed) + aSeed * 6.28318));
  }

  // --- Combinaison : anneau toujours en avant, étoiles selon phase ---
  vec3 pos    = mix(starPos, ringPos, isRingParticle);
  vOpacity    = mix(starOp, ringParticleOp, isRingParticle);

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  float sz = aSize * uDPR;
  if (uPhase >= 2.5) {
    sz *= 0.82 + 0.18 * sin(uTime * 2.5 + aSeed * 12.566);
  }
  gl_PointSize = sz;
}
`

export const mainFrag = /* glsl */ `
varying float vOpacity;
varying float vSeed;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float d = length(coord) * 2.0;
  if (d > 1.0) discard;

  float alpha = smoothstep(1.0, 0.25, d) * vOpacity;

  float h = fract(vSeed * 7.123);
  vec3 cold = vec3(0.80, 0.88, 1.00);
  vec3 warm = vec3(1.00, 0.92, 0.80);
  gl_FragColor = vec4(mix(cold, warm, h * 0.4), alpha);
}
`

export const dustVert = /* glsl */ `
uniform float uTime;
uniform float uPhase;

attribute vec3 aOrigin;
attribute float aSeed;
attribute float aPhaseOff;

varying float vOpacity;

void main() {
  float active = step(3.0, uPhase);
  float speed = 0.06 + aSeed * 0.05;
  float t = fract(uTime * speed + aPhaseOff);
  float easedT = t * t * (3.0 - 2.0 * t);
  vec3 pos = mix(aOrigin, vec3(0.0), easedT);

  float fadein  = smoothstep(0.0, 0.15, t);
  float fadeout = 1.0 - smoothstep(0.75, 1.0, t);
  vOpacity = fadein * fadeout * active * 0.30;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;
  gl_PointSize = 1.0 + aSeed * 1.5;
}
`

export const dustFrag = /* glsl */ `
varying float vOpacity;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float d = length(coord) * 2.0;
  if (d > 1.0) discard;
  float alpha = smoothstep(1.0, 0.0, d) * vOpacity;
  gl_FragColor = vec4(0.56, 0.66, 1.0, alpha);
}
`
