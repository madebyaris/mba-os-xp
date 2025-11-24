import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AppWindowProps } from '@/types/apps'

import styles from './Calculator.module.css'

type Operator = '+' | '-' | '×' | '÷'

interface HistoryEntry {
  expression: string
  result: string
}

const operators: Record<Operator, (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => a / b,
}

const CalculatorApp = ({ windowId }: AppWindowProps) => {
  const [displayValue, setDisplayValue] = useState('0')
  const [operand, setOperand] = useState<number | null>(null)
  const [pendingOperator, setPendingOperator] = useState<Operator | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [memory, setMemory] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const appendHistory = useCallback((expression: string, result: number) => {
    setHistory((prev) => [{ expression, result: result.toString() }, ...prev].slice(0, 6))
  }, [])

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand || displayValue === 'Error') {
        setDisplayValue(digit)
        setWaitingForOperand(false)
        setError(null)
      } else {
        setDisplayValue((prev) => (prev === '0' ? digit : `${prev}${digit}`))
      }
    },
    [displayValue, waitingForOperand],
  )

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplayValue('0.')
      setWaitingForOperand(false)
      return
    }
    if (!displayValue.includes('.')) {
      setDisplayValue((prev) => `${prev}.`)
    }
  }, [displayValue, waitingForOperand])

  const toggleSign = useCallback(() => {
    setDisplayValue((prev) => {
      if (prev === '0') return prev
      return prev.startsWith('-') ? prev.slice(1) : `-${prev}`
    })
  }, [])

  const clearEntry = useCallback(() => {
    setDisplayValue('0')
  }, [])

  const clearAll = useCallback(() => {
    setDisplayValue('0')
    setOperand(null)
    setPendingOperator(null)
    setWaitingForOperand(false)
    setError(null)
  }, [])

  const performCalculation = useCallback(
    (nextValue: number) => {
      if (operand === null || pendingOperator === null) {
        return nextValue
      }
      if (pendingOperator === '÷' && nextValue === 0) {
        setError('Cannot divide by zero')
        return 0
      }
      const result = operators[pendingOperator](operand, nextValue)
      appendHistory(`${operand} ${pendingOperator} ${nextValue}`, result)
      return result
    },
    [appendHistory, operand, pendingOperator],
  )

  const handleOperator = useCallback(
    (nextOperator: Operator) => {
      const inputValue = parseFloat(displayValue)

      if (operand === null) {
        setOperand(inputValue)
      } else if (!waitingForOperand) {
        const result = performCalculation(inputValue)
        setOperand(result)
        setDisplayValue(String(result))
      }

      setPendingOperator(nextOperator)
      setWaitingForOperand(true)
    },
    [displayValue, operand, performCalculation, waitingForOperand],
  )

  const handleEquals = useCallback(() => {
    if (pendingOperator === null) {
      return
    }
    const inputValue = parseFloat(displayValue)
    const result = performCalculation(inputValue)
    setDisplayValue(String(result))
    setOperand(null)
    setPendingOperator(null)
    setWaitingForOperand(true)
  }, [displayValue, pendingOperator, performCalculation])

  const handleMemory = useCallback(
    (command: 'MC' | 'MR' | 'M+' | 'M-') => {
      switch (command) {
        case 'MC':
          setMemory(0)
          break
        case 'MR':
          setDisplayValue(memory.toString())
          setWaitingForOperand(true)
          break
        case 'M+':
          setMemory((prev) => prev + parseFloat(displayValue))
          break
        case 'M-':
          setMemory((prev) => prev - parseFloat(displayValue))
          break
      }
    },
    [displayValue, memory],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') {
        return
      }
      if (/^\d$/.test(event.key)) {
        inputDigit(event.key)
        event.preventDefault()
      } else if (event.key === '.') {
        inputDecimal()
        event.preventDefault()
      } else if (event.key === 'Enter' || event.key === '=') {
        handleEquals()
        event.preventDefault()
      } else if (event.key === 'Backspace') {
        clearEntry()
        event.preventDefault()
      } else if (event.key === 'Escape') {
        clearAll()
        event.preventDefault()
      } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
        const operatorMap: Record<string, Operator> = {
          '+': '+',
          '-': '-',
          '*': '×',
          '/': '÷',
        }
        handleOperator(operatorMap[event.key])
        event.preventDefault()
      }
    },
    [clearAll, clearEntry, handleEquals, handleOperator, inputDecimal, inputDigit],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ windowId: string; command: string }>
      if (custom.detail.windowId !== windowId) {
        return
      }
      if (custom.detail.command === 'copy') {
        navigator.clipboard?.writeText(displayValue)
      }
      if (custom.detail.command === 'paste') {
        navigator.clipboard
          ?.readText()
          .then((text) => {
            if (!text) return
            const value = parseFloat(text)
            if (!Number.isNaN(value)) {
              setDisplayValue(String(value))
              setWaitingForOperand(true)
            }
          })
          .catch(() => {})
      }
    }
    window.addEventListener('mba:app-command', handler as EventListener)
    return () => window.removeEventListener('mba:app-command', handler as EventListener)
  }, [displayValue, windowId])

  const keypad = useMemo(
    () => [
      ['MC', 'MR', 'M+', 'M-'],
      ['CE', 'C', '±', '÷'],
      ['7', '8', '9', '×'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '+'],
      ['0', '.', '='],
    ],
    [],
  )

  const handleButtonPress = (value: string) => {
    if (/^\d$/.test(value)) {
      inputDigit(value)
      return
    }
    if (value === '.') {
      inputDecimal()
      return
    }
    if (value === 'CE') {
      clearEntry()
      return
    }
    if (value === 'C') {
      clearAll()
      return
    }
    if (value === '±') {
      toggleSign()
      return
    }
    if (value === '=') {
      handleEquals()
      return
    }
    if (['÷', '×', '-', '+'].includes(value)) {
      handleOperator(value as Operator)
      return
    }
    if (['MC', 'MR', 'M+', 'M-'].includes(value)) {
      handleMemory(value as 'MC' | 'MR' | 'M+' | 'M-')
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.displayStack}>
        <div className={styles.displayPrimary}>{displayValue}</div>
        {pendingOperator && operand !== null && (
          <div className={styles.displaySecondary}>
            {operand} {pendingOperator}
          </div>
        )}
      </div>
      {error && <div className={styles.errorBanner}>{error}</div>}
      <div className={styles.memoryIndicator}>
        Memory: {memory !== 0 ? memory : '0'}
      </div>
      <div className={styles.body}>
        <div className={styles.grid}>
          {keypad.flat().map((value) => (
            <button
              key={value}
              type="button"
              className={styles.key}
              data-accent={['÷', '×', '-', '+', '='].includes(value)}
              data-wide={value === '0'}
              onClick={() => handleButtonPress(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <aside className={styles.history}>
          <header>History</header>
          {history.length === 0 && <p>No history yet.</p>}
          <ul>
            {history.map((entry, index) => (
              <li key={`${entry.expression}-${index}`}>
                <span>{entry.expression}</span>
                <strong>{entry.result}</strong>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

export default CalculatorApp

