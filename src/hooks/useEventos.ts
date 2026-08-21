import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CategoriaEvento, Evento, NovoEvento } from '../types/eventos'
import { useAuth } from './useAuth'

export function useEventos(categoria?: CategoriaEvento) {
  const { perfilIdoso } = useAuth()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const recarregar = useCallback(async () => {
    if (!perfilIdoso) {
      setEventos([])
      setCarregando(false)
      return
    }
    setCarregando(true)
    let query = supabase
      .from('eventos')
      .select('*')
      .eq('perfil_idoso_id', perfilIdoso.id)
      .order('data_evento', { ascending: true })

    if (categoria) query = query.eq('categoria', categoria)

    const { data, error } = await query
    if (error) {
      setErro('Não foi possível carregar os dados agora.')
    } else {
      setErro(null)
      setEventos((data ?? []) as Evento[])
    }
    setCarregando(false)
  }, [perfilIdoso, categoria])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  async function criarEvento(novo: NovoEvento) {
    if (!perfilIdoso) return { erro: 'Sem perfil vinculado.' }
    const { error } = await supabase
      .from('eventos')
      .insert({ ...novo, perfil_idoso_id: perfilIdoso.id })
    if (error) return { erro: error.message }
    await recarregar()
    return { erro: null }
  }

  async function marcarTomado(id: string, tomado: boolean) {
    const { error } = await supabase.from('eventos').update({ tomado }).eq('id', id)
    if (!error) await recarregar()
    return { erro: error?.message ?? null }
  }

  return { eventos, carregando, erro, recarregar, criarEvento, marcarTomado }
}
