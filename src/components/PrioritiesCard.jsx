import React, { useState, useEffect, useRef } from 'react'
import './PrioritiesCard.css'

const KEY = 'dashboard_work_priorities'

function toDateStr(d = new Date()) {
  return d.toISOString().split('T')[0]
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

function PrioritiesCard() {
  const [items, setItems] = useState(load)
  const [input, setInput] = useState('')
  const inputRef = useRef()

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)) }, [items])

  const today = toDateStr()
  const todayItems = items.filter(i => i.date === today)
  const prevItems  = items.filter(i => i.date !== today && !i.done)

  function add(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setItems(prev => [...prev, { id: crypto.randomUUID(), text, done: false, date: today, createdAt: Date.now() }])
    setInput('')
    inputRef.current?.focus()
  }

  function toggle(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  function remove(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function clearDone() {
    setItems(prev => prev.filter(i => !i.done))
  }

  const doneCount  = todayItems.filter(i => i.done).length
  const totalToday = todayItems.length
  const pct        = totalToday > 0 ? Math.round((doneCount / totalToday) * 100) : 0

  return (
    <div className="wk-card priorities-card">
      <div className="wk-card__header">
        <div className="wk-card__title-row">
          <span className="wk-card__icon">🎯</span>
          <span className="wk-card__title">Daily Priorities</span>
          {totalToday > 0 && (
            <span className="wk-card__badge">{doneCount}/{totalToday}</span>
          )}
        </div>
        {doneCount > 0 && (
          <button className="wk-btn wk-btn--ghost wk-btn--sm" onClick={clearDone}>
            Clear done
          </button>
        )}
      </div>

      {/* Progress */}
      {totalToday > 0 && (
        <div className="priorities-card__progress-row">
          <div className="priorities-card__progress-bar">
            <div className="priorities-card__progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="priorities-card__pct" style={{ color: pct === 100 ? '#34d399' : 'var(--color-work)' }}>
            {pct === 100 ? '✓ Done' : `${pct}%`}
          </span>
        </div>
      )}

      <div className="wk-card__body">
        {/* Add form */}
        <form className="priorities-card__form" onSubmit={add}>
          <input
            ref={inputRef}
            className="wk-input"
            placeholder="Add a priority for today…"
            value={input}
            onChange={e => setInput(e.target.value)}
            maxLength={120}
          />
          <button type="submit" className="wk-btn" disabled={!input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </button>
        </form>

        {/* Today's items */}
        {todayItems.length === 0 && prevItems.length === 0 && (
          <p className="wk-empty">No priorities set. Add your top goals for today.</p>
        )}

        {todayItems.length > 0 && (
          <div className="priorities-card__list">
            {todayItems.map((item, idx) => (
              <PriorityItem
                key={item.id}
                item={item}
                rank={idx + 1}
                onToggle={toggle}
                onDelete={remove}
              />
            ))}
          </div>
        )}

        {/* Carried-over unfinished from previous days */}
        {prevItems.length > 0 && (
          <>
            <div className="wk-divider" />
            <div className="wk-section-label">Carried over</div>
            <div className="priorities-card__list">
              {prevItems.slice(0, 5).map((item, idx) => (
                <PriorityItem
                  key={item.id}
                  item={item}
                  rank={null}
                  onToggle={toggle}
                  onDelete={remove}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PriorityItem({ item, rank, onToggle, onDelete }) {
  return (
    <div className={`priority-item ${item.done ? 'priority-item--done' : ''}`}>
      {rank !== null && (
        <span className="priority-item__rank">{rank}</span>
      )}
      <button
        className={`priority-item__check ${item.done ? 'priority-item__check--done' : ''}`}
        onClick={() => onToggle(item.id)}
        aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
      >
        {item.done && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <span className="priority-item__text">{item.text}</span>
      <button className="wk-delete-btn" onClick={() => onDelete(item.id)} aria-label="Delete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export default PrioritiesCard
