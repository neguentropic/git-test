import { useEffect, useRef } from 'react'

/**
 * Tracks scroll progress (0 → 1) for the full document height.
 * Does not cause re-renders — consumers should read the ref in RAF.
 */
export function useScrollProgress(): React.RefObject<number> {
  const ref = useRef<number>(0)

  useEffect(() => {
    function update() {
      const max =
        document.documentElement.scrollHeight - window.innerHeight
      ref.current = max > 0 ? window.scrollY / max : 0
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return ref
}
