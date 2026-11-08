/**
 * Lenis singleton — creates one smooth-scroll instance,
 * wires it to GSAP's ticker and ScrollTrigger.
 *
 * Call initLenis() once at app startup.
 * Call destroyLenis() on unmount (SSR / testing).
 */
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

let instance: Lenis | null = null

export function initLenis(reducedMotion: boolean): Lenis | null {
  if (reducedMotion) return null
  if (instance) return instance

  instance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  })

  // Sync Lenis scroll position with ScrollTrigger
  instance.on('scroll', ScrollTrigger.update)

  // Drive Lenis from GSAP's RAF
  gsap.ticker.add((time) => {
    instance?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return instance
}

export function getLenis(): Lenis | null {
  return instance
}

export function destroyLenis(): void {
  if (instance) {
    instance.destroy()
    instance = null
  }
}
