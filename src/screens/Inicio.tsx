import { useEffect, useState } from 'react'
import { CurvedHeader } from '../components/CurvedHeader'
import { useAuth } from '../hooks/useAuth'
import { useEventos } from '../hooks/useEventos'
import { useArquivos } from '../hooks/useArquivos'
import { Link } from 'react-router-dom'

export function Inicio() {
  const { perfilIdoso } = useAuth()
  const { eventos } = useEventos('remedio')
  const { obterUrlAssinada } = useArquivos()
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const hoje = new Date().toISOString().slice(0, 10)
  const remediosHoje = eventos.filter((e) => e.data_evento === hoje && !e.tomado)

  useEffect(() => {
    if (perfilIdoso?.foto_url) obterUrlAssinada(perfilIdoso.foto_url).then(setFotoUrl)
  }, [perfilIdoso, obterUrlAssinada])

  return (
    <div className="min-h-dvh bg-cream pb-28">
      <CurvedHeader titulo={perfilIdoso?.nome ?? 'Olá'} subtitulo="Bom dia" mostrarLogo fotoUrl={fotoUrl} />

      <div className="px-5 pt-5">
        {remediosHoje.length > 0 && (
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 font-bold text-sm px-3.5 py-1.5 rounded-full mb-4">
            ● {remediosHoje.length} remédio{remediosHoje.length > 1 ? 's' : ''} ainda hoje
          </div>
        )}

        <p className="font-heading font-bold text-lg mb-3">O que você quer ver?</p>

        <Link to="/exames" className="flex items-center gap-4 bg-white border border-line rounded-2xl p-4 mb-3.5">
          <div className="w-13 h-13 rounded-2xl bg-teal-100 flex items-center justify-center text-2xl">🗂️</div>
          <div>
            <h3 className="font-heading font-bold text-base">Meus exames</h3>
            <p className="text-sm text-ink-soft">Ver e reabrir seus exames</p>
          </div>
        </Link>

        <Link to="/remedios" className="flex items-center gap-4 bg-white border border-line rounded-2xl p-4 mb-3.5">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">💊</div>
          <div>
            <h3 className="font-heading font-bold text-base">Meus remédios</h3>
            <p className="text-sm text-ink-soft">Horários de hoje</p>
          </div>
        </Link>

        <Link to="/familia" className="flex items-center gap-4 bg-white border border-line rounded-2xl p-4 mb-3.5">
          <div className="w-13 h-13 rounded-2xl bg-coral-100 flex items-center justify-center text-2xl">👨‍👩‍👧‍👦</div>
          <div>
            <h3 className="font-heading font-bold text-base">Família</h3>
            <p className="text-sm text-ink-soft">Quem está acompanhando você</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
