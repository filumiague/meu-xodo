export type CategoriaEvento = 'saude' | 'remedio' | 'compromisso' | 'localizacao'

export interface Evento {
  id: string
  perfil_idoso_id: string
  categoria: CategoriaEvento
  titulo: string
  descricao: string | null
  data_evento: string // ISO date
  hora_evento: string | null // HH:mm
  local: string | null
  medico: string | null
  tomado: boolean | null // usado por remédios
  arquivo_url: string | null // exame/documento anexado (Supabase Storage)
  criado_em: string
}

export type NovoEvento = Omit<Evento, 'id' | 'criado_em' | 'perfil_idoso_id'>

export interface PerfilIdoso {
  id: string
  nome: string
}

export type PapelMembro = 'idoso' | 'cuidador' | 'familiar'

export interface MembroFamilia {
  id: string
  user_id: string
  perfil_idoso_id: string
  papel: PapelMembro
  nome: string | null
}
