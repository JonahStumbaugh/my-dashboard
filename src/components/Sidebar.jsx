import React from 'react'
import './Sidebar.css'

const CollapseIcon = ({ collapsed }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

function Sidebar({ sections, activeSection, onSectionChange, collapsed, onToggleCollapse }) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        {!collapsed && (
          <div className="sidebar__brand">
            <div className="sidebar__brand-icon">D</div>
            <div className="sidebar__brand-text">
              <span className="sidebar__brand-name">Dashboard</span>
              <span className="sidebar__brand-date">{dateStr}</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="sidebar__brand-icon sidebar__brand-icon--center">D</div>
        )}
        <button
          className="sidebar__collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`sidebar__nav-item ${activeSection === section.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => onSectionChange(section.id)}
            title={collapsed ? section.label : undefined}
            style={{ '--item-color': section.color }}
          >
            <span className="sidebar__nav-icon">{section.icon}</span>
            {!collapsed && (
              <span className="sidebar__nav-label">{section.label}</span>
            )}
            {activeSection === section.id && (
              <span className="sidebar__nav-indicator" />
            )}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar__footer">
          <div className="sidebar__footer-text">Personal Dashboard</div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
