import { NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/contact', label: 'Contact' },
] as const

export default function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between px-8 py-6">
      <NavLink
        to="/"
        className="font-['Orbitron'] text-lg font-black uppercase tracking-widest text-[--color-accent]"
      >
        Neguentropia
      </NavLink>
      <nav aria-label="Navigation principale">
        <ul className="flex gap-8">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  [
                    'text-sm uppercase tracking-widest transition-colors duration-300',
                    isActive
                      ? 'text-[--color-accent]'
                      : 'text-[--color-text-muted] hover:text-[--color-text]',
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
