import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

let lenis: Lenis | null = null

function tick(timeS: number) {
  lenis?.raf(timeS * 1000)
}

export function startLenis(): () => void {
  lenis = new Lenis()
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
}
