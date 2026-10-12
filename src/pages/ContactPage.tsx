import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'

type FormState = 'idle' | 'success'

export default function ContactPage() {
  const [state, setState] = useState<FormState>('idle')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Placeholder : pas d'endpoint défini pour l'instant
    setState('success')
  }

  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-8 py-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-10 font-['Orbitron'] text-3xl font-bold uppercase tracking-widest text-[--color-text]"
      >
        Contact
      </motion.h1>

      {state === 'success' ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[--color-accent]"
        >
          Message envoyé. Merci.
        </motion.p>
      ) : (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg flex-col gap-6"
          aria-label="Formulaire de contact"
        >
          <label className="flex flex-col gap-2 text-sm text-[--color-text-muted]">
            Nom
            <input
              type="text"
              name="name"
              required
              className="rounded border border-white/10 bg-[--color-bg-elevated] px-4 py-3 text-[--color-text] outline-none transition-colors focus:border-[--color-accent]/60"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[--color-text-muted]">
            E-mail
            <input
              type="email"
              name="email"
              required
              className="rounded border border-white/10 bg-[--color-bg-elevated] px-4 py-3 text-[--color-text] outline-none transition-colors focus:border-[--color-accent]/60"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[--color-text-muted]">
            Message
            <textarea
              name="message"
              rows={5}
              required
              className="rounded border border-white/10 bg-[--color-bg-elevated] px-4 py-3 text-[--color-text] outline-none transition-colors focus:border-[--color-accent]/60 resize-none"
            />
          </label>

          <button
            type="submit"
            className="self-end rounded border border-[--color-accent]/40 px-8 py-3 font-['Orbitron'] text-sm uppercase tracking-widest text-[--color-accent] transition-all duration-300 hover:bg-[--color-accent]/10"
          >
            Envoyer
          </button>
        </motion.form>
      )}
    </section>
  )
}
