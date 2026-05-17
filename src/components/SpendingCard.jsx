import React from 'react'
import { EXPENSE_CATS, CAT_COLORS, fmt, currentMonthPrefix } from './financeConstants.js'
import './SpendingCard.css'

function SpendingCard({ transactions }) {
  const monthPfx = currentMonthPrefix()
  const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthPfx))
  const total = monthExpenses.reduce((s, t) => s + t.amount, 0)

  // Aggregate by category
  const byCategory = {}
  EXPENSE_CATS.forEach(c => { byCategory[c] = 0 })
  monthExpenses.forEach(t => { if (byCategory[t.category] !== undefined) byCategory[t.category] += t.amount })

  // Sort by amount desc, filter out zeros
  const sorted = EXPENSE_CATS
    .map(cat => ({ cat, amount: byCategory[cat] }))
    .filter(e => e.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const txCount = monthExpenses.length

  // Top 3 categories for the summary chips
  const topThree = sorted.slice(0, 3)

  return (
    <div className="fin-card spending-card">
      <div className="fin-card__header">
        <div className="fin-card__title-row">
          <div className="fin-card__icon">🔍</div>
          <span className="fin-card__title">Spending Breakdown</span>
          <span className="fin-card__badge">{month}</span>
        </div>
        {total > 0 && (
          <div className="spending-card__total">
            <span className="spending-card__total-value">{fmt(total)}</span>
            <span className="spending-card__total-label">total · {txCount} transaction{txCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="fin-card__body">
        {sorted.length === 0 ? (
          <p className="fin-empty">No expenses this month yet. Log some transactions to see your breakdown.</p>
        ) : (
          <>
            {/* Top category chips */}
            {topThree.length > 0 && (
              <div className="spending-card__top-chips">
                {topThree.map(({ cat, amount }) => (
                  <div key={cat} className="spending-card__chip" style={{ '--chip-color': CAT_COLORS[cat] || '#94a3b8' }}>
                    <div className="spending-card__chip-dot" />
                    <span className="spending-card__chip-cat">{cat}</span>
                    <span className="spending-card__chip-amt">{fmt(amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Bar chart */}
            <div className="spending-card__chart">
              {sorted.map(({ cat, amount }) => {
                const pct = total > 0 ? (amount / total) * 100 : 0
                const color = CAT_COLORS[cat] || '#94a3b8'

                return (
                  <div key={cat} className="spending-card__bar-row">
                    <div className="spending-card__bar-label">
                      <div className="spending-card__bar-dot" style={{ background: color }} />
                      <span className="spending-card__bar-cat">{cat}</span>
                    </div>
                    <div className="spending-card__bar-track">
                      <div
                        className="spending-card__bar-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <div className="spending-card__bar-meta">
                      <span className="spending-card__bar-amt">{fmt(amount)}</span>
                      <span className="spending-card__bar-pct">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Donut-style ring summary */}
            <div className="spending-card__ring-row">
              {sorted.map(({ cat, amount }) => {
                const pct = total > 0 ? (amount / total) * 100 : 0
                const color = CAT_COLORS[cat] || '#94a3b8'
                return (
                  <div key={cat} className="spending-card__ring-seg" title={`${cat}: ${fmt(amount)} (${pct.toFixed(1)}%)`}>
                    <div className="spending-card__ring-seg-bar" style={{ width: `${pct}%`, background: color }} />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SpendingCard
