import { useCallback, useRef, useState } from 'react'

// Wrapper simples da Web Speech API em pt-BR. Nem todo navegador suporta
// (funciona bem no Chrome/Android; no Safari/iOS o suporte é limitado).
type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export function useVoiceRecognition() {
  const [ouvindo, setOuvindo] = useState(false)
  const [transcricao, setTranscricao] = useState('')
  const [suportado] = useState(() => getSpeechRecognition() !== null)
  const [erro, setErro] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const iniciar = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognition()
    if (!SpeechRecognitionCtor) {
      setErro('Reconhecimento de voz não é suportado neste navegador.')
      return
    }
    setErro(null)
    setTranscricao('')
    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const texto = event.results?.[0]?.[0]?.transcript ?? ''
      setTranscricao(texto)
    }
    recognition.onerror = (event: any) => {
      setErro(event?.error ? `Erro no microfone: ${event.error}` : 'Erro ao ouvir o microfone.')
      setOuvindo(false)
    }
    recognition.onend = () => setOuvindo(false)

    recognitionRef.current = recognition
    recognition.start()
    setOuvindo(true)
  }, [])

  const parar = useCallback(() => {
    recognitionRef.current?.stop()
    setOuvindo(false)
  }, [])

  return { ouvindo, transcricao, suportado, erro, iniciar, parar }
}
