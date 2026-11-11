import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT_DESKTOP = 3500
const COUNT_MOBILE = 800

// Chaque étoile dérive lentement vers le centre (gravitée permanente),
// s'estompe avant d'y arriver, et recommence depuis sa position d'origine.
const vert = /* glsl */ `
uniform float uTime;
attribute float aSeed;
varying float vOpacity;

void main() {
  // Cycle lent et continu par particule (vitesse variable)
  float speed = 0.012 + aSeed * 0.010;
  float t = fract(uTime * speed + aSeed);

  // Dérive de la position d'origine vers le centre, légèrement en spirale
  float r0 = length(position.xy);
  float r  = r0 * (1.0 - t * t); // ralentit en approchant
  float driftAngle = aSeed * 6.28318 + t * 0.6;
  float c = cos(driftAngle); float s = sin(driftAngle);
  vec2 dir0 = r0 > 0.001 ? normalize(position.xy) : vec2(1.0, 0.0);
  vec2 driftDir = vec2(c * dir0.x - s * dir0.y, s * dir0.x + c * dir0.y);
  vec3 pos = vec3(driftDir * r, position.z);

  // Fade in au début du cycle, fade out avant l'arrivée au centre
  float fadein  = smoothstep(0.0, 0.08, t);
  float fadeout = 1.0 - smoothstep(0.72, 1.0, t);
  float twinkle = 0.6 + 0.4 * sin(uTime * (0.3 + aSeed * 1.1) + aSeed * 6.28318);

  vOpacity = fadein * fadeout * twinkle * (0.06 + aSeed * 0.38);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 0.8 + aSeed * 1.6;
}
`

const frag = /* glsl */ `
varying float vOpacity;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  if (length(coord) * 2.0 > 1.0) discard;
  float alpha = smoothstep(1.0, 0.1, length(coord) * 2.0) * vOpacity;
  gl_FragColor = vec4(0.82, 0.90, 1.00, alpha);
}
`

function makePositions(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    arr[i * 3 + 0] = (Math.random() - 0.5) * 28
    arr[i * 3 + 1] = (Math.random() - 0.5) * 16
    arr[i * 3 + 2] = (Math.random() - 0.5) * 3
  }
  return arr
}

export default function BackgroundStars() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const count = isMobile ? COUNT_MOBILE : COUNT_DESKTOP

  const matRef = useRef<THREE.ShaderMaterial>(null!)

  const positions = useMemo(() => makePositions(count), [count])
  const seeds = useMemo(() => {
    const a = new Float32Array(count)
    for (let i = 0; i < count; i++) a[i] = Math.random()
    return a
  }, [count])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return g
  }, [positions, seeds])

  useFrame((_, delta) => {
    if (!matRef.current) return
    if (document.visibilityState === 'hidden') return
    matRef.current.uniforms.uTime.value += Math.min(delta, 0.1)
  })

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
