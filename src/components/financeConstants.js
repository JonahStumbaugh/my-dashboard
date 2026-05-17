export const EXPENSE_CATS = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Bills & Utilities', 'Housing', 'Education', 'Personal Care', 'Other',
]

export const INCOME_CATS = ['Salary', 'Freelance', 'Investment', 'Bonus', 'Gift', 'Other']

export const CAT_COLORS = {
  'Food & Dining':    '#f472b6',
  'Transport':        '#38bdf8',
  'Shopping':         '#a78bfa',
  'Entertainment':    '#fbbf24',
  'Health':           '#34d399',
  'Bills & Utilities':'#fb923c',
  'Housing':          '#f87171',
  'Education':        '#60a5fa',
  'Personal Care':    '#e879f9',
  'Other':            '#94a3b8',
  // income
  'Salary':     '#34d399',
  'Freelance':  '#6ee7b7',
  'Investment': '#38bdf8',
  'Bonus':      '#fbbf24',
  'Gift':       '#f472b6',
}

export const DEFAULT_BUDGET_LIMITS = {
  'Food & Dining':     400,
  'Transport':         150,
  'Shopping':          200,
  'Entertainment':     100,
  'Health':            100,
  'Bills & Utilities': 300,
  'Housing':          1200,
  'Education':         100,
  'Personal Care':      80,
  'Other':             100,
}

export const fmt = n =>
  '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const today = () => new Date().toISOString().split('T')[0]

export const currentMonthPrefix = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
