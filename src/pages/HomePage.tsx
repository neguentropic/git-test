import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useIntroStatus } from '@/hooks/useIntroStatus'

export default function HomePage() {
  const status = useIntroStatus()
  const isFallback = status === 'fallback'
  const revealed = status === 'done' || isFallback

  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] flex-col items-center justify-end px-8 pb-[10vh] text-center">
      {/* Le mot visible est dessiné par les particules ; ce h1 ne s'affiche que sans WebGL. */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className={
          isFallback
            ? 'absolute inset-0 grid place-items-center font-display text-[clamp(1.75rem,7vw,6rem)] font-black uppercase tracking-[0.15em] text-text'
            : 'sr-only'
        }
      >
        Neguentropia
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        className="relative mb-8 max-w-xl text-text-muted"
      >
        L&apos;ordre émerge du chaos. Découvrez un univers rétro-futuriste où chaque particule
        raconte une histoire.
      </motion.p>

      <motion.div
        inert={!revealed}
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ delay: revealed ? 0.4 : 0, duration: 0.8, ease: 'easeInOut' }}
        className="relative"
      >
        <Link
          to="/contact"
          className="rounded border border-accent/40 px-8 py-3 font-display text-sm uppercase tracking-widest text-accent transition-all duration-300 hover:bg-accent/10"
        >
          Nous contacter
        </Link>
      </motion.div>
    </section>
  )
}
