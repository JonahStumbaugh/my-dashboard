import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import MainContent from './components/MainContent.jsx'
import { DashboardProvider } from './context/DashboardContext.jsx'
import './App.css'

const SECTIONS = [
  {
    id: 'tasks',
    label: 'Daily Tasks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    color: 'var(--color-tasks)',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    color: 'var(--color-appearance)',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    color: 'var(--color-finance)',
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: 'var(--color-habits)',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    color: 'var(--color-calendar)',
  },
  {
    id: 'work',
    label: 'Work',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    ),
    color: 'var(--color-work)',
  },
]

function App() {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('dashboard_activeSection') || 'tasks'
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('dashboard_sidebarCollapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('dashboard_activeSection', activeSection)
  }, [activeSection])

  useEffect(() => {
    localStorage.setItem('dashboard_sidebarCollapsed', sidebarCollapsed)
  }, [sidebarCollapsed])

  const currentSection = SECTIONS.find(s => s.id === activeSection)

  return (
    <DashboardProvider>
      <div className="app-shell">
        <Sidebar
          sections={SECTIONS}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />
        <MainContent
          section={currentSection}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>
    </DashboardProvider>
  )
}

export default App
