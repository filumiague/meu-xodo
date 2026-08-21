import { CurvedHeader } from '../components/CurvedHeader'
import { useEventos } from '../hooks/useEventos'

export function Exames() {
  const { eventos, carregando } = useEventos('saude')

  return (
    <div className="min-h-dvh bg-cream pb-28">
      <CurvedHeader titulo="Meus exames" />

      <div className="px-5 pt-5">
        {carregando && <p className="text-ink-soft text-sm">Carregando...</p>}
        {!carregando && eventos.length === 0 && (
          <p className="text-ink-soft text-sm">Nenhum exame cadastrado ainda.</p>
        )}

        {eventos.map((exame) => {
          const data = new Date(exame.data_evento + 'T00:00:00')
          return (
            <div key={exame.id} className="flex gap-3.5 items-start py-3.5 border-b border-line">
              <div className="w-13 h-14 rounded-2xl bg-teal-050 border border-teal-200 flex flex-col items-center justify-center text-teal-700 flex-none">
                <span className="font-heading font-bold text-lg leading-none">
                  {data.toLocaleDateString('pt-BR', { day: '2-digit' })}
                </span>
                <span className="text-[11px] uppercase tracking-wide">
                  {data.toLocaleDateString('pt-BR', { month: 'short' })}
                </span>
              </div>
              <div>
                <h4 className="font-heading font-bold text-base mb-0.5">{exame.titulo}</h4>
                {exame.medico && <p className="text-sm text-ink-soft">{exame.medico}</p>}
                {exame.arquivo_url ? (
                  <span className="inline-block mt-1.5 text-xs font-bold text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full">
                    Arquivo anexado
                  </span>
                ) : (
                  <span className="inline-block mt-1.5 text-xs font-bold text-ink-soft bg-line px-2.5 py-1 rounded-full">
                    Sem arquivo (em breve: anexar foto/PDF)
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
