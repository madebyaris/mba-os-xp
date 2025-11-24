import {
  CheckCircle,
  Focus,
  Pause,
  Play,
  RotateCcw,
  Timer as TimerIcon,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useLocalStorage } from '@/hooks/useLocalStorage'
import { playSound } from '@/utils/sounds'
import type { AppWindowProps } from '@/types/apps'

import styles from './TodoPomodoro.module.css'

type Priority = 'High' | 'Medium' | 'Low'
type StatusFilter = 'all' | 'active' | 'completed'
type SessionType = 'work' | 'break' | 'longBreak'

interface Task {
  id: string
  title: string
  priority: Priority
  category: string
  dueDate?: string
  completed: boolean
  createdAt: number
  pomodoros: number
}

const defaultDurations = {
  work: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
}

const priorityColors: Record<Priority, string> = {
  High: '#ff6b6b',
  Medium: '#f6c343',
  Low: '#4caf50',
}

const TodoPomodoroApp = (_props: AppWindowProps) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('mba-tasks', [])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all')
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'Medium' as Priority,
    category: 'General',
    dueDate: '',
  })

  const [sessionType, setSessionType] = useState<SessionType>('work')
  const [timeLeft, setTimeLeft] = useState(defaultDurations.work)
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle')
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0)

  useEffect(() => {
    if (timerState !== 'running') return undefined
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSessionComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [timerState, sessionType])

  const handleSessionComplete = () => {
    playSound('notification')
    if (sessionType === 'work') {
      setCompletedWorkSessions((prev) => prev + 1)
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === activeTaskId ? { ...task, pomodoros: task.pomodoros + 1 } : task,
          ),
        )
      }
      if ((completedWorkSessions + 1) % 4 === 0) {
        setSessionType('longBreak')
        setTimeLeft(defaultDurations.longBreak)
      } else {
        setSessionType('break')
        setTimeLeft(defaultDurations.break)
      }
    } else {
      setSessionType('work')
      setTimeLeft(defaultDurations.work)
    }
    setTimerState('paused')
  }

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (statusFilter === 'active' && task.completed) return false
        if (statusFilter === 'completed' && !task.completed) return false
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
        return true
      })
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
  }, [priorityFilter, statusFilter, tasks])

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? null

  const addTask = () => {
    if (!newTask.title.trim()) return
    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.title.trim(),
      priority: newTask.priority,
      category: newTask.category,
      dueDate: newTask.dueDate,
      completed: false,
      createdAt: Date.now(),
      pomodoros: 0,
    }
    setTasks((prev) => [task, ...prev])
    setNewTask({ title: '', priority: 'Medium', category: 'General', dueDate: '' })
  }

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
    if (activeTaskId === id) {
      setActiveTaskId(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const startTimer = () => {
    if (!activeTask && sessionType === 'work') return
    setTimerState('running')
  }

  const pauseTimer = () => {
    setTimerState('paused')
  }

  const resetTimer = () => {
    setTimerState('idle')
    setSessionType('work')
    setTimeLeft(defaultDurations.work)
    setCompletedWorkSessions(0)
  }

  return (
    <div className={styles.layout}>
      <section className={styles.todoPane}>
        <header className={styles.todoHeader}>
          <div>
            <h3>Tasks</h3>
            <p>{tasks.filter((task) => !task.completed).length} active</p>
          </div>
          <div className={styles.filters}>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | Priority)}>
              <option value="all">Any priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </header>
        <div className={styles.newTaskForm}>
          <input
            placeholder="Task title"
            value={newTask.title}
            onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
          />
          <select
            value={newTask.priority}
            onChange={(event) => setNewTask((prev) => ({ ...prev, priority: event.target.value as Priority }))}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(event) => setNewTask((prev) => ({ ...prev, dueDate: event.target.value }))}
          />
          <button type="button" onClick={addTask}>
            Add
          </button>
        </div>
        <ul className={styles.todoList}>
          {filteredTasks.map((task) => (
            <li key={task.id} className={task.completed ? styles.taskCompleted : styles.taskItem}>
              <div className={styles.taskMain}>
                <label>
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
                  <span>{task.title}</span>
                </label>
                <span className={styles.badge} style={{ backgroundColor: priorityColors[task.priority] }}>
                  {task.priority}
                </span>
              </div>
              <div className={styles.taskMeta}>
                {task.dueDate && <span>Due {task.dueDate}</span>}
                <span>{task.pomodoros} pomodoros</span>
              </div>
              <div className={styles.taskActions}>
                <button type="button" onClick={() => setActiveTaskId(task.id)}>
                  <Focus size={16} /> Focus
                </button>
                <button type="button" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.timerPane}>
        <header>
          <h3>Pomodoro Timer</h3>
          <span className={styles.sessionLabel}>
            {sessionType === 'work' ? 'Focus Session' : sessionType === 'break' ? 'Short Break' : 'Long Break'}
          </span>
        </header>
        <div className={styles.timerCircle}>
          <span>{formatTime(timeLeft)}</span>
          {activeTask && sessionType === 'work' && <p>Focusing on: {activeTask.title}</p>}
        </div>
        <div className={styles.timerActions}>
          <button type="button" onClick={startTimer} disabled={timerState === 'running'}>
            <Play size={16} /> Start
          </button>
          <button type="button" onClick={pauseTimer} disabled={timerState !== 'running'}>
            <Pause size={16} /> Pause
          </button>
          <button type="button" onClick={resetTimer}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
        <div className={styles.sessionStats}>
          <div>
            <TimerIcon size={20} />
            <span>{completedWorkSessions} sessions complete</span>
          </div>
          <div>
            <CheckCircle size={20} />
            <span>{tasks.reduce((sum, task) => sum + task.pomodoros, 0)} total pomodoros</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TodoPomodoroApp

