import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { AppWindowProps } from '@/types/apps'

import styles from './Calendar.module.css'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = Array.from({ length: 12 }).map((_, index) =>
  format(new Date(2025, index, 1), 'MMM'),
)

const CalendarApp = (_props: AppWindowProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start, end })
  const weeks = useMemo(() => {
    const chunked = []
    for (let i = 0; i < days.length; i += 7) {
      chunked.push(days.slice(i, i + 7))
    }
    return chunked
  }, [days])

  const handleSelect = (date: Date) => {
    setSelectedDate(date)
    if (!isSameMonth(date, currentDate)) {
      setCurrentDate(date)
    }
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  return (
    <div className={styles.container}>
      <section className={styles.calendarPane}>
        <header className={styles.header}>
          <div>
            <h3>{format(currentDate, 'MMMM yyyy')}</h3>
            <p>{format(new Date(), "'Today is' EEEE, MMM d")}</p>
          </div>
          <div className={styles.controls}>
            <button type="button" onClick={() => setCurrentDate(subYears(currentDate, 1))}>
              <ChevronLeft size={18} /> Year
            </button>
            <button type="button" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={handleToday}>
              Today
            </button>
            <button type="button" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight size={18} />
            </button>
            <button type="button" onClick={() => setCurrentDate(addYears(currentDate, 1))}>
              Year <ChevronRight size={18} />
            </button>
          </div>
        </header>
        <div className={styles.weekdays}>
          <span className={styles.weekNumberLabel}>Wk</span>
          {weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className={styles.weeks}>
          {weeks.map((week) => (
            <div key={week[0].toISOString()} className={styles.weekRow}>
              <span className={styles.weekNumber}>{getWeek(week[0])}</span>
              {week.map((day) => {
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())
                const isSelected = isSameDay(day, selectedDate)
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    className={styles.dayButton}
                    data-outside={!isCurrentMonth}
                    data-today={isToday}
                    data-selected={isSelected}
                    onClick={() => handleSelect(day)}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </section>
      <aside className={styles.sidebar}>
        <div className={styles.selectedCard}>
          <CalendarDays size={32} />
          <div>
            <h4>{format(selectedDate, 'EEEE, MMMM d')}</h4>
            <p>{format(selectedDate, 'yyyy')}</p>
          </div>
        </div>
        <div className={styles.yearPicker}>
          <header>
            <span>{format(currentDate, 'yyyy')}</span>
          </header>
          <div className={styles.monthGrid}>
            {monthNames.map((label, monthIndex) => {
              const date = new Date(currentDate.getFullYear(), monthIndex, 1)
              const isActive = isSameMonth(date, currentDate)
              return (
                <button
                  key={label}
                  type="button"
                  className={styles.monthButton}
                  data-active={isActive}
                  onClick={() => setCurrentDate(date)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

export default CalendarApp

