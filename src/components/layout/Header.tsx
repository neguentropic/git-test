import { NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/contact', label: 'Contact' },
] as const

export default function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-6 sm:px-8">
      <NavLink
        to="/"
        className="font-display text-sm font-black uppercase tracking-widest text-accent sm:text-lg"
      >
        Neguentropia
      </NavLink>
      <nav aria-label="Navigation principale">
        <ul className="flex gap-4 sm:gap-8">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  [
                    'text-xs uppercase tracking-widest transition-colors duration-300 sm:text-sm',
                    isActive
                      ? 'text-accent'
                      : 'text-text-muted hover:text-text',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
