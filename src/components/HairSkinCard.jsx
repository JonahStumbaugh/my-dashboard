import React, { useState, useEffect } from 'react'
import './HairSkinCard.css'

const STORAGE_KEY = 'dashboard_hairskin'

const DEFAULTS = {
  hair: [
    { id: 'h1', label: 'Wash hair', done: false },
    { id: 'h2', label: 'Deep condition / mask', done: false },
    { id: 'h3', label: 'Apply hair oil or serum', done: false },
    { id: 'h4', label: 'Scalp massage', done: false },
    { id: 'h5', label: 'Style / blow dry', done: false },
  ],
  skin: [
    { id: 's1', label: 'Cleanse', done: false },
    { id: 's2', label: 'Tone / essence', done: false },
    { id: 's3', label: 'Serum', done: false },
    { id: 's4', label: 'Moisturize', done: false },
    { id: 's5', label: 'SPF (morning)', done: false },
    { id: 's6', label: 'Eye cream', done: false },
    { id: 's7', label: 'Exfoliate (2–3× / week)', done: false },
  ],
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { hair: DEFAULTS.hair, skin: DEFAULTS.skin }
  } catch {
    return { hair: DEFAULTS.hair, skin: DEFAULTS.skin }
  }
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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

function HairSkinCard() {
  const [data, setData] = useState(load)
  const [tab, setTab] = useState('hair')
  const [newItem, setNewItem] = useState('')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])

  function toggle(tab, id) {
    setData(prev => ({
      ...prev,
      [tab]: prev[tab].map(item => item.id === id ? { ...item, done: !item.done } : item),
    }))
  }

  function deleteItem(tab, id) {
    setData(prev => ({ ...prev, [tab]: prev[tab].filter(item => item.id !== id) }))
  }

  function addItem(e) {
    e.preventDefault()
    const label = newItem.trim()
    if (!label) return
    setData(prev => ({
      ...prev,
      [tab]: [...prev[tab], { id: crypto.randomUUID(), label, done: false }],
    }))
    setNewItem('')
  }

  function resetAll() {
    setData(prev => ({ ...prev, [tab]: prev[tab].map(item => ({ ...item, done: false })) }))
  }

  const items = data[tab]
  const doneCount = items.filter(i => i.done).length

  return (
    <div className="ap-card hairskin-card">
      <div className="ap-card__header">
        <div className="ap-card__title-row">
          <div className="ap-card__icon" style={{ background: 'rgba(244,114,182,0.12)', color: 'var(--color-appearance)' }}>
            {tab === 'hair' ? '💆' : '✨'}
          </div>
          <span className="ap-card__title">Hair &amp; Skin</span>
          <span className="ap-card__badge">{doneCount}/{items.length}</span>
        </div>
        <button className="ap-btn ap-btn--ghost hairskin-card__reset" onClick={resetAll} title="Uncheck all">
          Reset
        </button>
      </div>

      <div className="hairskin-card__tabs">
        {['hair', 'skin'].map(t => (
          <button
            key={t}
            className={`hairskin-card__tab ${tab === t ? 'hairskin-card__tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'hair' ? '💆 Hair' : '✨ Skin'}
            <span className="hairskin-card__tab-count">
              {data[t].filter(i => i.done).length}/{data[t].length}
            </span>
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <div className="hairskin-card__progress">
          <div className="hairskin-card__progress-bar">
            <div
              className="hairskin-card__progress-fill"
              style={{ width: `${items.length === 0 ? 0 : (doneCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="ap-card__body">
        <div className="hairskin-card__list">
          {items.map(item => (
            <div key={item.id} className="ap-check-item">
              <button
                className={`ap-checkbox ${item.done ? 'ap-checkbox--checked' : ''}`}
                onClick={() => toggle(tab, item.id)}
                aria-label={item.done ? 'Uncheck' : 'Check'}
              >
                {item.done && <CheckIcon />}
              </button>
              <span className={`ap-check-label ${item.done ? 'ap-check-label--done' : ''}`}>
                {item.label}
              </span>
              <button className="ap-delete-btn" onClick={() => deleteItem(tab, item.id)} aria-label="Remove step">
                <XIcon />
              </button>
            </div>
          ))}
        </div>

        <form className="ap-add-row" onSubmit={addItem}>
          <input
            className="ap-input"
            placeholder={`Add ${tab} care step…`}
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            maxLength={80}
          />
          <button type="submit" className="ap-btn" disabled={!newItem.trim()} style={{ padding: '9px 12px' }}>
            <PlusIcon />
          </button>
        </form>
      </div>
    </div>
  )
}

export default HairSkinCard
