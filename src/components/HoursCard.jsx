import React, { useState, useEffect } from 'react'
import './HoursCard.css'

const KEY = 'dashboard_work_hours'
const TARGET_KEY = 'dashboard_work_hours_target'
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function getWeekMonday(offset = 0) {
  const d = new Date()
  const day = d.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day // days back to Monday
  d.setDate(d.getDate() + diff + offset * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getWeekDates(offset = 0) {
  const monday = getWeekMonday(offset)
  return DAYS.map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { label, date: toDateStr(d) }
  })
}

function formatWeekRange(offset = 0) {
  const days = getWeekDates(offset)
  const first = new Date(days[0].date + 'T12:00:00')
  const last  = new Date(days[4].date + 'T12:00:00')
  const opts  = { month: 'short', day: 'numeric' }
  return `${first.toLocaleDateString('en-US', opts)} – ${last.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}

function loadTarget() {
  try { return parseFloat(localStorage.getItem(TARGET_KEY)) || 40 } catch { return 40 }
}

function HoursCard() {
  const [hours, setHours]         = useState(load)
  const [weekOffset, setOffset]   = useState(0)
  const [target, setTarget]       = useState(loadTarget)
  const [editingTarget, setEditingTarget] = useState(false)
  const [targetInput, setTargetInput]     = useState('')

  const today   = toDateStr(new Date())
  const weekDays = getWeekDates(weekOffset)

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(hours)) }, [hours])
  useEffect(() => { localStorage.setItem(TARGET_KEY, String(target)) }, [target])

  function setDayHours(date, val) {
    const h = parseFloat(val)
    setHours(prev => ({
      ...prev,
      [date]: isNaN(h) || val === '' ? undefined : Math.min(Math.max(h, 0), 24),
    }))
  }

  function saveTarget() {
    const val = parseFloat(targetInput)
    if (!isNaN(val) && val > 0) setTarget(val)
    setEditingTarget(false)
  }

  const weekTotal = weekDays.reduce((sum, d) => sum + (hours[d.date] || 0), 0)
  const pct       = Math.min((weekTotal / target) * 100, 100)
  const barColor  = pct >= 100 ? '#34d399' : pct >= 75 ? '#fbbf24' : 'var(--color-work)'

  const isCurrentWeek = weekOffset === 0
  const todayInWeek   = weekDays.some(d => d.date === today)

  return (
    <div className="wk-card hours-card">
      <div className="wk-card__header">
        <div className="wk-card__title-row">
          <span className="wk-card__icon">⏱️</span>
          <span className="wk-card__title">Hours Worked</span>
        </div>
        <div className="hours-card__nav">
          <button className="hours-card__nav-btn" onClick={() => setOffset(o => o - 1)} title="Previous week">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="hours-card__week-label">{formatWeekRange(weekOffset)}</span>
          <button
            className="hours-card__nav-btn"
            onClick={() => setOffset(o => o + 1)}
            disabled={weekOffset >= 0}
            title="Next week"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {!isCurrentWeek && (
            <button className="wk-btn wk-btn--ghost wk-btn--sm" onClick={() => setOffset(0)}>
              Now
            </button>
          )}
        </div>
      </div>

      <div className="wk-card__body">
        {/* Day inputs */}
        <div className="hours-card__days">
          {weekDays.map(({ label, date }) => {
            const val     = hours[date]
            const isToday = date === today
            const isPast  = date < today
            return (
              <div key={date} className={`hours-card__day ${isToday ? 'hours-card__day--today' : ''}`}>
                <span className="hours-card__day-label">{label}</span>
                <input
                  className="hours-card__day-input"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  placeholder={isPast || isToday ? '0' : '—'}
                  value={val ?? ''}
                  onChange={e => setDayHours(date, e.target.value)}
                  disabled={date > today}
                />
                {val !== undefined && val > 0 && (
                  <span className="hours-card__day-bar">
                    <span
                      className="hours-card__day-fill"
                      style={{ height: `${Math.min((val / 10) * 100, 100)}%`, background: 'var(--color-work)' }}
                    />
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Weekly summary */}
        <div className="hours-card__summary">
          <div className="hours-card__summary-row">
            <div className="hours-card__total">
              <span className="hours-card__total-val" style={{ color: barColor }}>
                {weekTotal % 1 === 0 ? weekTotal : weekTotal.toFixed(1)}h
              </span>
              <span className="hours-card__total-label">this week</span>
            </div>
            <div className="hours-card__target-wrap">
              <span className="hours-card__target-label">Goal:</span>
              {editingTarget ? (
                <div className="hours-card__target-edit">
                  <input
                    className="hours-card__target-input"
                    type="number"
                    min="1"
                    max="80"
                    value={targetInput}
                    onChange={e => setTargetInput(e.target.value)}
                    onBlur={saveTarget}
                    onKeyDown={e => { if (e.key === 'Enter') saveTarget(); if (e.key === 'Escape') setEditingTarget(false) }}
                    autoFocus
                  />
                  <span className="hours-card__target-unit">h</span>
                </div>
              ) : (
                <button
                  className="hours-card__target-btn"
                  onClick={() => { setTargetInput(String(target)); setEditingTarget(true) }}
                >
                  {target}h/wk
                </button>
              )}
            </div>
          </div>
          <div className="hours-card__progress-bar">
            <div className="hours-card__progress-fill" style={{ width: `${pct}%`, background: barColor }} />
          </div>
          <div className="hours-card__progress-meta">
            <span>{Math.round(pct)}% of weekly goal</span>
            {weekTotal < target && <span>{(target - weekTotal).toFixed(1)}h remaining</span>}
            {weekTotal >= target && <span style={{ color: '#34d399' }}>Goal reached ✓</span>}
          </div>
        </div>

        {/* Daily average */}
        {weekTotal > 0 && (
          <div className="hours-card__avg">
            {(weekTotal / weekDays.filter(d => (hours[d.date] || 0) > 0).length).toFixed(1)}h avg per worked day
          </div>
        )}
      </div>
    </div>
  )
}

export default HoursCard
