import React, { useState, useEffect } from 'react'
import './GroomingCard.css'

const STORAGE_KEY = 'dashboard_grooming'

const DEFAULTS = [
  { id: 'g1', label: 'Shower', done: false },
  { id: 'g2', label: 'Brush & floss teeth', done: false },
  { id: 'g3', label: 'Deodorant / body spray', done: false },
  { id: 'g4', label: 'Shave / trim beard', done: false },
  { id: 'g5', label: 'Cologne / fragrance', done: false },
  { id: 'g6', label: 'Trim / clean nails', done: false },
  { id: 'g7', label: 'Eyebrows', done: false },
  { id: 'g8', label: 'Ear & nose hair check', done: false },
  { id: 'g9', label: 'Iron / pick outfit', done: false },
  { id: 'g10', label: 'Overall mirror check', done: false },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function GroomingCard() {
  const [items, setItems] = useState(load)
  const [newItem, setNewItem] = useState('')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) }, [items])

  function toggle(id) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item))
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  function addItem(e) {
    e.preventDefault()
    const label = newItem.trim()
    if (!label) return
    setItems(prev => [...prev, { id: crypto.randomUUID(), label, done: false }])
    setNewItem('')
  }

  function resetAll() {
    setItems(prev => prev.map(item => ({ ...item, done: false })))
  }

  const doneCount = items.filter(i => i.done).length
  const total = items.length
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100)
  const allDone = doneCount === total && total > 0

  return (
    <div className="ap-card grooming-card">
      <div className="ap-card__header">
        <div className="ap-card__title-row">
          <div className="ap-card__icon" style={{ background: 'rgba(244,114,182,0.12)', color: 'var(--color-appearance)' }}>🪞</div>
          <span className="ap-card__title">Grooming</span>
          {allDone
            ? <span className="grooming-card__done-badge">All done ✓</span>
            : <span className="ap-card__badge">{doneCount}/{total}</span>
          }
        </div>
        <button className="ap-btn ap-btn--ghost grooming-card__reset" onClick={resetAll} title="Uncheck all">
          Reset
        </button>
      </div>

      {total > 0 && (
        <div className="grooming-card__progress-row">
          <div className="grooming-card__progress-bar">
            <div className="grooming-card__progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="grooming-card__pct">{pct}%</span>
        </div>
      )}

      <div className="ap-card__body">
        <div className="grooming-card__grid">
          {items.map(item => (
            <div key={item.id} className="ap-check-item grooming-card__item">
              <button
                className={`ap-checkbox ${item.done ? 'ap-checkbox--checked' : ''}`}
                onClick={() => toggle(item.id)}
                aria-label={item.done ? 'Uncheck' : 'Check'}
              >
                {item.done && <CheckIcon />}
              </button>
              <span className={`ap-check-label ${item.done ? 'ap-check-label--done' : ''}`}>
                {item.label}
              </span>
              <button className="ap-delete-btn" onClick={() => deleteItem(item.id)} aria-label="Remove item">
                <XIcon />
              </button>
            </div>
          ))}
        </div>

        <form className="ap-add-row" onSubmit={addItem}>
          <input
            className="ap-input"
            placeholder="Add grooming item…"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            maxLength={80}
          />
          <button type="submit" className="ap-btn" disabled={!newItem.trim()} style={{ padding: '9px 12px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default GroomingCard
