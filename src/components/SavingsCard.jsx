import React, { useState, useEffect } from 'react'
import { fmt } from './financeConstants.js'
import './SavingsCard.css'

const STORAGE_KEY = 'dashboard_savings'

const GOAL_COLORS = ['#34d399', '#38bdf8', '#a78bfa', '#fbbf24', '#f472b6', '#fb923c', '#60a5fa']

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

function SavingsCard() {
  const [goals, setGoals] = useState(load)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', current: '', deadline: '' })
  const [contributing, setContributing] = useState(null) // goal id being contributed to
  const [contribVal, setContribVal] = useState('')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)) }, [goals])

  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }

  function addGoal(e) {
    e.preventDefault()
    const target = parseFloat(form.target)
    const current = parseFloat(form.current) || 0
    if (!form.name.trim() || !target || target <= 0) return
    setGoals(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        target,
        current,
        deadline: form.deadline,
        colorIdx: prev.length % GOAL_COLORS.length,
        createdAt: Date.now(),
      },
    ])
    setForm({ name: '', target: '', current: '', deadline: '' })
    setOpen(false)
  }

  function deleteGoal(id) { setGoals(prev => prev.filter(g => g.id !== id)) }

  function addContribution(id) {
    const amount = parseFloat(contribVal)
    if (!amount || amount <= 0) return
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: Math.min(g.current + amount, g.target) } : g))
    setContributing(null)
    setContribVal('')
  }

  function setCurrentDirectly(id, val) {
    const amount = parseFloat(val)
    if (isNaN(amount) || amount < 0) return
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: Math.min(amount, g.target) } : g))
  }

  const totalSaved = goals.reduce((s, g) => s + g.current, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target, 0)

  return (
    <div className="fin-card savings-card">
      <div className="fin-card__header">
        <div className="fin-card__title-row">
          <div className="fin-card__icon">🎯</div>
          <span className="fin-card__title">Savings Goals</span>
          {goals.length > 0 && <span className="fin-card__badge">{goals.length}</span>}
        </div>
        <button className="fin-btn" onClick={() => setOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Goal
        </button>
      </div>

      {goals.length > 0 && (
        <div className="savings-card__summary">
          <div className="savings-card__summary-bar">
            <div
              className="savings-card__summary-fill"
              style={{ width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%` }}
            />
          </div>
          <div className="savings-card__summary-text">
            <span>{fmt(totalSaved)} saved</span>
            <span className="savings-card__summary-sep">of</span>
            <span>{fmt(totalTarget)} total</span>
          </div>
        </div>
      )}

      {open && (
        <form className="fin-card__body savings-card__form" onSubmit={addGoal}>
          <input className="fin-input" placeholder="Goal name (e.g. Emergency Fund, Vacation)…" value={form.name} onChange={e => set('name', e.target.value)} maxLength={60} />
          <div className="fin-row">
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 600, pointerEvents: 'none' }}>$</span>
              <input className="fin-input" style={{ paddingLeft: 26 }} type="number" min="1" step="0.01" placeholder="Target amount" value={form.target} onChange={e => set('target', e.target.value)} />
            </div>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 600, pointerEvents: 'none' }}>$</span>
              <input className="fin-input" style={{ paddingLeft: 26 }} type="number" min="0" step="0.01" placeholder="Already saved" value={form.current} onChange={e => set('current', e.target.value)} />
            </div>
          </div>
          <div className="fin-row">
            <label className="savings-card__date-label">
              <span>Target date (optional)</span>
              <input className="fin-input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} style={{ colorScheme: 'dark' }} />
            </label>
          </div>
          <div className="fin-row">
            <button type="button" className="fin-btn fin-btn--ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="fin-btn" disabled={!form.name.trim() || !form.target}>Save Goal</button>
          </div>
        </form>
      )}

      <div className="fin-card__body" style={{ gap: '16px' }}>
        {goals.length === 0 && !open && (
          <p className="fin-empty">No savings goals yet. Add one to get started.</p>
        )}
        {goals.map(goal => {
          const pct = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
          const color = GOAL_COLORS[goal.colorIdx] || GOAL_COLORS[0]
          const remaining = Math.max(goal.target - goal.current, 0)
          const done = goal.current >= goal.target

          const deadline = goal.deadline
            ? new Date(goal.deadline + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : null

          return (
            <div key={goal.id} className="savings-card__goal">
              <div className="savings-card__goal-header">
                <div className="savings-card__goal-left">
                  <div className="savings-card__goal-dot" style={{ background: color }} />
                  <div>
                    <div className="savings-card__goal-name">{goal.name}</div>
                    {deadline && <div className="savings-card__goal-deadline">by {deadline}</div>}
                  </div>
                </div>
                <div className="savings-card__goal-right">
                  {done
                    ? <span className="savings-card__goal-done">Reached ✓</span>
                    : <span className="savings-card__goal-remaining">{fmt(remaining)} left</span>
                  }
                  <button className="fin-delete-btn" style={{ opacity: 1 }} onClick={() => deleteGoal(goal.id)} aria-label="Delete goal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="savings-card__goal-bar-row">
                <div className="fin-progress" style={{ height: 8 }}>
                  <div className="fin-progress__fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="savings-card__goal-pct">{Math.round(pct)}%</span>
              </div>

              <div className="savings-card__goal-amounts">
                <span style={{ color }}>{fmt(goal.current)}</span>
                <span className="savings-card__goal-amounts-sep">saved of</span>
                <span>{fmt(goal.target)}</span>
              </div>

              {/* Contribute */}
              {!done && (
                contributing === goal.id ? (
                  <div className="savings-card__contrib-row">
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 13, pointerEvents: 'none' }}>+$</span>
                      <input
                        className="fin-input"
                        style={{ paddingLeft: 28, padding: '7px 10px 7px 28px' }}
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Amount…"
                        value={contribVal}
                        onChange={e => setContribVal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addContribution(goal.id); if (e.key === 'Escape') { setContributing(null); setContribVal('') } }}
                        autoFocus
                      />
                    </div>
                    <button className="fin-btn" style={{ padding: '7px 12px' }} onClick={() => addContribution(goal.id)} disabled={!contribVal || parseFloat(contribVal) <= 0}>Add</button>
                    <button className="fin-btn fin-btn--ghost" style={{ padding: '7px 10px' }} onClick={() => { setContributing(null); setContribVal('') }}>✕</button>
                  </div>
                ) : (
                  <button
                    className="savings-card__contrib-btn"
                    onClick={() => { setContributing(goal.id); setContribVal('') }}
                    style={{ '--goal-color': color }}
                  >
                    + Add contribution
                  </button>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SavingsCard
