import React, { useState, useEffect } from 'react'
import TransactionsCard from './TransactionsCard.jsx'
import BudgetCard from './BudgetCard.jsx'
import SavingsCard from './SavingsCard.jsx'
import SpendingCard from './SpendingCard.jsx'
import './Finance.css'

const TX_KEY = 'dashboard_transactions'

function loadTx() {
  try { return JSON.parse(localStorage.getItem(TX_KEY)) || [] } catch { return [] }
}

function Finance() {
  const [transactions, setTransactions] = useState(loadTx)

  useEffect(() => {
    localStorage.setItem(TX_KEY, JSON.stringify(transactions))
  }, [transactions])

  return (
    <div className="finance">
      <div className="finance__grid">
        <div className="finance__col finance__col--full">
          <TransactionsCard transactions={transactions} onChange={setTransactions} />
        </div>
        <div className="finance__col finance__col--full">
          <BudgetCard transactions={transactions} />
        </div>
        <div className="finance__col">
          <SavingsCard />
        </div>
        <div className="finance__col">
          <SpendingCard transactions={transactions} />
        </div>
      </div>
    </div>
  )
}

export default Finance
