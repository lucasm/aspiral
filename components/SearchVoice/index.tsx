'use client'

import 'regenerator-runtime/runtime'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'

import { useSearch } from '@/contexts/SearchContext'

import Style from './SearchVoice.module.css'
import Modal from '../Modal'
import Tooltip from '../Tooltip'
import { Mic } from 'lucide-react'

interface Props {
  display: boolean
}

export default function SearchVoice(
  { display }: Readonly<Props> = { display: true }
) {
  const { putValue, isMobileViewport, isBrowserClientSide } = useSearch()
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition()
  const locale = useLocale()
  const t = useTranslations('t')
  const [hasVoiceSupport, setHasVoiceSupport] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [hasMicrophoneError, setHasMicrophoneError] = useState(false)
  const wasListening = useRef(false)
  const discardTranscript = useRef(false)
  const manuallyStopping = useRef(false)
  const latestTranscript = useRef(transcript)
  latestTranscript.current = transcript

  useEffect(() => {
    setHasVoiceSupport(isBrowserClientSide && browserSupportsSpeechRecognition)
  }, [isBrowserClientSide, browserSupportsSpeechRecognition])

  useEffect(() => {
    if (listening) {
      setHasMicrophoneError(false)
    } else if (!isStarting && !isMicrophoneAvailable) {
      setHasMicrophoneError(true)
    }
  }, [isMicrophoneAvailable, isStarting, listening])

  function handleSpeechRecognition() {
    if (listening) {
      manuallyStopping.current = true
      void SpeechRecognition.stopListening().then(() => {
        const stoppedTranscript = latestTranscript.current.trim()
        if (stoppedTranscript) putValue(stoppedTranscript)
        resetTranscript()
      })
    } else {
      discardTranscript.current = false
      setIsStarting(true)
      void SpeechRecognition.startListening({ language: locale })
        .catch((error: unknown) => {
          setHasMicrophoneError(true)
          console.error('Erro ao iniciar o reconhecimento de voz:', error)
        })
        .finally(() => setIsStarting(false))
    }
  }

  function handleCancel() {
    discardTranscript.current = true
    void SpeechRecognition.abortListening()
  }

  useEffect(() => {
    if (listening) {
      wasListening.current = true
      return
    }

    if (!wasListening.current) return

    wasListening.current = false
    if (manuallyStopping.current) {
      manuallyStopping.current = false
      return
    }

    if (!discardTranscript.current && transcript.trim()) {
      putValue(transcript.trim())
    }
    discardTranscript.current = false
    resetTranscript()
  }, [listening, transcript, putValue, resetTranscript])

  return (
    <>
      {hasVoiceSupport && (
        <div className={Style.container}>
          <Modal
            isOpen={listening}
            onClose={handleCancel}
            title={t('voice.speak')}
            className={Style.voiceModal}
            contentClassName={Style.voiceModalContent}>
            <div className={Style.buttonListening} aria-hidden="true"></div>
            <p
              className={Style.transcriptContainer}
              role="status"
              aria-live="polite"
              aria-atomic="true">
              {transcript}
            </p>
            <footer className={Style.modalFooter}>
              <button
                type="button"
                className={Style.stopButton}
                onClick={handleSpeechRecognition}>
                {t('voice.stop')}
              </button>
            </footer>
          </Modal>

          <Tooltip text={t('voice.voice')} disable={isMobileViewport}>
            <button
              type="button"
              className={
                listening
                  ? `${Style.button} ${Style.buttonActive}`
                  : Style.button
              }
              aria-label={t('voice.voice')}
              aria-pressed={listening}
              aria-busy={isStarting}
              disabled={isStarting}
              onClick={handleSpeechRecognition}
              style={{ display: display ? 'inline-flex' : 'none' }}>
              <Mic aria-hidden="true" />
              {t('voice.voice')}
            </button>
          </Tooltip>
          {hasMicrophoneError && (
            <p className={Style.errorMessage} role="status" aria-live="polite">
              {t('voice.allow')}
            </p>
          )}
        </div>
      )}
    </>
  )
}
