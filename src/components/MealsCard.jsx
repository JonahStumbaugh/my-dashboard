import React, { useState, useEffect, useRef } from 'react'
import './MealsCard.css'

const STORAGE_KEY = 'dashboard_meals'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

function compressImage(file, maxPx = 700, quality = 0.65) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const now = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink']

function MealsCard() {
  const [meals, setMeals] = useState(load)
  const [form, setForm] = useState({ name: '', type: 'Breakfast', time: now(), notes: '', photo: null })
  const [preview, setPreview] = useState(null)
  const [open, setOpen] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const fileRef = useRef()

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(meals)) }, [meals])

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const compressed = await compressImage(file)
    setForm(f => ({ ...f, photo: compressed }))
    setPreview(compressed)
  }

  function addMeal(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setMeals(prev => [
      { id: crypto.randomUUID(), ...form, name: form.name.trim(), notes: form.notes.trim(), createdAt: Date.now() },
      ...prev,
    ])
    setForm({ name: '', type: 'Breakfast', time: now(), notes: '', photo: null })
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
    setOpen(false)
  }

  function deleteMeal(id) { setMeals(prev => prev.filter(m => m.id !== id)) }

  const today = new Date().toDateString()
  const todayMeals = meals.filter(m => new Date(m.createdAt).toDateString() === today)
  const olderMeals = meals.filter(m => new Date(m.createdAt).toDateString() !== today)

  const cals = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎', Drink: '💧' }

  return (
    <div className="ap-card meals-card">
      <div className="ap-card__header">
        <div className="ap-card__title-row">
          <div className="ap-card__icon" style={{ background: 'rgba(244,114,182,0.12)', color: 'var(--color-appearance)' }}>🍽️</div>
          <span className="ap-card__title">Meals & Diet</span>
          {todayMeals.length > 0 && <span className="ap-card__badge">{todayMeals.length} today</span>}
        </div>
        <button className="ap-btn" onClick={() => setOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Log Meal
        </button>
      </div>

      {open && (
        <form className="meals-card__form ap-card__body" onSubmit={addMeal}>
          <div className="ap-row">
            <input className="ap-input" placeholder="Meal name…" value={form.name} onChange={e => set('name', e.target.value)} maxLength={100} />
            <select className="ap-input meals-card__select" value={form.type} onChange={e => set('type', e.target.value)}>
              {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input className="ap-input meals-card__time" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
          <textarea className="ap-input ap-textarea" placeholder="Notes (calories, ingredients, how you felt…)" value={form.notes} onChange={e => set('notes', e.target.value)} maxLength={400} />

          <div className="meals-card__photo-row">
            <button type="button" className="ap-btn ap-btn--ghost meals-card__photo-btn" onClick={() => fileRef.current?.click()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {preview ? 'Change photo' : 'Add photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            {preview && (
              <div className="meals-card__photo-preview">
                <img src={preview} alt="Meal preview" />
                <button type="button" className="meals-card__photo-remove" onClick={() => { setPreview(null); setForm(f => ({ ...f, photo: null })); if (fileRef.current) fileRef.current.value = '' }}>✕</button>
              </div>
            )}
          </div>

          <div className="ap-row">
            <button type="button" className="ap-btn ap-btn--ghost" onClick={() => { setOpen(false); setPreview(null) }}>Cancel</button>
            <button type="submit" className="ap-btn" disabled={!form.name.trim()}>Save Meal</button>
          </div>
        </form>
      )}

      <div className="ap-card__body">
        {todayMeals.length === 0 && !open && (
          <p className="ap-empty">No meals logged today. Hit "Log Meal" to start.</p>
        )}

        {todayMeals.length > 0 && (
          <div className="meals-card__section-label">Today</div>
        )}
        <div className="meals-card__list">
          {todayMeals.map(meal => (
            <MealItem key={meal.id} meal={meal} cals={cals} onDelete={deleteMeal} onLightbox={setLightbox} />
          ))}
        </div>

        {olderMeals.length > 0 && (
          <>
            <div className="ap-divider" />
            <div className="meals-card__section-label">Previous</div>
            <div className="meals-card__list">
              {olderMeals.slice(0, 10).map(meal => (
                <MealItem key={meal.id} meal={meal} cals={cals} onDelete={deleteMeal} onLightbox={setLightbox} />
              ))}
            </div>
          </>
        )}
      </div>

      {lightbox && (
        <div className="meals-card__lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Meal" onClick={e => e.stopPropagation()} />
          <button className="meals-card__lightbox-close" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  )
}

function MealItem({ meal, cals, onDelete, onLightbox }) {
  const date = new Date(meal.createdAt)
  const isToday = date.toDateString() === new Date().toDateString()
  const dateLabel = isToday ? meal.time : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${meal.time}`

  return (
    <div className="meals-card__item">
      {meal.photo && (
        <button className="meals-card__thumb-btn" onClick={() => onLightbox(meal.photo)}>
          <img className="meals-card__thumb" src={meal.photo} alt={meal.name} />
        </button>
      )}
      <div className="meals-card__item-body">
        <div className="meals-card__item-top">
          <span className="meals-card__item-icon">{cals[meal.type] || '🍽️'}</span>
          <span className="meals-card__item-name">{meal.name}</span>
          <span className="meals-card__item-type">{meal.type}</span>
          <span className="meals-card__item-time">{dateLabel}</span>
        </div>
        {meal.notes && <p className="meals-card__item-notes">{meal.notes}</p>}
      </div>
      <button className="ap-delete-btn" onClick={() => onDelete(meal.id)} aria-label="Delete meal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export default MealsCard
