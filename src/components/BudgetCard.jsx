import React, { useState, useEffect } from 'react'
import { EXPENSE_CATS, CAT_COLORS, DEFAULT_BUDGET_LIMITS, fmt, currentMonthPrefix } from './financeConstants.js'
import './BudgetCard.css'

const LIMITS_KEY = 'dashboard_budget_limits'

function loadLimits() {
  try { return JSON.parse(localStorage.getItem(LIMITS_KEY)) || DEFAULT_BUDGET_LIMITS }
  catch { return DEFAULT_BUDGET_LIMITS }
}

function progressColor(pct) {
  if (pct >= 100) return '#f87171'
  if (pct >= 80) return '#fbbf24'
  return '#34d399'
}

function BudgetCard({ transactions }) {
  const [limits, setLimits] = useState(loadLimits)
  const [editing, setEditing] = useState(null) // category being edited
  const [editVal, setEditVal] = useState('')

  useEffect(() => { localStorage.setItem(LIMITS_KEY, JSON.stringify(limits)) }, [limits])

  const monthPfx = currentMonthPrefix()
  const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthPfx))

  // Spent per category this month
  const spent = {}
  EXPENSE_CATS.forEach(cat => { spent[cat] = 0 })
  monthExpenses.forEach(t => { if (spent[t.category] !== undefined) spent[t.category] += t.amount })

  const totalBudget = EXPENSE_CATS.reduce((s, c) => s + (limits[c] || 0), 0)
  const totalSpent = EXPENSE_CATS.reduce((s, c) => s + spent[c], 0)
  const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  function startEdit(cat) {
    setEditing(cat)
    setEditVal(String(limits[cat] || 0))
  }

  function saveEdit(cat) {
    const val = parseFloat(editVal)
    if (!isNaN(val) && val >= 0) {
      setLimits(prev => ({ ...prev, [cat]: val }))
    }
    setEditing(null)
  }

  function handleEditKey(e, cat) {
    if (e.key === 'Enter') saveEdit(cat)
    if (e.key === 'Escape') setEditing(null)
  }

  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="fin-card budget-card">
      <div className="fin-card__header">
        <div className="fin-card__title-row">
          <div className="fin-card__icon">📊</div>
          <span className="fin-card__title">Monthly Budget</span>
          <span className="fin-card__badge">{month}</span>
        </div>
        <div className="budget-card__totals">
          <span className="budget-card__total-spent">{fmt(totalSpent)}</span>
          <span className="budget-card__total-sep">/</span>
          <span className="budget-card__total-limit">{fmt(totalBudget)}</span>
        </div>
      </div>

      {/* Overall progress */}
      <div className="budget-card__overall">
        <div className="budget-card__overall-bar">
          <div
            className="budget-card__overall-fill"
            style={{ width: `${Math.min(overallPct, 100)}%`, background: progressColor(overallPct) }}
          />
        </div>
        <span className="budget-card__overall-pct" style={{ color: progressColor(overallPct) }}>
          {overallPct}% used
        </span>
      </div>

      <div className="fin-card__body" style={{ gap: '10px' }}>
        <p className="budget-card__hint">Click any limit to edit it.</p>
        {EXPENSE_CATS.map(cat => {
          const limit = limits[cat] || 0
          const s = spent[cat] || 0
          const pct = limit > 0 ? Math.min((s / limit) * 100, 100) : s > 0 ? 100 : 0
          const color = CAT_COLORS[cat] || '#94a3b8'
          const barColor = progressColor(limit > 0 ? (s / limit) * 100 : s > 0 ? 101 : 0)
          const over = s > limit && limit > 0

          return (
            <div key={cat} className="budget-card__row">
              <div className="budget-card__cat-dot" style={{ background: color }} />
              <div className="budget-card__row-body">
                <div className="budget-card__row-top">
                  <span className="budget-card__cat-name">{cat}</span>
                  <div className="budget-card__amounts">
                    <span className="budget-card__spent" style={{ color: over ? '#f87171' : 'var(--color-text-muted)' }}>
                      {fmt(s)}
                    </span>
                    <span className="budget-card__sep">/</span>
                    {editing === cat ? (
                      <div className="budget-card__edit-wrap">
                        <span className="budget-card__edit-dollar">$</span>
                        <input
                          className="budget-card__edit-input"
                          type="number"
                          min="0"
                          step="1"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => saveEdit(cat)}
                          onKeyDown={e => handleEditKey(e, cat)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button className="budget-card__limit-btn" onClick={() => startEdit(cat)}>
                        {fmt(limit)}
                      </button>
                    )}
                    {over && <span className="budget-card__over-tag">Over</span>}
                  </div>
                </div>
                <div className="budget-card__bar-wrap">
                  <div className="fin-progress">
                    <div className="fin-progress__fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <span className="budget-card__pct">{Math.round(pct)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BudgetCard
