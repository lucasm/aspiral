import { useEffect, useState, useRef } from 'react'
import Loader from './Loader/Loader'

type Props = {
  readonly country: string
  readonly category: string
  readonly name: string
}

export default function CardFeedFetch(props: Readonly<Props>) {
  const [data, setData] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Rastrear a requisição em aberto para cancelar se necessário
  const abortControllerRef = useRef<AbortController | null>(null)
  // Flag para saber se já iniciamos uma requisição
  const requestStartedRef = useRef<boolean>(false)

  useEffect(() => {
    // Se já iniciamos uma requisição, não inicia novamente
    if (requestStartedRef.current) {
      return
    }

    // Cancelar requisição anterior se houver
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Criar novo AbortController para esta requisição
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    requestStartedRef.current = true

    const url = `/api/feed?country=${props.country}&category=${props.category}&name=${props.name}`

    fetch(url, { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((responseJson) => {
        // Verificar se a requisição não foi cancelada
        if (!abortController.signal.aborted) {
          console.log('GET', props.name, responseJson)
          setData(responseJson)
          setLoading(false)
        }
      })
      .catch((error) => {
        // Ignorar erros de requisição cancelada
        if (error.name === 'AbortError') {
          return
        }
        console.log('GET ERROR', error)
        setLoading(false)
        setData([
          {
            title: 'Ooopss!',
            link: 'mailto:feedback@memeh.app?subject=Feedback&body=Error%20in%20frontend%20of%20' + props.name,
          },
        ])
      })

    // Cleanup: cancelar requisição ao desmontar ou quando deps mudarem
    return () => {
      abortController.abort()
      requestStartedRef.current = false
    }
  }, [props.category, props.country, props.name])

  return (
    <ul>
      {data.map((item) => (
        <li key={item.title + item.link}>
          <a href={item.link} target="_blank" rel="external noopener noreferrer">
            {item.title}
          </a>
        </li>
      ))}
      {loading && <Loader />}
    </ul>
  )
}
