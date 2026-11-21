import axios from 'axios'
import { useEffect, useState, useCallback } from 'react'

import Styles from './SearchSuggestions.module.css'
import { useSearch } from '../../contexts/SearchContext'

type Props = {
  term: string
  locale: string
}

const SUGGESTION_TERM_LENGTH_LIMIT = 35

export default function SearchSuggestions({ term, locale }: Readonly<Props>) {
  const { putValue } = useSearch()
  const [data, setData] = useState<string[] | null>(null)
  const [prevTerm, setPrevTerm] = useState<string>('')

  const handleValue = (value: string) => {
    putValue(value)
    setPrevTerm(value)
    setData(null)
  }

  const isSuggestionTermEligible =
    term.length > 0 && term.length < SUGGESTION_TERM_LENGTH_LIMIT

  const fetchSuggestions = useCallback(async () => {
    if (locale && isSuggestionTermEligible && term !== prevTerm) {
      try {
        const response = await axios.get(
          `/api/suggestions/?locale=${locale}&term=${term}`
        )
        setData(response.data)
        setPrevTerm(term) // Atualiza o termo anterior após uma nova busca
      } catch (error) {
        console.error(error)
      }
    }
  }, [isSuggestionTermEligible, locale, prevTerm, term])

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchSuggestions()
    }, 500) // debounce

    return () => {
      clearTimeout(debounceFetch) // Limpa o timeout anterior se o term mudar antes do timeout terminar
    }
  }, [fetchSuggestions, term, locale])

  useEffect(() => {
    if (term?.length === 0) {
      setData(null)
      setPrevTerm('') // Reseta o termo anterior se o input estiver vazio
    }
  }, [term])

  return (
    <div className={Styles.container}>
      {isSuggestionTermEligible && data && (
        <ul>
          {data.slice(0, 6).map((item: string) => (
            <li key={item}>
              <button onClick={() => handleValue(item)}>{item}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
