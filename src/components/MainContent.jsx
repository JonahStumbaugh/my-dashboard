import React from 'react'
import Tasks from './Tasks.jsx'
import Appearance from './Appearance.jsx'
import Finance from './Finance.jsx'
import Habits from './Habits.jsx'
import './MainContent.css'

const PLACEHOLDERS = {
  tasks: {
    emoji: '✅',
    title: 'Daily Tasks',
    description: 'Your to-do list and daily priorities will live here.',
    preview: ['Morning routine', 'Review meeting notes', 'Complete project report', 'Gym session'],
  },
  appearance: {
    emoji: '💪',
    title: 'Appearance Tracker',
    description: 'Track workouts, diet, hair, skin care, and grooming.',
    preview: ['Workout log', 'Meal tracker', 'Hair care routine', 'Skin care log', 'Grooming checklist'],
  },
  finance: {
    emoji: '💰',
    title: 'Finance Tracker',
    description: 'Monitor your budget, expenses, savings, and income.',
    preview: ['Monthly budget', 'Recent transactions', 'Savings goals', 'Spending breakdown'],
  },
  habits: {
    emoji: '📈',
    title: 'Habit Tracker',
    description: 'Build streaks and monitor your daily habits.',
    preview: ['Morning meditation', 'Read 30 min', 'Exercise', 'No social media after 10pm'],
  },
  calendar: {
    emoji: '📅',
    title: 'Calendar & Schedule',
    description: 'Manage your schedule, events, and time blocks.',
    preview: ['9:00 AM — Team standup', '11:00 AM — Client call', '2:00 PM — Focus block', '5:30 PM — Gym'],
  },
  work: {
    emoji: '🏦',
    title: 'Work — Finance Internship',
    description: 'Internship tasks, deliverables, notes, and learning goals.',
    preview: ['Pending deliverables', 'Meeting notes', 'Learning goals', 'Deal pipeline tracker'],
  },
}

function MainContent({ section, sidebarCollapsed }) {
  if (!section) return null

  const placeholder = PLACEHOLDERS[section.id] || null

  return (
    <main
      className={`main-content ${sidebarCollapsed ? 'main-content--expanded' : ''}`}
    >
      <div className="main-content__topbar">
        <div className="main-content__title-group">
          <span
            className="main-content__section-dot"
            style={{ backgroundColor: section.color }}
          />
          <h1 className="main-content__title">{section.label}</h1>
        </div>
        <div className="main-content__topbar-meta">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      <div className="main-content__body">
        {section.id === 'tasks' ? (
          <Tasks />
        ) : section.id === 'appearance' ? (
          <Appearance />
        ) : section.id === 'finance' ? (
          <Finance />
        ) : section.id === 'habits' ? (
          <Habits />
        ) : (
          <>
            <div className="placeholder-card">
              <div className="placeholder-card__emoji">{placeholder.emoji}</div>
              <h2 className="placeholder-card__title">{placeholder.title}</h2>
              <p className="placeholder-card__description">{placeholder.description}</p>

              <div className="placeholder-card__preview">
                <p className="placeholder-card__preview-label">Coming soon:</p>
                <ul className="placeholder-card__preview-list">
                  {placeholder.preview.map((item, i) => (
                    <li key={i} className="placeholder-card__preview-item">
                      <span
                        className="placeholder-card__preview-dot"
                        style={{ backgroundColor: section.color }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="placeholder-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="placeholder-widget">
                  <div
                    className="placeholder-widget__bar"
                    style={{ backgroundColor: section.color }}
                  />
                  <div className="placeholder-widget__shimmer">
                    <div className="shimmer-line shimmer-line--short" />
                    <div className="shimmer-line shimmer-line--medium" />
                    <div className="shimmer-line shimmer-line--long" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default MainContent
