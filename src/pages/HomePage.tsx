import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-8 py-24 text-center">
      {/* Visually hidden h1 for SEO — visible text rendered via animation placeholder */}
      <h1 className="sr-only">Neguentropia</h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-4 font-['Orbitron'] text-[clamp(2.5rem,8vw,7rem)] font-black uppercase tracking-[0.15em] text-[--color-accent]"
        aria-hidden="true"
      >
        Neguentropia
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mb-12 max-w-xl text-[--color-text-muted]"
      >
        L&apos;ordre émerge du chaos. Découvrez un univers rétro-futuriste où chaque particule
        raconte une histoire.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <Link
          to="/contact"
          className="rounded border border-[--color-accent]/40 px-8 py-3 font-['Orbitron'] text-sm uppercase tracking-widest text-[--color-accent] transition-all duration-300 hover:bg-[--color-accent]/10"
        >
          Nous contacter
        </Link>
      </motion.div>
    </section>
  )
}
