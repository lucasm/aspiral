import { useEffect, useState, useRef, useCallback } from 'react'
import Loader from './Loader/Loader'

type Props = {
  readonly country: string
  readonly category: string
  readonly name: string
}

export default function CardFeedFetch(props: Readonly<Props>) {
  const [data, setData] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [retryCount, setRetryCount] = useState(0)

  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchFeed = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController
    setLoading(true)

    const url = `/api/feed?country=${props.country}&category=${props.category}&name=${props.name}`

    fetch(url, { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((responseJson) => {
        if (!abortController.signal.aborted) {
          setData(responseJson)
          setLoading(false)
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.log('GET ERROR', error)
        setLoading(false)
        setData([
          {
            title: 'Ooopss!',
            link: null,
          },
        ])
        // Retry automático único após 3s
        if (retryCount === 0) {
          setTimeout(() => setRetryCount((c) => c + 1), 3000)
        }
      })

    return () => {
      abortController.abort()
    }
  }, [props.category, props.country, props.name, retryCount])

  useEffect(() => {
    const cleanup = fetchFeed()
    return cleanup
  }, [fetchFeed])

  return (
    <ul>
      {data.map((item) =>
        item.link === null ? (
          <li key="error">
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
              {item.title}
            </button>
          </li>
        ) : (
          <li key={item.title + item.link}>
            <a href={item.link} target="_blank" rel="external noopener noreferrer">
              {item.title}
            </a>
          </li>
        )
      )}
      {loading && <Loader />}
    </ul>
  )
}
