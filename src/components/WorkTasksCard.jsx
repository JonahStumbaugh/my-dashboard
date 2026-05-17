import React, { useState, useEffect } from 'react'
import './WorkTasksCard.css'

const KEY = 'dashboard_work_tasks'

const PRIORITIES = [
  { id: 'urgent', label: 'Urgent',  color: '#ef4444' },
  { id: 'high',   label: 'High',    color: '#f97316' },
  { id: 'medium', label: 'Medium',  color: '#eab308' },
  { id: 'low',    label: 'Low',     color: '#22c55e' },
]
const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }

const CATEGORIES = [
  'Analysis', 'Reporting', 'Client', 'Research', 'Admin', 'Compliance', 'Reconciliation', 'Other',
]

const EMPTY = () => ({
  title: '', priority: 'medium', category: 'Analysis', dueDate: '', notes: '',
})

function today() { return new Date().toISOString().split('T')[0] }

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

function isOverdue(task) {
  return !task.done && task.dueDate && task.dueDate < today()
}

function priorityColor(id) { return PRIORITIES.find(p => p.id === id)?.color ?? '#94a3b8' }

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function WorkTasksCard() {
  const [tasks, setTasks]     = useState(load)
  const [filter, setFilter]   = useState('active')  // all | active | done
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm]         = useState(EMPTY)

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(tasks)) }, [tasks])

  function setF(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function addTask(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setTasks(prev => [...prev, { id: crypto.randomUUID(), ...form, title: form.title.trim(), notes: form.notes.trim(), done: false, createdAt: Date.now() }])
    setForm(EMPTY)
    setFormOpen(false)
  }

  function toggleTask(id) { setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t)) }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)) }

  const active   = tasks.filter(t => !t.done)
  const done     = tasks.filter(t => t.done)
  const overdue  = active.filter(isOverdue).length

  const sorted = [...tasks]
    .filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      const pa = PRIORITY_ORDER[a.priority] ?? 9
      const pb = PRIORITY_ORDER[b.priority] ?? 9
      if (pa !== pb) return pa - pb
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })

  return (
    <div className="wk-card work-tasks-card">
      <div className="wk-card__header">
        <div className="wk-card__title-row">
          <span className="wk-card__icon">📋</span>
          <span className="wk-card__title">Work Tasks</span>
          <span className="wk-card__badge">{active.length} active</span>
          {overdue > 0 && <span className="work-tasks-card__overdue-badge">{overdue} overdue</span>}
        </div>
        <button className="wk-btn" onClick={() => setFormOpen(o => !o)}>
          <PlusIcon /> New Task
        </button>
      </div>

      {/* Add form */}
      {formOpen && (
        <form className="work-tasks-card__form" onSubmit={addTask}>
          <input
            className="wk-input"
            placeholder="Task title…"
            value={form.title}
            onChange={e => setF('title', e.target.value)}
            maxLength={120}
            autoFocus
          />
          <div className="wk-row">
            {/* Priority picker */}
            <div className="work-tasks-card__priority-pick">
              {PRIORITIES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`work-tasks-card__pri-btn ${form.priority === p.id ? 'work-tasks-card__pri-btn--active' : ''}`}
                  style={{ '--pcolor': p.color }}
                  onClick={() => setF('priority', p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="wk-row">
            <select className="wk-input" value={form.category} onChange={e => setF('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              className="wk-input"
              type="date"
              value={form.dueDate}
              onChange={e => setF('dueDate', e.target.value)}
              style={{ colorScheme: 'dark', flex: '0 0 auto', width: 'auto', minWidth: 130 }}
            />
          </div>
          <textarea
            className="wk-input wk-textarea"
            placeholder="Notes (optional)…"
            value={form.notes}
            onChange={e => setF('notes', e.target.value)}
            maxLength={400}
            style={{ minHeight: 56 }}
          />
          <div className="wk-row">
            <button type="button" className="wk-btn wk-btn--ghost" onClick={() => setFormOpen(false)}>Cancel</button>
            <button type="submit" className="wk-btn" disabled={!form.title.trim()}>Add Task</button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      {tasks.length > 0 && (
        <div className="work-tasks-card__filters">
          {[['active', 'Active', active.length], ['done', 'Done', done.length], ['all', 'All', tasks.length]].map(([key, label, count]) => (
            <button
              key={key}
              className={`work-tasks-card__filter-btn ${filter === key ? 'work-tasks-card__filter-btn--active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="work-tasks-card__filter-count">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      <div className="wk-card__body" style={{ gap: 4, paddingTop: tasks.length > 0 ? 8 : 16 }}>
        {sorted.length === 0 && (
          <p className="wk-empty">
            {filter === 'done' ? 'No completed tasks yet.' : 'No tasks yet. Add one above.'}
          </p>
        )}
        {sorted.map(task => (
          <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const color   = priorityColor(task.priority)
  const overdue = isOverdue(task)
  const t       = today()
  const dueSoon = !task.done && task.dueDate && task.dueDate === t

  const dueLabel = task.dueDate
    ? (() => {
        if (task.dueDate < t)  return 'Overdue'
        if (task.dueDate === t) return 'Due today'
        const d = new Date(task.dueDate + 'T12:00:00')
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })()
    : null

  return (
    <div className={`task-row ${task.done ? 'task-row--done' : ''} ${overdue ? 'task-row--overdue' : ''}`}>
      <div className="task-row__main">
        <button
          className={`task-row__checkbox ${task.done ? 'task-row__checkbox--done' : ''}`}
          style={{ '--tcolor': color }}
          onClick={() => onToggle(task.id)}
        >
          {task.done && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        <div className="task-row__body" onClick={() => task.notes && setExpanded(e => !e)}>
          <div className="task-row__top">
            <span
              className="task-row__priority-dot"
              style={{ background: color }}
              title={task.priority}
            />
            <span className="task-row__title">{task.title}</span>
          </div>
          <div className="task-row__meta">
            <span
              className="task-row__priority-tag"
              style={{ background: `${color}1a`, color }}
            >
              {PRIORITIES.find(p => p.id === task.priority)?.label}
            </span>
            <span className="task-row__cat">{task.category}</span>
            {dueLabel && (
              <span
                className={`task-row__due ${overdue ? 'task-row__due--overdue' : ''} ${dueSoon ? 'task-row__due--soon' : ''}`}
              >
                {dueLabel}
              </span>
            )}
          </div>
        </div>

        <button className="wk-delete-btn" onClick={() => onDelete(task.id)} aria-label="Delete task">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {expanded && task.notes && (
        <div className="task-row__notes">{task.notes}</div>
      )}
    </div>
  )
}

export default WorkTasksCard
