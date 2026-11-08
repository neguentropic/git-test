import { useEffect, useState } from 'react'
import { MOBILE_BREAKPOINT_PX } from '@/config/intro'

/** Returns true when the viewport is narrower than the mobile breakpoint. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.innerWidth < MOBILE_BREAKPOINT_PX,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}
