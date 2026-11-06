import { useEffect } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { setScrollLocked, startLenis } from '@/lib/lenis'

export function useSmoothScroll(locked: boolean) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    return startLenis()
  }, [reducedMotion])

  useEffect(() => {
    setScrollLocked(locked)
  }, [locked, reducedMotion])
}
