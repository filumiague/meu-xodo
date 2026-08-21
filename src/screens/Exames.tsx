import { useEffect, useState, type FormEvent } from 'react'
import { CurvedHeader } from '../components/CurvedHeader'
import { useEventos } from '../hooks/useEventos'
import { useArquivos, ehImagem } from '../hooks/useArquivos'
import type { Evento } from '../types/eventos'

function ArquivoDoExame({ exame }: { exame: Evento }) {
  const { obterUrlAssinada } = useArquivos()
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    if (exame.arquivo_url) {
      obterUrlAssinada(exame.arquivo_url).then((u) => {
        if (!cancelado) setUrl(u)
      })
    }
    return () => {
      cancelado = true
    }
  }, [exame.arquivo_url, obterUrlAssinada])

  if (!exame.arquivo_url) {
    return (
      <span className="inline-block mt-1.5 text-xs font-bold text-ink-soft bg-line px-2.5 py-1 rounded-full">
        Sem arquivo
      </span>
    )
  }

  if (!url) {
    return <span className="inline-block mt-1.5 text-xs text-ink-soft">Carregando arquivo...</span>
  }

  if (ehImagem(exame.arquivo_url)) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="inline-block mt-2">
        <img src={url} alt={exame.titulo} className="w-20 h-20 object-cover rounded-xl border border-line" />
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-block mt-1.5 text-xs font-bold text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full"
    >
      Abrir arquivo
    </a>
  )
}

function FormularioNovoExame({ aoFechar }: { aoFechar: () => void }) {
  const { criarEvento } = useEventos()
  const { enviarArquivoExame } = useArquivos()
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))
  const [medico, setMedico] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)

    let arquivoUrl: string | null = null
    if (arquivo) {
      const { caminho, erro: erroUpload } = await enviarArquivoExame(arquivo)
      if (erroUpload) {
        setErro(`Não consegui enviar o arquivo: ${erroUpload}`)
        setEnviando(false)
        return
      }
      arquivoUrl = caminho
    }

    const { erro: erroCriar } = await criarEvento({
      categoria: 'saude',
      titulo,
      descricao: null,
      data_evento: data,
      hora_evento: null,
      local: null,
      medico: medico || null,
      tomado: null,
      arquivo_url: arquivoUrl,
    })

    setEnviando(false)
    if (erroCriar) {
      setErro(`Não consegui salvar: ${erroCriar}`)
      return
    }
    aoFechar()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-line rounded-2xl p-4 mb-4 flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-heading font-bold text-sm">Nome do exame</span>
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Exame de sangue"
          className="border border-line rounded-xl px-3 py-2.5 text-base outline-teal-600"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-heading font-bold text-sm">Data</span>
        <input
          required
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="border border-line rounded-xl px-3 py-2.5 text-base outline-teal-600"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-heading font-bold text-sm">Médico (opcional)</span>
        <input
          value={medico}
          onChange={(e) => setMedico(e.target.value)}
          placeholder="Ex: Dr. Ricardo"
          className="border border-line rounded-xl px-3 py-2.5 text-base outline-teal-600"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-heading font-bold text-sm">Foto, PDF ou planilha (opcional)</span>
        <input
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </label>

      {erro && <p className="text-coral-600 text-sm">{erro}</p>}

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 bg-teal-600 text-white font-heading font-bold rounded-xl py-3 disabled:opacity-60"
        >
          {enviando ? 'Salvando...' : 'Salvar exame'}
        </button>
        <button
          type="button"
          onClick={aoFechar}
          className="px-4 rounded-xl border border-line text-ink-soft font-heading font-bold"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function Exames() {
  const { eventos, carregando } = useEventos('saude')
  const [mostrarForm, setMostrarForm] = useState(false)

  return (
    <div className="min-h-dvh bg-cream pb-28">
      <CurvedHeader titulo="Meus exames" />

      <div className="px-5 pt-5">
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="w-full bg-amber-500 text-white font-heading font-bold rounded-2xl py-3.5 mb-4"
          >
            + Adicionar exame
          </button>
        )}

        {mostrarForm && <FormularioNovoExame aoFechar={() => setMostrarForm(false)} />}

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
                <ArquivoDoExame exame={exame} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
