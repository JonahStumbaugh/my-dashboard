import React, { useState } from 'react'
import { EXPENSE_CATS, INCOME_CATS, CAT_COLORS, fmt, today, currentMonthPrefix } from './financeConstants.js'
import './TransactionsCard.css'

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function TransactionsCard({ transactions, onChange }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({
    type: 'expense', amount: '', category: EXPENSE_CATS[0], description: '', date: today(),
  })

  function set(field, val) {
    setForm(f => {
      const next = { ...f, [field]: val }
      if (field === 'type') {
        next.category = val === 'income' ? INCOME_CATS[0] : EXPENSE_CATS[0]
      }
      return next
    })
  }

  function addTx(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0 || !form.description.trim()) return
    onChange(prev => [
      { id: crypto.randomUUID(), ...form, amount, description: form.description.trim(), createdAt: Date.now() },
      ...prev,
    ])
    setForm(f => ({ ...f, amount: '', description: '', date: today() }))
    setOpen(false)
  }

  function deleteTx(id) { onChange(prev => prev.filter(t => t.id !== id)) }

  const monthPfx = currentMonthPrefix()
  const thisMonth = transactions.filter(t => t.date.startsWith(monthPfx))
  const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = income - expenses

  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS

  const visible = transactions.filter(t => {
    if (filter === 'income') return t.type === 'income'
    if (filter === 'expense') return t.type === 'expense'
    return true
  })

  // Group by date label
  const todayStr = today()
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  const yStr = yesterday.toISOString().split('T')[0]

  const groups = []
  const seen = new Set()
  visible.forEach(t => {
    const label = t.date === todayStr ? 'Today' : t.date === yStr ? 'Yesterday'
      : new Date(t.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    if (!seen.has(label)) { seen.add(label); groups.push({ label, items: [] }) }
    groups[groups.length - 1].items.push(t)
  })

  return (
    <div className="fin-card tx-card">
      {/* Stats bar */}
      <div className="tx-card__stats">
        <div className="tx-card__stat">
          <span className="tx-card__stat-label">Income</span>
          <span className="tx-card__stat-value tx-card__stat-value--income">{fmt(income)}</span>
        </div>
        <div className="tx-card__stat-divider" />
        <div className="tx-card__stat">
          <span className="tx-card__stat-label">Expenses</span>
          <span className="tx-card__stat-value tx-card__stat-value--expense">{fmt(expenses)}</span>
        </div>
        <div className="tx-card__stat-divider" />
        <div className="tx-card__stat">
          <span className="tx-card__stat-label">Net</span>
          <span className={`tx-card__stat-value ${net >= 0 ? 'tx-card__stat-value--income' : 'tx-card__stat-value--expense'}`}>
            {net >= 0 ? '+' : ''}{fmt(net)}
          </span>
        </div>
        <div className="tx-card__stat-month">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="fin-card__header" style={{ borderTop: '1px solid var(--color-border)', borderBottom: 'none' }}>
        <div className="fin-card__title-row">
          <div className="fin-card__icon">💸</div>
          <span className="fin-card__title">Transactions</span>
          {transactions.length > 0 && <span className="fin-card__badge">{transactions.length}</span>}
        </div>
        <button className="fin-btn" onClick={() => setOpen(o => !o)}>
          <PlusIcon /> Add
        </button>
      </div>

      {open && (
        <form className="tx-card__form fin-card__body" onSubmit={addTx}>
          {/* Type toggle */}
          <div className="tx-card__type-toggle">
            {['expense', 'income'].map(t => (
              <button
                key={t}
                type="button"
                className={`tx-card__type-btn ${form.type === t ? `tx-card__type-btn--${t}` : ''}`}
                onClick={() => set('type', t)}
              >
                {t === 'income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>

          <div className="fin-row">
            <div className="tx-card__amount-wrap">
              <span className="tx-card__dollar">$</span>
              <input
                className="fin-input tx-card__amount-input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
              />
            </div>
            <select className="fin-input" value={form.category} onChange={e => set('category', e.target.value)}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fin-row">
            <input
              className="fin-input"
              placeholder="Description…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              maxLength={100}
            />
            <input
              className="fin-input tx-card__date"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>
          <div className="fin-row">
            <button type="button" className="fin-btn fin-btn--ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="fin-btn" disabled={!form.amount || !form.description.trim()}>Save</button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      {transactions.length > 0 && (
        <div className="tx-card__filters">
          {[['all', 'All', transactions.length], ['income', 'Income', transactions.filter(t => t.type === 'income').length], ['expense', 'Expenses', transactions.filter(t => t.type === 'expense').length]].map(([key, label, count]) => (
            <button
              key={key}
              className={`tx-card__filter-btn ${filter === key ? 'tx-card__filter-btn--active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label} <span className="tx-card__filter-count">{count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="fin-card__body" style={{ gap: 0 }}>
        {visible.length === 0 && (
          <p className="fin-empty">No transactions yet. Add one above.</p>
        )}
        {groups.map(group => (
          <div key={group.label} className="tx-card__group">
            <div className="tx-card__group-label">{group.label}</div>
            {group.items.map(tx => (
              <div key={tx.id} className="tx-card__item">
                <div
                  className="tx-card__cat-dot"
                  style={{ background: CAT_COLORS[tx.category] || '#94a3b8' }}
                />
                <div className="tx-card__item-body">
                  <span className="tx-card__desc">{tx.description}</span>
                  <span className="tx-card__cat">{tx.category}</span>
                </div>
                <span className={`tx-card__amount ${tx.type === 'income' ? 'tx-card__amount--income' : 'tx-card__amount--expense'}`}>
                  {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
                </span>
                <button className="fin-delete-btn" onClick={() => deleteTx(tx.id)} aria-label="Delete">
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransactionsCard
