import { useEffect, useState } from 'react'
import { CurvedHeader } from '../components/CurvedHeader'
import { useAuth } from '../hooks/useAuth'
import { useArquivos } from '../hooks/useArquivos'

export function Familia() {
  const { user, perfilIdoso, sair } = useAuth()
  const { enviarFotoPerfil, obterUrlAssinada } = useArquivos()
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (perfilIdoso?.foto_url) {
      obterUrlAssinada(perfilIdoso.foto_url).then(setFotoUrl)
    }
  }, [perfilIdoso, obterUrlAssinada])

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setEnviando(true)
    setErro(null)
    const { caminho, erro: erroEnvio } = await enviarFotoPerfil(arquivo)
    setEnviando(false)
    if (erroEnvio) {
      setErro(erroEnvio)
      return
    }
    if (caminho) {
      const url = await obterUrlAssinada(caminho)
      setFotoUrl(url)
    }
  }

  return (
    <div className="min-h-dvh bg-cream pb-28">
      <CurvedHeader titulo="Família" />

      <div className="px-5 pt-5">
        <div className="bg-white border border-line rounded-2xl p-4 mb-4 flex items-center gap-4">
          <label className="relative cursor-pointer flex-none">
            {fotoUrl ? (
              <img src={fotoUrl} alt="" className="w-16 h-16 rounded-full object-cover border border-line" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-2xl">
                👤
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center">
              +
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFoto} disabled={enviando} />
          </label>
          <div>
            <p className="text-sm text-ink-soft mb-1">Acompanhando</p>
            <p className="font-heading font-bold text-base">{perfilIdoso?.nome ?? 'Nenhum perfil vinculado ainda'}</p>
          </div>
        </div>

        {enviando && <p className="text-sm text-ink-soft mb-2">Enviando foto...</p>}
        {erro && <p className="text-sm text-coral-600 mb-2">{erro}</p>}

        <div className="bg-white border border-line rounded-2xl p-4 mb-4">
          <p className="text-sm text-ink-soft mb-1">Conta conectada</p>
          <p className="font-heading font-bold text-base">{user?.email}</p>
        </div>

        <p className="text-sm text-ink-soft mb-4">
          Convide outros familiares ou cuidadores pedindo para quem administra o app cadastrar
          o e-mail deles na lista de convidados do Supabase (tabela <code>convite_email</code>).
        </p>

        <button
          onClick={sair}
          className="w-full bg-white border border-coral-600 text-coral-600 font-heading font-bold text-base rounded-2xl py-4"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}
