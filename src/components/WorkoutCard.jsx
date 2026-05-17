import React, { useState, useEffect } from 'react'
import './WorkoutCard.css'

const STORAGE_KEY = 'dashboard_workouts'
const TYPES = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Sports', 'Walk', 'Other']
const TYPE_COLORS = {
  Strength: '#f472b6', Cardio: '#38bdf8', HIIT: '#fb923c',
  Yoga: '#a78bfa', Pilates: '#34d399', Sports: '#fbbf24',
  Walk: '#6ee7b7', Other: '#94a3b8',
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

const now = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function WorkoutCard() {
  const [workouts, setWorkouts] = useState(load)
  const [form, setForm] = useState({ exercise: '', type: 'Strength', sets: '', reps: '', duration: '', notes: '', time: now() })
  const [open, setOpen] = useState(false)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts)) }, [workouts])

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function addWorkout(e) {
    e.preventDefault()
    if (!form.exercise.trim()) return
    setWorkouts(prev => [
      { id: crypto.randomUUID(), ...form, exercise: form.exercise.trim(), notes: form.notes.trim(), createdAt: Date.now() },
      ...prev,
    ])
    setForm({ exercise: '', type: 'Strength', sets: '', reps: '', duration: '', notes: '', time: now() })
    setOpen(false)
  }

  function deleteWorkout(id) { setWorkouts(prev => prev.filter(w => w.id !== id)) }

  const today = new Date().toDateString()
  const todayWorkouts = workouts.filter(w => new Date(w.createdAt).toDateString() === today)
  const olderWorkouts = workouts.filter(w => new Date(w.createdAt).toDateString() !== today)

  return (
    <div className="ap-card workout-card">
      <div className="ap-card__header">
        <div className="ap-card__title-row">
          <div className="ap-card__icon" style={{ background: 'rgba(244,114,182,0.12)', color: 'var(--color-appearance)' }}>💪</div>
          <span className="ap-card__title">Workout Log</span>
          {todayWorkouts.length > 0 && <span className="ap-card__badge">{todayWorkouts.length} today</span>}
        </div>
        <button className="ap-btn" onClick={() => setOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Log
        </button>
      </div>

      {open && (
        <form className="ap-card__body workout-card__form" onSubmit={addWorkout}>
          <div className="ap-row">
            <input className="ap-input" placeholder="Exercise name…" value={form.exercise} onChange={e => set('exercise', e.target.value)} maxLength={80} />
            <select className="ap-input workout-card__select" value={form.type} onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="ap-row">
            <input className="ap-input" type="number" min="0" placeholder="Sets" value={form.sets} onChange={e => set('sets', e.target.value)} />
            <input className="ap-input" type="number" min="0" placeholder="Reps" value={form.reps} onChange={e => set('reps', e.target.value)} />
            <input className="ap-input" type="number" min="0" placeholder="Mins" value={form.duration} onChange={e => set('duration', e.target.value)} />
            <input className="ap-input workout-card__time" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
          <textarea className="ap-input ap-textarea" placeholder="Notes (weight, how it felt…)" value={form.notes} onChange={e => set('notes', e.target.value)} maxLength={300} style={{ minHeight: '52px' }} />
          <div className="ap-row">
            <button type="button" className="ap-btn ap-btn--ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="ap-btn" disabled={!form.exercise.trim()}>Save</button>
          </div>
        </form>
      )}

      <div className="ap-card__body">
        {workouts.length === 0 && !open && (
          <p className="ap-empty">No workouts logged yet.</p>
        )}

        {todayWorkouts.length > 0 && <div className="meals-card__section-label">Today</div>}
        {todayWorkouts.map(w => <WorkoutItem key={w.id} w={w} onDelete={deleteWorkout} />)}

        {olderWorkouts.length > 0 && (
          <>
            <div className="ap-divider" />
            <div className="meals-card__section-label">Previous</div>
            {olderWorkouts.slice(0, 8).map(w => <WorkoutItem key={w.id} w={w} onDelete={deleteWorkout} />)}
          </>
        )}
      </div>
    </div>
  )
}

function WorkoutItem({ w, onDelete }) {
  const date = new Date(w.createdAt)
  const isToday = date.toDateString() === new Date().toDateString()
  const dateLabel = isToday ? w.time : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${w.time}`
  const color = TYPE_COLORS[w.type] || '#94a3b8'

  const meta = [
    w.sets && w.reps ? `${w.sets}×${w.reps}` : w.sets ? `${w.sets} sets` : w.reps ? `${w.reps} reps` : null,
    w.duration ? `${w.duration} min` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="workout-card__item">
      <div className="workout-card__type-dot" style={{ background: color }} />
      <div className="workout-card__item-body">
        <div className="workout-card__item-top">
          <span className="workout-card__name">{w.exercise}</span>
          <span className="workout-card__type-tag" style={{ background: `${color}1a`, color }}>{w.type}</span>
          <span className="workout-card__time">{dateLabel}</span>
        </div>
        {meta && <div className="workout-card__meta">{meta}</div>}
        {w.notes && <p className="workout-card__notes">{w.notes}</p>}
      </div>
      <button className="ap-delete-btn" onClick={() => onDelete(w.id)} aria-label="Delete workout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export default WorkoutCard
