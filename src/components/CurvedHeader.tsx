import type { ReactNode } from 'react'
import { useAcessibilidade } from '../hooks/useAcessibilidade'

interface CurvedHeaderProps {
  titulo: string
  subtitulo?: string
  children?: ReactNode
  mostrarLogo?: boolean
  fotoUrl?: string | null
}

export function CurvedHeader({ titulo, subtitulo, children, mostrarLogo, fotoUrl }: CurvedHeaderProps) {
  const { escala, aumentar, diminuir } = useAcessibilidade()

  return (
    <div className="relative bg-teal-600 text-white px-6 pt-11 pb-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute left-0 right-0 -bottom-px h-9 bg-cream"
        style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          {mostrarLogo ? (
            <img src="/logo-meu-xodo-horizontal.png" alt="Meu Xodó" className="h-9 w-auto" />
          ) : (
            <span className="font-heading font-bold text-xl">{titulo}</span>
          )}

          <div className="flex items-center gap-1 bg-white/15 rounded-full px-1.5 py-1">
            <button
              onClick={diminuir}
              aria-label="Diminuir tamanho do texto"
              className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold hover:bg-white/20"
            >
              A-
            </button>
            <span className="text-xs opacity-80 w-8 text-center">{Math.round(escala * 100)}%</span>
            <button
              onClick={aumentar}
              aria-label="Aumentar tamanho do texto"
              className="w-7 h-7 flex items-center justify-center rounded-full text-base font-bold hover:bg-white/20"
            >
              A+
            </button>
          </div>
        </div>

        {mostrarLogo && (
          <div className="flex items-center gap-3">
            {fotoUrl && (
              <img src={fotoUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/40" />
            )}
            <div>
              {subtitulo && <p className="font-heading font-semibold text-sm opacity-90 mb-1">{subtitulo}</p>}
              <p className="font-heading font-bold text-3xl">{titulo}</p>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
