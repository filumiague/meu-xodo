import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RotaProtegida({ children }: { children: ReactNode }) {
  const { session, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-cream text-ink-soft">
        Carregando...
      </div>
    )
  }

  if (!session) return <Navigate to="/entrar" replace />

  return <>{children}</>
}
