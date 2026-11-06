import { useSyncExternalStore } from 'react'
import { introStore, type IntroStatus } from '@/lib/introStore'

export function useIntroStatus(): IntroStatus {
  return useSyncExternalStore(introStore.subscribe, introStore.getStatus)
}
