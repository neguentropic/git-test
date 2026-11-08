/**
 * HomePage — Hero plein écran + sections placeholder (§1, §20).
 * Le canvas R3F est monté dans Layout, partagé par toute l'app.
 */
export default function HomePage() {
  return (
    <>
      {/* ── Hero section ──────────────────────────────────────────── */}
      <section
        className="relative flex min-h-screen items-center justify-center"
        aria-label="Introduction"
      >
        {/*
         * The canvas animation draws "Neguentropia" in WebGL.
         * The h1 is visually hidden during the animation (sr-only),
         * then becomes visible via CSS once phase 4 begins.
         * This ensures the h1 is always in the HTML for SEO/a11y (§11, §12).
         */}
        <h1 className="sr-only">Neguentropia</h1>

        {/* Scroll hint — appears after intro */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-text-muted)] text-xs uppercase tracking-[0.3em] opacity-50"
          aria-hidden="true"
        >
          <span>Scroll</span>
          <span className="block h-8 w-px bg-[var(--color-text-muted)]" />
        </div>
      </section>

      {/* ── Placeholder sections (content TBD) ───────────────────── */}
      <section
        className="relative min-h-screen px-6 py-24 md:px-12"
        aria-label="Section à définir"
      >
       Moins de désordre, plus de valeur
      </motion.p>

      <section
        className="relative min-h-screen px-6 py-24 md:px-12"
        aria-label="Section à définir"
      >
        <p className="text-center text-[var(--color-text-muted)] text-sm uppercase tracking-widest">
          [Contenu à définir]
        </p>
      </section>
    </>
  )
}
