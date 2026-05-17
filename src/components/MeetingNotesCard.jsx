import React, { useState, useEffect } from 'react'
import './MeetingNotesCard.css'

const KEY = 'dashboard_work_meetings'

const MEETING_TYPES = ['Team Standup', '1:1', 'Client Call', 'Project Review', 'Training', 'All Hands', 'Other']

const EMPTY = () => ({
  title: '', type: 'Team Standup', date: new Date().toISOString().split('T')[0],
  attendees: '', notes: '', actionItems: '',
})

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 864e5).toISOString().split('T')[0]
  if (str === today)     return 'Today'
  if (str === yesterday) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function MeetingNotesCard() {
  const [meetings, setMeetings]   = useState(load)
  const [formOpen, setFormOpen]   = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [expanded, setExpanded]   = useState(new Set())
  const [search, setSearch]       = useState('')

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(meetings)) }, [meetings])

  function setF(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function addMeeting(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const id = crypto.randomUUID()
    setMeetings(prev => [
      { id, ...form, title: form.title.trim(), attendees: form.attendees.trim(), notes: form.notes.trim(), actionItems: form.actionItems.trim(), createdAt: Date.now() },
      ...prev,
    ])
    setExpanded(prev => new Set([...prev, id]))
    setForm(EMPTY)
    setFormOpen(false)
  }

  function deleteMeeting(id) {
    setMeetings(prev => prev.filter(m => m.id !== id))
    setExpanded(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  function toggleExpanded(id) {
    setExpanded(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const filtered = meetings
    .filter(m =>
      !search.trim() ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.attendees.toLowerCase().includes(search.toLowerCase()) ||
      m.notes.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)

  return (
    <div className="wk-card meeting-notes-card">
      <div className="wk-card__header">
        <div className="wk-card__title-row">
          <span className="wk-card__icon">📝</span>
          <span className="wk-card__title">Meeting Notes</span>
          {meetings.length > 0 && <span className="wk-card__badge">{meetings.length}</span>}
        </div>
        <button className="wk-btn" onClick={() => setFormOpen(o => !o)}>
          <PlusIcon /> Log Meeting
        </button>
      </div>

      {/* Add form */}
      {formOpen && (
        <form className="meeting-notes-card__form" onSubmit={addMeeting}>
          <div className="wk-row">
            <input
              className="wk-input"
              placeholder="Meeting title…"
              value={form.title}
              onChange={e => setF('title', e.target.value)}
              maxLength={100}
              autoFocus
            />
            <select
              className="wk-input"
              value={form.type}
              onChange={e => setF('type', e.target.value)}
              style={{ flex: '0 0 auto', width: 'auto', minWidth: 140 }}
            >
              {MEETING_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="wk-row">
            <input
              className="wk-input"
              type="date"
              value={form.date}
              onChange={e => setF('date', e.target.value)}
              style={{ colorScheme: 'dark', flex: '0 0 auto', width: 'auto', minWidth: 130 }}
            />
            <input
              className="wk-input"
              placeholder="Attendees (e.g. John, Sarah, Manager)…"
              value={form.attendees}
              onChange={e => setF('attendees', e.target.value)}
              maxLength={200}
            />
          </div>
          <textarea
            className="wk-input wk-textarea"
            placeholder="Meeting notes & key discussion points…"
            value={form.notes}
            onChange={e => setF('notes', e.target.value)}
            maxLength={2000}
            style={{ minHeight: 90 }}
          />
          <textarea
            className="wk-input wk-textarea"
            placeholder="Action items (one per line)…"
            value={form.actionItems}
            onChange={e => setF('actionItems', e.target.value)}
            maxLength={1000}
            style={{ minHeight: 60 }}
          />
          <div className="wk-row">
            <button type="button" className="wk-btn wk-btn--ghost" onClick={() => setFormOpen(false)}>Cancel</button>
            <button type="submit" className="wk-btn" disabled={!form.title.trim()}>Save Notes</button>
          </div>
        </form>
      )}

      {/* Search */}
      {meetings.length > 2 && (
        <div className="meeting-notes-card__search-wrap">
          <input
            className="wk-input meeting-notes-card__search"
            placeholder="Search meetings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Meeting list */}
      <div className="wk-card__body" style={{ gap: 8 }}>
        {filtered.length === 0 && (
          <p className="wk-empty">
            {search ? 'No meetings match your search.' : 'No meeting notes yet. Log your first one above.'}
          </p>
        )}
        {filtered.map(meeting => {
          const isOpen      = expanded.has(meeting.id)
          const actionLines = meeting.actionItems
            ? meeting.actionItems.split('\n').map(l => l.trim()).filter(Boolean)
            : []
          const attendeeList = meeting.attendees
            ? meeting.attendees.split(/[,;]/).map(a => a.trim()).filter(Boolean)
            : []

          return (
            <div key={meeting.id} className={`meeting-card ${isOpen ? 'meeting-card--open' : ''}`}>
              {/* Header row */}
              <button className="meeting-card__header" onClick={() => toggleExpanded(meeting.id)}>
                <div className="meeting-card__header-left">
                  <span className="meeting-card__type-dot" />
                  <div className="meeting-card__header-text">
                    <span className="meeting-card__title">{meeting.title}</span>
                    <div className="meeting-card__meta">
                      <span className="meeting-card__type-tag">{meeting.type}</span>
                      <span className="meeting-card__date">{formatDate(meeting.date)}</span>
                      {attendeeList.length > 0 && (
                        <span className="meeting-card__attendees">
                          {attendeeList.length} attendee{attendeeList.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {actionLines.length > 0 && (
                        <span className="meeting-card__action-badge">{actionLines.length} action{actionLines.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="meeting-card__header-right">
                  <div className="meeting-card__chevron"><ChevronIcon open={isOpen} /></div>
                  <button
                    className="wk-delete-btn"
                    style={{ opacity: 1 }}
                    onClick={e => { e.stopPropagation(); deleteMeeting(meeting.id) }}
                    aria-label="Delete meeting"
                  >
                    <XIcon />
                  </button>
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="meeting-card__body">
                  {attendeeList.length > 0 && (
                    <div className="meeting-card__section">
                      <div className="meeting-card__section-label">Attendees</div>
                      <div className="meeting-card__chips">
                        {attendeeList.map((a, i) => (
                          <span key={i} className="meeting-card__chip">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {meeting.notes && (
                    <div className="meeting-card__section">
                      <div className="meeting-card__section-label">Notes</div>
                      <p className="meeting-card__notes">{meeting.notes}</p>
                    </div>
                  )}

                  {actionLines.length > 0 && (
                    <div className="meeting-card__section">
                      <div className="meeting-card__section-label">Action Items</div>
                      <ul className="meeting-card__actions">
                        {actionLines.map((line, i) => (
                          <li key={i} className="meeting-card__action-item">
                            <span className="meeting-card__action-bullet" />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MeetingNotesCard
