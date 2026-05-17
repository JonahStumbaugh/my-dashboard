import React, { useState, useEffect, useCallback } from 'react'
import './Habits.css'

const HABITS_KEY      = 'dashboard_habits'
const COMPLETIONS_KEY = 'dashboard_habit_completions'

const PRESET_COLORS = [
  '#f472b6', '#38bdf8', '#34d399', '#fbbf24', '#a78bfa',
  '#fb923c', '#f87171', '#60a5fa', '#e879f9', '#6ee7b7',
]

// ── helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d = new Date()) {
  return d.toISOString().split('T')[0]
}

function getWeekDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: toDateStr(d),
      short: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
      isToday: i === 6,
    }
  })
}

function calcStreak(datesArr = []) {
  const set = new Set(datesArr)
  let streak = 0
  const d = new Date()
  // Start from today if done, otherwise yesterday
  if (!set.has(toDateStr(d))) d.setDate(d.getDate() - 1)
  while (set.has(toDateStr(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

// ── sub-components ────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 12, height: 12 }}>
      <path d="M12 2c0 0-5 4.5-5 9.5a5 5 0 0010 0C17 6.5 12 2 12 2zm0 14a2.5 2.5 0 01-2.5-2.5C9.5 11 12 8 12 8s2.5 3 2.5 5.5A2.5 2.5 0 0112 16z"/>
    </svg>
  )
}

function HabitRow({ habit, dates, weekDays, today, onToggle, onDelete }) {
  const doneToday = dates.includes(today)
  const streak    = calcStreak(dates)

  return (
    <div className={`habit-row ${doneToday ? 'habit-row--done' : ''}`}>
      {/* Today checkbox */}
      <button
        className="habit-row__checkbox"
        style={{ '--hcolor': habit.color }}
        onClick={() => onToggle(habit.id, today)}
        aria-label={doneToday ? 'Unmark today' : 'Mark today complete'}
      >
        {doneToday && <CheckIcon />}
      </button>

      {/* Name + streak */}
      <div className="habit-row__info">
        <span className="habit-row__name" style={{ '--hcolor': habit.color }}>
          {habit.name}
        </span>
        {streak > 0 && (
          <span className="habit-row__streak" style={{ color: habit.color }}>
            <FlameIcon /> {streak}d
          </span>
        )}
      </div>

      {/* 7-day mini track */}
      <div className="habit-row__week">
        {weekDays.map(day => {
          const done = dates.includes(day.date)
          const isFuture = day.date > today
          return (
            <button
              key={day.date}
              className={`habit-row__day
                ${done ? 'habit-row__day--done' : ''}
                ${day.isToday ? 'habit-row__day--today' : ''}
                ${isFuture ? 'habit-row__day--future' : ''}
              `}
              style={{ '--hcolor': habit.color }}
              onClick={() => !isFuture && onToggle(habit.id, day.date)}
              disabled={isFuture}
              title={`${day.date}${done ? ' ✓' : ''}`}
              aria-label={`${day.short} ${done ? 'done' : 'not done'}`}
            />
          )
        })}
      </div>

      {/* Delete */}
      <button className="habit-row__delete" onClick={() => onDelete(habit.id)} aria-label="Delete habit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

function WeekGrid({ habits, completions, weekDays, today }) {
  if (habits.length === 0) return null

  return (
    <div className="week-grid">
      {/* Column headers */}
      <div className="week-grid__header">
        <div className="week-grid__habit-col" />
        {weekDays.map(day => (
          <div
            key={day.date}
            className={`week-grid__day-header ${day.isToday ? 'week-grid__day-header--today' : ''}`}
          >
            {day.short}
          </div>
        ))}
        <div className="week-grid__streak-col">Streak</div>
      </div>

      {/* Rows */}
      {habits.map(habit => {
        const dates  = completions[habit.id] || []
        const streak = calcStreak(dates)
        return (
          <div key={habit.id} className="week-grid__row">
            <div className="week-grid__habit-name">
              <div className="week-grid__dot" style={{ background: habit.color }} />
              <span>{habit.name}</span>
            </div>
            {weekDays.map(day => {
              const done     = dates.includes(day.date)
              const isFuture = day.date > today
              return (
                <div
                  key={day.date}
                  className={`week-grid__cell ${day.isToday ? 'week-grid__cell--today' : ''}`}
                >
                  <div
                    className={`week-grid__pip
                      ${done ? 'week-grid__pip--done' : ''}
                      ${isFuture ? 'week-grid__pip--future' : ''}
                    `}
                    style={done ? { background: habit.color } : {}}
                  />
                </div>
              )
            })}
            <div className="week-grid__streak-val" style={{ color: streak > 0 ? habit.color : 'var(--color-text-faint)' }}>
              {streak > 0 ? `🔥 ${streak}` : '—'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

function Habits() {
  const [habits, setHabits] = useState(() => loadJSON(HABITS_KEY, []))
  const [completions, setCompletions] = useState(() => loadJSON(COMPLETIONS_KEY, {}))
  const [formOpen, setFormOpen] = useState(false)
  const [newName, setNewName]   = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  useEffect(() => { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)) }, [habits])
  useEffect(() => { localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions)) }, [completions])

  const weekDays = getWeekDays()
  const today    = toDateStr()

  // ── mutations ──
  function addHabit(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setHabits(prev => [...prev, { id: crypto.randomUUID(), name, color: newColor, createdAt: Date.now() }])
    setNewName('')
    setNewColor(PRESET_COLORS[habits.length % PRESET_COLORS.length])
    setFormOpen(false)
  }

  function deleteHabit(id) {
    setHabits(prev => prev.filter(h => h.id !== id))
    setCompletions(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const toggleCompletion = useCallback((habitId, date) => {
    setCompletions(prev => {
      const existing = new Set(prev[habitId] || [])
      existing.has(date) ? existing.delete(date) : existing.add(date)
      return { ...prev, [habitId]: Array.from(existing) }
    })
  }, [])

  // ── stats ──
  const completedToday = habits.filter(h => (completions[h.id] || []).includes(today)).length
  const todayRate      = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

  const weeklyDone  = habits.reduce((sum, h) => {
    const dates = completions[h.id] || []
    return sum + weekDays.filter(d => d.date <= today && dates.includes(d.date)).length
  }, 0)
  const weeklyTotal    = habits.length * weekDays.filter(d => d.date <= today).length
  const weeklyRate     = weeklyTotal > 0 ? Math.round((weeklyDone / weeklyTotal) * 100) : 0

  const allStreaks  = habits.map(h => calcStreak(completions[h.id] || []))
  const bestStreak = allStreaks.length > 0 ? Math.max(...allStreaks) : 0

  const monthLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="habits">

      {/* ── Stats ── */}
      <div className="habits__stats">
        <div className="habits__stat">
          <span className="habits__stat-value" style={{ color: 'var(--color-habits)' }}>{todayRate}%</span>
          <span className="habits__stat-label">Today</span>
        </div>
        <div className="habits__stat-divider" />
        <div className="habits__stat">
          <span className="habits__stat-value" style={{ color: 'var(--color-habits)' }}>{weeklyRate}%</span>
          <span className="habits__stat-label">This Week</span>
        </div>
        <div className="habits__stat-divider" />
        <div className="habits__stat">
          <span className="habits__stat-value" style={{ color: 'var(--color-habits)' }}>
            {bestStreak > 0 ? `🔥 ${bestStreak}` : '—'}
          </span>
          <span className="habits__stat-label">Best Streak</span>
        </div>
        <div className="habits__stat-divider" />
        <div className="habits__stat">
          <span className="habits__stat-value">{completedToday}/{habits.length}</span>
          <span className="habits__stat-label">Done Today</span>
        </div>
        <div className="habits__stat-date">{monthLabel}</div>
      </div>

      {/* ── Today's habits card ── */}
      <div className="habits__card">
        <div className="habits__card-header">
          <div className="habits__card-title-row">
            <span className="habits__card-icon">⚡</span>
            <span className="habits__card-title">Daily Habits</span>
            {habits.length > 0 && (
              <span className="habits__card-badge">{completedToday}/{habits.length}</span>
            )}
          </div>
          <button className="habits__add-btn" onClick={() => setFormOpen(o => !o)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Habit
          </button>
        </div>

        {/* Progress bar for today */}
        {habits.length > 0 && (
          <div className="habits__today-progress">
            <div className="habits__today-bar">
              <div
                className="habits__today-fill"
                style={{ width: `${todayRate}%` }}
              />
            </div>
            <span className="habits__today-pct">{todayRate}%</span>
          </div>
        )}

        {/* Add form */}
        {formOpen && (
          <form className="habits__form" onSubmit={addHabit}>
            <input
              className="habits__form-input"
              placeholder="Habit name (e.g. Meditate, Exercise, Read)…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={60}
              autoFocus
            />
            <div className="habits__form-row">
              <div className="habits__color-picker">
                <span className="habits__color-label">Color:</span>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`habits__color-swatch ${newColor === c ? 'habits__color-swatch--active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
            {/* Preview */}
            {newName.trim() && (
              <div className="habits__form-preview" style={{ '--hcolor': newColor }}>
                <div className="habits__form-preview-dot" />
                <span>{newName.trim()}</span>
              </div>
            )}
            <div className="habits__form-actions">
              <button type="button" className="habits__btn habits__btn--ghost" onClick={() => setFormOpen(false)}>Cancel</button>
              <button type="submit" className="habits__btn" disabled={!newName.trim()}>Add Habit</button>
            </div>
          </form>
        )}

        {/* Habit list */}
        <div className="habits__list">
          {habits.length === 0 && !formOpen && (
            <p className="habits__empty">No habits yet. Add one above to start building your streaks.</p>
          )}

          {/* Day-column labels above the mini-tracks */}
          {habits.length > 0 && (
            <div className="habits__day-labels">
              <div className="habits__day-labels-spacer" />
              {weekDays.map(day => (
                <div
                  key={day.date}
                  className={`habits__day-label ${day.isToday ? 'habits__day-label--today' : ''}`}
                >
                  {day.short}
                </div>
              ))}
              <div className="habits__day-labels-end" />
            </div>
          )}

          {habits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              dates={completions[habit.id] || []}
              weekDays={weekDays}
              today={today}
              onToggle={toggleCompletion}
              onDelete={deleteHabit}
            />
          ))}
        </div>
      </div>

      {/* ── Weekly overview grid ── */}
      {habits.length > 0 && (
        <div className="habits__card">
          <div className="habits__card-header">
            <div className="habits__card-title-row">
              <span className="habits__card-icon">📅</span>
              <span className="habits__card-title">Weekly Overview</span>
              <span className="habits__card-badge">{weeklyDone}/{weeklyTotal} completions</span>
            </div>
          </div>
          <div className="habits__card-body">
            <WeekGrid
              habits={habits}
              completions={completions}
              weekDays={weekDays}
              today={today}
            />
          </div>
        </div>
      )}

    </div>
  )
}

export default Habits
