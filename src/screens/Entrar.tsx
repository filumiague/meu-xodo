import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Entrar() {
  const { session, entrar, cadastrar } = useAuth()
  const [modo, setModo] = useState<'entrar' | 'cadastrar'>('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setMensagem(null)

    if (modo === 'entrar') {
      const { erro } = await entrar(email, senha)
      if (erro) setMensagem(erro)
    } else {
      const { erro } = await cadastrar(email, senha, nome)
      if (erro) {
        setMensagem(erro)
      } else {
        setMensagem('Conta criada! Verifique seu e-mail para confirmar o acesso e depois entre normalmente.')
        setModo('entrar')
      }
    }
    setEnviando(false)
  }

  return (
    <div className="min-h-dvh bg-teal-600 flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-meu-xodo.png" alt="Meu Xodó" className="w-20 h-20 mb-3" />
          <h1 className="font-heading font-bold text-2xl text-white">Meu Xodó</h1>
          <p className="text-teal-100 text-sm mt-1">
            {modo === 'entrar' ? 'Entre para ver a rotina de saúde' : 'Criar conta de acesso'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 flex flex-col gap-4" style={{ borderRadius: 'var(--radius-lg)' }}>
          {modo === 'cadastrar' && (
            <label className="flex flex-col gap-1.5">
              <span className="font-heading font-bold text-sm text-ink">Seu nome</span>
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border border-line rounded-xl px-4 py-3 text-base outline-teal-600"
                placeholder="Como você se chama"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="font-heading font-bold text-sm text-ink">E-mail</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-line rounded-xl px-4 py-3 text-base outline-teal-600"
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-heading font-bold text-sm text-ink">Senha</span>
            <input
              required
              type="password"
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border border-line rounded-xl px-4 py-3 text-base outline-teal-600"
              placeholder="Sua senha"
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            />
          </label>

          {mensagem && <p className="text-coral-600 text-sm">{mensagem}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="bg-teal-600 text-white font-heading font-bold text-base rounded-2xl py-4 mt-1 disabled:opacity-60"
          >
            {enviando ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>

          <button
            type="button"
            onClick={() => {
              setModo(modo === 'entrar' ? 'cadastrar' : 'entrar')
              setMensagem(null)
            }}
            className="text-teal-700 font-heading font-bold text-sm text-center"
          >
            {modo === 'entrar' ? 'Sou novo aqui, quero criar conta' : 'Já tenho conta, quero entrar'}
          </button>
        </form>

        <p className="text-teal-100 text-xs text-center mt-6 leading-relaxed">
          Acesso restrito à família e cuidadores convidados. Se sua conta não aparecer com
          nenhuma informação após entrar, peça para quem administra o app vincular seu e-mail.
        </p>
      </div>
    </div>
  )
}
