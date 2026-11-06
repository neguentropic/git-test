export type IntroStatus = 'loading' | 'playing' | 'done' | 'fallback'

let status: IntroStatus = 'loading'
const listeners = new Set<() => void>()

// Store externe : la boucle de rendu signale les rares changements d'état sans re-render par frame.
export const introStore = {
  getStatus: () => status,
  setStatus(next: IntroStatus) {
    if (next === status) return
    status = next
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
