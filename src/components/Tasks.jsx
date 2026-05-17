import React, { useState, useEffect, useRef } from 'react'
import './Tasks.css'

const STORAGE_KEY = 'dashboard_tasks'

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function Tasks() {
  const [tasks, setTasks] = useState(loadTasks)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'done'
  const inputRef = useRef(null)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  function addTask(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setTasks(prev => [
      { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() },
      ...prev,
    ])
    setInput('')
    inputRef.current?.focus()
  }

  function toggleTask(id) {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function clearCompleted() {
    setTasks(prev => prev.filter(t => !t.done))
  }

  const remaining = tasks.filter(t => !t.done).length
  const total = tasks.length
  const completedCount = total - remaining

  const visible = tasks.filter(t => {
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  return (
    <div className="tasks">
      {/* Stats bar */}
      <div className="tasks__stats">
        <div className="tasks__stat">
          <span className="tasks__stat-value">{remaining}</span>
          <span className="tasks__stat-label">Remaining</span>
        </div>
        <div className="tasks__stat-divider" />
        <div className="tasks__stat">
          <span className="tasks__stat-value">{completedCount}</span>
          <span className="tasks__stat-label">Completed</span>
        </div>
        <div className="tasks__stat-divider" />
        <div className="tasks__stat">
          <span className="tasks__stat-value">{total}</span>
          <span className="tasks__stat-label">Total</span>
        </div>
        {total > 0 && (
          <div className="tasks__progress-wrap">
            <div className="tasks__progress-bar">
              <div
                className="tasks__progress-fill"
                style={{ width: `${total === 0 ? 0 : (completedCount / total) * 100}%` }}
              />
            </div>
            <span className="tasks__progress-pct">
              {total === 0 ? 0 : Math.round((completedCount / total) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Add task form */}
      <form className="tasks__form" onSubmit={addTask}>
        <input
          ref={inputRef}
          className="tasks__input"
          type="text"
          placeholder="Add a new task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={200}
        />
        <button className="tasks__add-btn" type="submit" disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </button>
      </form>

      {/* Filter tabs */}
      {total > 0 && (
        <div className="tasks__filters">
          {['all', 'active', 'done'].map(f => (
            <button
              key={f}
              className={`tasks__filter-btn ${filter === f ? 'tasks__filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && <span className="tasks__filter-count">{total}</span>}
              {f === 'active' && <span className="tasks__filter-count">{remaining}</span>}
              {f === 'done' && <span className="tasks__filter-count">{completedCount}</span>}
            </button>
          ))}
          {completedCount > 0 && (
            <button className="tasks__clear-btn" onClick={clearCompleted}>
              Clear completed
            </button>
          )}
        </div>
      )}

      {/* Task list */}
      <ul className="tasks__list">
        {visible.length === 0 && (
          <li className="tasks__empty">
            {filter === 'done'
              ? 'No completed tasks yet.'
              : filter === 'active'
              ? 'No active tasks — you\'re all caught up!'
              : 'No tasks yet. Add one above to get started.'}
          </li>
        )}
        {visible.map(task => (
          <li key={task.id} className={`tasks__item ${task.done ? 'tasks__item--done' : ''}`}>
            <button
              className="tasks__checkbox"
              onClick={() => toggleTask(task.id)}
              aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {task.done && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <span className="tasks__item-text">{task.text}</span>
            <button
              className="tasks__delete-btn"
              onClick={() => deleteTask(task.id)}
              aria-label="Delete task"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Tasks
