import Lenis from 'lenis'
import gsap from 'gsap'
import { registerGSAP } from '@/lib/gsap'

registerGSAP()

let instance: Lenis | null = null

export function getLenis(): Lenis {
  if (instance) return instance
  instance = new Lenis({ lerp: 0.08 })
  gsap.ticker.add((time: number) => {
    instance!.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)
  return instance
}
