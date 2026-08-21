import { NavLink } from 'react-router-dom'

const itens = [
  { to: '/', label: 'Início', fim: true },
  { to: '/exames', label: 'Exames' },
  { to: '/remedios', label: 'Remédios' },
  { to: '/familia', label: 'Família' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-line flex px-1.5 pt-2.5 pb-4 z-20">
      {itens.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.fim}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 text-xs font-bold py-1.5 ${
              isActive ? 'text-teal-700' : 'text-ink-soft'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
