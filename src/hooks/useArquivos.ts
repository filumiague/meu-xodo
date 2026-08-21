import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const BUCKET = 'arquivos'

function extensaoDe(nomeArquivo: string) {
  const partes = nomeArquivo.split('.')
  return partes.length > 1 ? partes[partes.length - 1].toLowerCase() : 'bin'
}

export function useArquivos() {
  const { perfilIdoso } = useAuth()

  const enviarArquivoExame = useCallback(
    async (arquivo: File) => {
      if (!perfilIdoso) return { caminho: null, erro: 'Sem perfil vinculado.' }
      const caminho = `${perfilIdoso.id}/exames/${crypto.randomUUID()}.${extensaoDe(arquivo.name)}`
      const { error } = await supabase.storage.from(BUCKET).upload(caminho, arquivo, {
        cacheControl: '3600',
        upsert: false,
      })
      if (error) return { caminho: null, erro: error.message }
      return { caminho, erro: null }
    },
    [perfilIdoso]
  )

  const enviarFotoPerfil = useCallback(
    async (arquivo: File) => {
      if (!perfilIdoso) return { caminho: null, erro: 'Sem perfil vinculado.' }
      const caminho = `${perfilIdoso.id}/perfil/foto.${extensaoDe(arquivo.name)}`
      const { error } = await supabase.storage.from(BUCKET).upload(caminho, arquivo, {
        cacheControl: '3600',
        upsert: true,
      })
      if (error) return { caminho: null, erro: error.message }

      const { error: erroUpdate } = await supabase
        .from('perfis_idosos')
        .update({ foto_url: caminho })
        .eq('id', perfilIdoso.id)
      if (erroUpdate) return { caminho: null, erro: erroUpdate.message }

      return { caminho, erro: null }
    },
    [perfilIdoso]
  )

  const obterUrlAssinada = useCallback(async (caminho: string, validoPorSegundos = 3600) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(caminho, validoPorSegundos)
    if (error || !data) return null
    return data.signedUrl
  }, [])

  return { enviarArquivoExame, enviarFotoPerfil, obterUrlAssinada }
}

export function ehImagem(caminho: string) {
  return /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(caminho)
}
