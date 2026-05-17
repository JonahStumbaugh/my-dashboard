import React, { useState, useEffect, useRef } from 'react'
import './Calendar.css'

// ─── constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dashboard_calendar_events'

const CATEGORIES = [
  { id: 'work',      label: 'Work',      color: '#38bdf8' },
  { id: 'personal',  label: 'Personal',  color: '#34d399' },
  { id: 'health',    label: 'Health',    color: '#f472b6' },
  { id: 'finance',   label: 'Finance',   color: '#fbbf24' },
  { id: 'social',    label: 'Social',    color: '#a78bfa' },
  { id: 'important', label: 'Important', color: '#f87171' },
  { id: 'other',     label: 'Other',     color: '#94a3b8' },
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function loadEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

function catColor(categoryId) {
  return CATEGORIES.find(c => c.id === categoryId)?.color ?? '#94a3b8'
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDayHeading(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const today = toDateStr()
  const tomorrow = toDateStr(new Date(Date.now() + 864e5))
  if (dateStr === today) return 'Today'
  if (dateStr === tomorrow) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function buildCalendarCells(year, month) {
  const firstDow   = new Date(year, month, 1).getDay()          // 0=Sun
  const daysInMon  = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells = []

  // tail of previous month
  for (let i = firstDow - 1; i >= 0; i--) {
    const pm = month === 0 ? 11 : month - 1
    const py = month === 0 ? year - 1 : year
    cells.push({ date: toDateStr(new Date(py, pm, daysInPrev - i)), current: false })
  }

  // current month
  for (let d = 1; d <= daysInMon; d++) {
    cells.push({ date: toDateStr(new Date(year, month, d)), current: true })
  }

  // head of next month
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nm = month === 11 ? 0 : month + 1
    const ny = month === 11 ? year + 1 : year
    cells.push({ date: toDateStr(new Date(ny, nm, d)), current: false })
  }

  return cells
}

// ─── sub-components ───────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
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

// Event chip shown inside a calendar cell
function EventChip({ event }) {
  const color = catColor(event.category)
  return (
    <div className="cal-cell__chip" style={{ '--ecolor': color }}>
      {event.time && <span className="cal-cell__chip-time">{formatTime(event.time)}</span>}
      <span className="cal-cell__chip-title">{event.title}</span>
    </div>
  )
}

// Single day cell in the grid
function CalCell({ cell, eventsOnDay, today, selectedDate, onSelect }) {
  const isToday    = cell.date === today
  const isSelected = cell.date === selectedDate
  const visible    = eventsOnDay.slice(0, 2)
  const overflow   = eventsOnDay.length - visible.length

  return (
    <button
      className={`cal-cell
        ${!cell.current ? 'cal-cell--other' : ''}
        ${isToday ? 'cal-cell--today' : ''}
        ${isSelected ? 'cal-cell--selected' : ''}
      `}
      onClick={() => onSelect(cell.date)}
      aria-label={cell.date}
    >
      <span className="cal-cell__num">{parseInt(cell.date.split('-')[2], 10)}</span>
      <div className="cal-cell__events">
        {visible.map(ev => <EventChip key={ev.id} event={ev} />)}
        {overflow > 0 && (
          <span className="cal-cell__overflow">+{overflow} more</span>
        )}
      </div>
    </button>
  )
}

// Right-panel event card (for day view and upcoming list)
function EventCard({ event, onDelete, compact }) {
  const color = catColor(event.category)
  const cat   = CATEGORIES.find(c => c.id === event.category)

  return (
    <div className={`ev-card ${compact ? 'ev-card--compact' : ''}`} style={{ '--ecolor': color }}>
      <div className="ev-card__bar" />
      <div className="ev-card__body">
        <div className="ev-card__top">
          <span className="ev-card__title">{event.title}</span>
          <button className="ev-card__delete" onClick={() => onDelete(event.id)} aria-label="Delete event">
            <XIcon />
          </button>
        </div>
        <div className="ev-card__meta">
          {event.time && (
            <span className="ev-card__time">
              {formatTime(event.time)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ''}
            </span>
          )}
          {cat && (
            <span className="ev-card__cat" style={{ color }}>
              {cat.label}
            </span>
          )}
        </div>
        {event.notes && <p className="ev-card__notes">{event.notes}</p>}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

const EMPTY_FORM = () => ({
  title: '', date: toDateStr(), time: '', endTime: '', category: 'personal', notes: '',
})

function Calendar() {
  const [events, setEvents]           = useState(loadEvents)
  const [viewYear, setViewYear]       = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth]     = useState(() => new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState(toDateStr)
  const [formOpen, setFormOpen]       = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const titleRef                      = useRef(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) }, [events])

  // Focus title when form opens
  useEffect(() => { if (formOpen) setTimeout(() => titleRef.current?.focus(), 50) }, [formOpen])

  // ── mutations ──

  function setF(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function openForm(date) {
    setForm({ ...EMPTY_FORM(), date: date || selectedDate })
    setFormOpen(true)
  }

  function closeForm() { setFormOpen(false); setForm(EMPTY_FORM()) }

  function saveEvent(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setEvents(prev => [
      ...prev,
      { id: crypto.randomUUID(), ...form, title: form.title.trim(), notes: form.notes.trim(), createdAt: Date.now() },
    ])
    setSelectedDate(form.date)
    closeForm()
  }

  function deleteEvent(id) { setEvents(prev => prev.filter(ev => ev.id !== id)) }

  // ── navigation ──

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function goToday() {
    const now = new Date()
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
    setSelectedDate(toDateStr())
  }

  // ── derived data ──

  const today  = toDateStr()
  const cells  = buildCalendarCells(viewYear, viewMonth)

  const eventsByDate = {}
  events.forEach(ev => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = []
    eventsByDate[ev.date].push(ev)
  })
  // Sort events within each day by time
  Object.keys(eventsByDate).forEach(d => {
    eventsByDate[d].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  })

  const selectedEvents = eventsByDate[selectedDate] || []

  const upcoming = events
    .filter(ev => ev.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
    .slice(0, 20)

  // Group upcoming by date
  const upcomingGroups = []
  const upcomingSeen   = new Set()
  upcoming.forEach(ev => {
    if (!upcomingSeen.has(ev.date)) {
      upcomingSeen.add(ev.date)
      upcomingGroups.push({ date: ev.date, events: [] })
    }
    upcomingGroups[upcomingGroups.length - 1].events.push(ev)
  })

  const monthLabel = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="calendar">

      {/* ── Add event form ── */}
      {formOpen && (
        <div className="cal-form-card">
          <div className="cal-form-card__header">
            <span className="cal-form-card__title">New Event</span>
            <button className="cal-form-card__close" onClick={closeForm}><XIcon /></button>
          </div>
          <form className="cal-form" onSubmit={saveEvent}>
            <input
              ref={titleRef}
              className="cal-input"
              placeholder="Event title…"
              value={form.title}
              onChange={e => setF('title', e.target.value)}
              maxLength={80}
            />
            <div className="cal-form__row">
              <input
                className="cal-input"
                type="date"
                value={form.date}
                onChange={e => setF('date', e.target.value)}
                style={{ colorScheme: 'dark', flex: '1 1 140px' }}
              />
              <input
                className="cal-input"
                type="time"
                value={form.time}
                onChange={e => setF('time', e.target.value)}
                placeholder="Start time"
                style={{ colorScheme: 'dark', flex: '1 1 110px' }}
              />
              <input
                className="cal-input"
                type="time"
                value={form.endTime}
                onChange={e => setF('endTime', e.target.value)}
                placeholder="End time"
                style={{ colorScheme: 'dark', flex: '1 1 110px' }}
              />
            </div>
            <div className="cal-form__cats">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`cal-form__cat-btn ${form.category === cat.id ? 'cal-form__cat-btn--active' : ''}`}
                  style={{ '--ccolor': cat.color }}
                  onClick={() => setF('category', cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <textarea
              className="cal-input cal-input--textarea"
              placeholder="Notes (optional)…"
              value={form.notes}
              onChange={e => setF('notes', e.target.value)}
              maxLength={300}
            />
            <div className="cal-form__row">
              <button type="button" className="cal-btn cal-btn--ghost" onClick={closeForm}>Cancel</button>
              <button type="submit" className="cal-btn" disabled={!form.title.trim()}>Save Event</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Month grid card ── */}
      <div className="cal-card">
        <div className="cal-card__header">
          <div className="cal-nav">
            <button className="cal-nav__btn" onClick={prevMonth} aria-label="Previous month"><ChevronLeft /></button>
            <h2 className="cal-nav__label">{monthLabel}</h2>
            <button className="cal-nav__btn" onClick={nextMonth} aria-label="Next month"><ChevronRight /></button>
          </div>
          <div className="cal-card__header-actions">
            <button className="cal-btn cal-btn--ghost cal-btn--sm" onClick={goToday}>Today</button>
            <button className="cal-btn cal-btn--sm" onClick={() => openForm(selectedDate)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Event
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="cal-weekdays">
          {WEEKDAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
        </div>

        {/* Day grid */}
        <div className="cal-grid">
          {cells.map(cell => (
            <CalCell
              key={cell.date}
              cell={cell}
              eventsOnDay={eventsByDate[cell.date] || []}
              today={today}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom panels ── */}
      <div className="cal-panels">

        {/* Selected day panel */}
        <div className="cal-card cal-panel">
          <div className="cal-card__header">
            <div className="cal-card__title-row">
              <span className="cal-card__icon">📌</span>
              <span className="cal-card__title">{formatDayHeading(selectedDate)}</span>
              {selectedEvents.length > 0 && (
                <span className="cal-card__badge">{selectedEvents.length}</span>
              )}
            </div>
            <button className="cal-btn cal-btn--sm" onClick={() => openForm(selectedDate)}>+ Event</button>
          </div>
          <div className="cal-panel__body">
            {selectedEvents.length === 0 ? (
              <p className="cal-empty">No events on this day.</p>
            ) : (
              <div className="cal-event-list">
                {selectedEvents.map(ev => (
                  <EventCard key={ev.id} event={ev} onDelete={deleteEvent} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming events panel */}
        <div className="cal-card cal-panel">
          <div className="cal-card__header">
            <div className="cal-card__title-row">
              <span className="cal-card__icon">🗓️</span>
              <span className="cal-card__title">Upcoming</span>
              {upcoming.length > 0 && <span className="cal-card__badge">{upcoming.length}</span>}
            </div>
          </div>
          <div className="cal-panel__body">
            {upcomingGroups.length === 0 ? (
              <p className="cal-empty">No upcoming events. Add one to get started.</p>
            ) : (
              <div className="cal-upcoming-list">
                {upcomingGroups.map(group => (
                  <div key={group.date} className="cal-upcoming-group">
                    <div className={`cal-upcoming-group__label ${group.date === today ? 'cal-upcoming-group__label--today' : ''}`}>
                      {formatDayHeading(group.date)}
                    </div>
                    {group.events.map(ev => (
                      <EventCard key={ev.id} event={ev} onDelete={deleteEvent} compact />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Calendar
