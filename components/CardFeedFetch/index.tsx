import { useEffect, useState, useRef, useCallback } from 'react'
import { FeedError, httpError } from '@/app/api/feedRss/feedErrors'
import ButtonRetry from '@/components/ButtonRetry'
import Loader from '@/components/Loader'

type Props = {
  readonly locale: string
  readonly category: string
  readonly name: string
}

interface FeedItem {
  title: string
  link: string
}

// Extrai mensagem de erro do response ou retorna null se OK
function getErrorMessage(responseJson: any): string | null {
  if (
    !responseJson ||
    !Array.isArray(responseJson) ||
    responseJson.length === 0
  ) {
    return FeedError.EMPTY_RESPONSE
  }
  // Detecta item com title começando com "Error"
  const errorItem = responseJson.find((item: any) =>
    item?.title?.toLowerCase().startsWith('error')
  )
  if (errorItem) {
    return errorItem.title
  }
  return null
}

export default function CardFeedFetch(props: Readonly<Props>) {
  const [data, setData] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [hasRetried, setHasRetried] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  const handleRetry = useCallback(() => {
    setHasRetried(true)
    setErrorMessage(null)
    setRetryCount((c) => c + 1)
  }, [])

  const fetchFeed = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController
    setLoading(true)
    setErrorMessage(null)

    const url = `/api/feedRss?locale=${encodeURIComponent(props.locale)}&category=${encodeURIComponent(props.category)}&name=${encodeURIComponent(props.name)}`

    fetch(url, { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(httpError(response.status))
        }
        return response.json()
      })
      .then((responseJson) => {
        if (!abortController.signal.aborted) {
          const error = getErrorMessage(responseJson)
          if (error) {
            setErrorMessage(error)
            setData([])
          } else {
            setData(responseJson)
            setErrorMessage(null)
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.log('GET ERROR', err)
        setLoading(false)
        setErrorMessage(err.message || FeedError.NETWORK_ERROR)
        setData([])
      })

    return () => {
      abortController.abort()
    }
  }, [props.category, props.locale, props.name, retryCount])

  useEffect(() => {
    const cleanup = fetchFeed()
    return cleanup
  }, [fetchFeed])

  return (
    <ul>
      {errorMessage ? (
        <li>
          <ButtonRetry
            onClick={handleRetry}
            feedName={props.name}
            errorMessage={errorMessage}
            showFeedback={hasRetried}
          />
        </li>
      ) : (
        data.map((item) => (
          <li key={item.title + item.link}>
            <a
              href={item.link}
              target="_blank"
              rel="external noopener noreferrer">
              {item.title}
            </a>
          </li>
        ))
      )}
      {loading && <Loader />}
    </ul>
  )
}
