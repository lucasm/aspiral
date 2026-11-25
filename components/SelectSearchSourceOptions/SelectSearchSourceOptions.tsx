import { useEffect, useRef, useState } from 'react'

import Select from '@/components/Select'
import { useSearch } from '@/contexts/SearchContext'
import { normalizeId } from '@/utils/formats'

import Style from './SelectSearchSourceOptions.module.css'

interface Option {
  label: string
  value: string
}

interface Props {
  options: Option[]
  label: string
}

const SelectSearchSourceOptions = ({ options, label }: Readonly<Props>) => {
  const { setSearchUrl, inputValue, inputFocus } = useSearch()
  const [selectedOption, setSelectedOption] = useState<string>(options[0].value)
  const shouldFocusInput = useRef(false)

  const handleChange = (value: string) => {
    setSelectedOption(value)
    setSearchUrl(value + (inputValue ?? ''))
    shouldFocusInput.current = true
  }

  // if inputValue changes, update the searchUrl
  useEffect(() => {
    setSearchUrl(selectedOption + (inputValue ?? ''))
  }, [inputValue, selectedOption, setSearchUrl])

  // on teh first render, set the default value as the first option
  useEffect(() => {
    handleChange(options[0].value)
  }, [])

  return (
    <div className={Style.container}>
      <Select
        options={options}
        id={normalizeId(label)}
        onChange={handleChange}
        value={selectedOption}
        label={label}
        onCloseAutoFocus={(event) => {
          if (!shouldFocusInput.current) return

          event.preventDefault()
          shouldFocusInput.current = false
          window.setTimeout(inputFocus, 0)
        }}
      />
    </div>
  )
}

export default SelectSearchSourceOptions
