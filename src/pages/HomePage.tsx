import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useIntroPhase } from '@/lib/introState'
import { IntroPhase } from '@/lib/introTimeline'

export default function HomePage() {
  const phase = useIntroPhase()
  const introComplete = phase >= IntroPhase.SloganReveal

  return (
    <>
      <h1 className="sr-only">Neguentropia</h1>

      <motion.div
        className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <motion.p
          className="mb-24 max-w-xl text-center text-[--color-text-muted]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : -8 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
        >
          Moins de désordre, plus de valeur
        </motion.p>

        <div style={{ height: '5rem' }} />

        <motion.div
          className="pointer-events-auto mt-24"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: introComplete ? 1 : 0, y: introComplete ? 0 : 12 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        >
          <Link
            to="/contact"
            className="rounded border border-[--color-accent]/40 px-8 py-3 font-['Orbitron'] text-sm uppercase tracking-widest text-[--color-accent] transition-all duration-300 hover:bg-[--color-accent]/10"
          >
            Nous contacter
          </Link>
        </motion.div>
      </motion.div>
    </>
  )
}
