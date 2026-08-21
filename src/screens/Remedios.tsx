import { CurvedHeader } from '../components/CurvedHeader'
import { useEventos } from '../hooks/useEventos'

export function Remedios() {
  const { eventos, carregando, marcarTomado } = useEventos('remedio')
  const hoje = new Date().toISOString().slice(0, 10)
  const deHoje = eventos.filter((e) => e.data_evento === hoje)

  return (
    <div className="min-h-dvh bg-cream pb-28">
      <CurvedHeader titulo="Remédios de hoje" />

      <div className="px-5 pt-5">
        {carregando && <p className="text-ink-soft text-sm">Carregando...</p>}
        {!carregando && deHoje.length === 0 && (
          <p className="text-ink-soft text-sm">Nenhum remédio marcado para hoje.</p>
        )}

        {deHoje.map((remedio) => (
          <div key={remedio.id} className="flex items-center gap-3.5 bg-white border border-line rounded-2xl p-4 mb-3.5">
            <button
              onClick={() => marcarTomado(remedio.id, !remedio.tomado)}
              aria-label={remedio.tomado ? 'Marcar como não tomado' : 'Marcar como tomado'}
              className={`w-8 h-8 rounded-full border-2 border-teal-600 flex-none flex items-center justify-center ${
                remedio.tomado ? 'bg-teal-600 text-white' : 'text-transparent'
              }`}
            >
              ✓
            </button>
            <div>
              {remedio.hora_evento && (
                <p className="font-heading font-bold text-amber-600 text-sm mb-0.5">{remedio.hora_evento}</p>
              )}
              <h4 className="font-heading font-bold text-base">{remedio.titulo}</h4>
              <p className="text-sm text-ink-soft">
                {remedio.descricao ?? (remedio.tomado ? 'tomado' : 'ainda não tomado')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
