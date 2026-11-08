import { useEffect, useState } from 'react'

/**
 * Returns true when the user prefers reduced motion.
 * Also updates reactively if the OS preference changes at runtime.
 */
export function useReducedMotion(): boolean {
  const mq =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null

  const [prefersReduced, setPrefersReduced] = useState(
    () => mq?.matches ?? false,
  )

  useEffect(() => {
    if (!mq) return
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mq])

  return prefersReduced
}
