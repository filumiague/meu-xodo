import { CurvedHeader } from '../components/CurvedHeader'
import { useAuth } from '../hooks/useAuth'

export function Familia() {
  const { user, perfilIdoso, sair } = useAuth()

  return (
    <div className="min-h-dvh bg-cream pb-28">
      <CurvedHeader titulo="Família" />

      <div className="px-5 pt-5">
        <div className="bg-white border border-line rounded-2xl p-4 mb-4">
          <p className="text-sm text-ink-soft mb-1">Conta conectada</p>
          <p className="font-heading font-bold text-base">{user?.email}</p>
        </div>

        <div className="bg-white border border-line rounded-2xl p-4 mb-4">
          <p className="text-sm text-ink-soft mb-1">Acompanhando</p>
          <p className="font-heading font-bold text-base">{perfilIdoso?.nome ?? 'Nenhum perfil vinculado ainda'}</p>
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
