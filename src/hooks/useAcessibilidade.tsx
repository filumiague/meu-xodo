import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const CHAVE_ARMAZENAMENTO = 'meu-xodo:escala-fonte'
const ESCALA_MIN = 1
const ESCALA_MAX = 1.5
const PASSO = 0.1

interface AcessibilidadeContextValue {
  escala: number
  aumentar: () => void
  diminuir: () => void
}

const AcessibilidadeContext = createContext<AcessibilidadeContextValue | undefined>(undefined)

export function AcessibilidadeProvider({ children }: { children: ReactNode }) {
  const [escala, setEscala] = useState(() => {
    const salvo = Number(localStorage.getItem(CHAVE_ARMAZENAMENTO))
    return salvo >= ESCALA_MIN && salvo <= ESCALA_MAX ? salvo : 1
  })

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', String(escala))
    localStorage.setItem(CHAVE_ARMAZENAMENTO, String(escala))
  }, [escala])

  const aumentar = () => setEscala((e) => Math.min(ESCALA_MAX, Math.round((e + PASSO) * 10) / 10))
  const diminuir = () => setEscala((e) => Math.max(ESCALA_MIN, Math.round((e - PASSO) * 10) / 10))

  return (
    <AcessibilidadeContext.Provider value={{ escala, aumentar, diminuir }}>
      {children}
    </AcessibilidadeContext.Provider>
  )
}

export function useAcessibilidade() {
  const ctx = useContext(AcessibilidadeContext)
  if (!ctx) throw new Error('useAcessibilidade precisa estar dentro de <AcessibilidadeProvider>')
  return ctx
}
