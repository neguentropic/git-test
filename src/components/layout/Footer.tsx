export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative z-20 border-t border-[var(--color-bg-elevated)] px-6 py-8 text-center text-xs text-[var(--color-text-muted)] md:px-12">
      <p>© {year} Neguentropia. Tous droits réservés.</p>
    </footer>
  )
}
