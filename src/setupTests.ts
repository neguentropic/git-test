import '@testing-library/jest-dom'

// jsdom n'implémente ni matchMedia ni les contextes canvas. Le mouvement réduit évite aussi Lenis.
window.matchMedia = (query: string) =>
  ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }) as unknown as MediaQueryList

HTMLCanvasElement.prototype.getContext = () => null
