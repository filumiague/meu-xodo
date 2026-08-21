import { useState } from 'react'
import { useVoiceRecognition } from '../hooks/useVoiceRecognition'
import { useAuth } from '../hooks/useAuth'
import { useEventos } from '../hooks/useEventos'

export function MicButton() {
  const { ouvindo, transcricao, suportado, erro, iniciar, parar } = useVoiceRecognition()
  const { perfilIdoso } = useAuth()
  const { criarEvento } = useEventos()
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)

  async function processarComando(texto: string) {
    if (!texto || !perfilIdoso) return
    setProcessando(true)
    setMensagem(null)
    try {
      const resposta = await fetch('/api/interpretar-voz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      })

      if (!resposta.ok) {
        const detalhe = await resposta.text()
        setMensagem(`Não consegui entender agora (${resposta.status}). ${detalhe.slice(0, 120)}`)
        return
      }

      const intencao = await resposta.json()

      if (intencao?.acao === 'criar_lembrete' && intencao?.titulo) {
        const { erro: erroCriar } = await criarEvento({
          categoria: intencao.categoria ?? 'remedio',
          titulo: intencao.titulo,
          descricao: intencao.descricao ?? null,
          data_evento: intencao.data_evento ?? new Date().toISOString().slice(0, 10),
          hora_evento: intencao.hora_evento ?? null,
          local: intencao.local ?? null,
          medico: intencao.medico ?? null,
          tomado: false,
          arquivo_url: null,
        })
        setMensagem(erroCriar ? `Não consegui salvar: ${erroCriar}` : `Lembrete criado: ${intencao.titulo}`)
      } else if (intencao?.acao === 'buscar') {
        setMensagem(intencao.resposta ?? 'Não encontrei nada com essa descrição.')
      } else {
        setMensagem('Não entendi bem o comando. Pode tentar falar de novo?')
      }
    } catch {
      setMensagem('Falha de conexão ao processar o comando de voz.')
    } finally {
      setProcessando(false)
    }
  }

  function alternar() {
    if (ouvindo) {
      parar()
      if (transcricao) processarComando(transcricao)
    } else {
      setMensagem(null)
      iniciar()
    }
  }

  if (!suportado) return null

  return (
    <div className="fixed bottom-24 right-5 z-30 flex flex-col items-end gap-2">
      {(mensagem || erro) && (
        <div className="max-w-[240px] bg-white border border-line rounded-2xl px-4 py-3 text-sm text-ink shadow-lg">
          {erro ?? mensagem}
        </div>
      )}
      <button
        onClick={alternar}
        disabled={processando}
        aria-label={ouvindo ? 'Parar de ouvir' : 'Falar um comando'}
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-colors ${
          ouvindo ? 'bg-coral-600 animate-pulse' : 'bg-amber-500'
        }`}
      >
        🎙️
      </button>
    </div>
  )
}
