import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
      <NavLink
        to="/"
        className="font-['Orbitron'] text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] transition-opacity hover:opacity-80"
        aria-label="Neguentropia — retour à l'accueil"
      >
        Neguentropia
      </NavLink>

      <nav aria-label="Navigation principale">
        <ul className="flex gap-8 text-sm uppercase tracking-widest text-[var(--color-text-muted)] list-none m-0 p-0">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? 'text-[var(--color-text)]'
                  : 'hover:text-[var(--color-text)] transition-colors'
              }
            >
              Accueil
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? 'text-[var(--color-text)]'
                  : 'hover:text-[var(--color-text)] transition-colors'
              }
            >
              Contact
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}
