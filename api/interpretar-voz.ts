export const config = { runtime: 'edge' }

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response('GEMINI_API_KEY não configurada no servidor.', { status: 500 })
  }

  const { texto } = await req.json()
  if (!texto) {
    return new Response('Campo "texto" é obrigatório.', { status: 400 })
  }

  const hoje = new Date().toISOString().slice(0, 10)

  const prompt = `Você interpreta comandos de voz em português para um app de cuidado com idosos.
Data de hoje: ${hoje}.
Frase do usuário: "${texto}"

Responda APENAS com um JSON válido, sem markdown, em um destes dois formatos:

Se o usuário quer CRIAR um lembrete/remédio/consulta:
{"acao":"criar_lembrete","categoria":"remedio|saude|compromisso","titulo":"...","descricao":"...","data_evento":"YYYY-MM-DD","hora_evento":"HH:MM ou null","local":"... ou null","medico":"... ou null"}

Se o usuário está BUSCANDO algo (ex: "cadê o exame de sangue"):
{"acao":"buscar","resposta":"uma frase curta e clara dizendo o que fazer ou o que foi encontrado"}

Se não entender:
{"acao":"desconhecido"}`

  try {
    const resposta = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    })

    if (!resposta.ok) {
      const detalhe = await resposta.text()
      return new Response(`Erro do Gemini (${resposta.status}): ${detalhe.slice(0, 300)}`, {
        status: 502,
      })
    }

    const dados = await resposta.json()
    const textoResposta: string = dados?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const limpo = textoResposta.replace(/```json|```/g, '').trim()

    let intencao
    try {
      intencao = JSON.parse(limpo)
    } catch {
      intencao = { acao: 'desconhecido' }
    }

    return new Response(JSON.stringify(intencao), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(`Falha ao chamar o Gemini: ${(e as Error).message}`, { status: 502 })
  }
}
