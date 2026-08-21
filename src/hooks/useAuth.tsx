import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { PerfilIdoso } from '../types/eventos'

interface AuthContextValue {
  session: Session | null
  user: User | null
  perfilIdoso: PerfilIdoso | null
  carregando: boolean
  erro: string | null
  entrar: (email: string, senha: string) => Promise<{ erro: string | null }>
  cadastrar: (email: string, senha: string, nome: string) => Promise<{ erro: string | null }>
  sair: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [perfilIdoso, setPerfilIdoso] = useState<PerfilIdoso | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregarPerfil(userId: string) {
    const { data, error } = await supabase
      .from('membros_familia')
      .select('perfil_idoso_id, perfis_idosos(id, nome, foto_url)')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      setErro('Não foi possível carregar seu vínculo com o perfil. Fale com quem administra o app.')
      setPerfilIdoso(null)
      return
    }

    const perfil = data?.perfis_idosos as unknown as PerfilIdoso | undefined
    setPerfilIdoso(perfil ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) carregarPerfil(data.session.user.id)
      setCarregando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      setSession(novaSessao)
      if (novaSessao?.user) {
        carregarPerfil(novaSessao.user.id)
      } else {
        setPerfilIdoso(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function entrar(email: string, senha: string) {
    setErro(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      const msg =
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : 'Não foi possível entrar agora. Tente de novo em instantes.'
      setErro(msg)
      return { erro: msg }
    }
    return { erro: null }
  }

  async function cadastrar(email: string, senha: string, nome: string) {
    setErro(null)
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    })
    if (error) {
      const msg =
        error.message?.includes('already registered')
          ? 'Já existe uma conta com esse e-mail.'
          : 'Não foi possível criar a conta agora. Tente de novo em instantes.'
      setErro(msg)
      return { erro: msg }
    }
    return { erro: null }
  }

  async function sair() {
    await supabase.auth.signOut()
    setPerfilIdoso(null)
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, perfilIdoso, carregando, erro, entrar, cadastrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
