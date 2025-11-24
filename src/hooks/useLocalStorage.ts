import { useCallback, useEffect, useState } from 'react'

export const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(defaultValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn('Failed to parse localStorage item', key, error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue))
        } catch (error) {
          console.warn('Failed to write localStorage item', key, error)
        }
        return nextValue
      })
    },
    [key],
  )

  return [storedValue, setValue] as const
}

