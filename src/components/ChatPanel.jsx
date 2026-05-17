import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAIChat } from '../hooks/useAIChat.js'
import { useDashboard } from '../context/DashboardContext.jsx'
import './ChatPanel.css'

const SECTION_LABELS = {
  tasks: 'Task Assistant',
  appearance: 'Wellness Coach',
  finance: 'Finance Coach',
  habits: 'Habit Coach',
  calendar: 'Schedule Coach',
  work: 'Work Mentor',
}

const SECTION_HINTS = {
  tasks: 'Ask about prioritizing tasks, productivity tips, or breaking down goals…',
  appearance: 'Ask about workouts, meal ideas, skin care, or grooming routines…',
  finance: 'Ask about budgeting, saving strategies, or understanding your spending…',
  habits: 'Ask about building habits, understanding your streaks, or staying consistent…',
  calendar: 'Ask about scheduling, time blocking, or managing your week…',
  work: 'Ask about work tasks, banking concepts, career advice, or meeting prep…',
}

function ApiKeySetup({ accent }) {
  const { setApiKey } = useDashboard()
  const [draft, setDraft] = useState('')

  function save() {
    const trimmed = draft.trim()
    if (trimmed) setApiKey(trimmed)
  }

  return (
    <div className="api-key-banner">
      <div className="api-key-banner__title">🔑 Connect your Anthropic API key</div>
      <p className="api-key-banner__desc">
        To use the AI chat, add your Anthropic API key. It's stored only in your browser's localStorage — never sent anywhere except directly to Anthropic.
      </p>
      <div className="api-key-banner__row">
        <input
          className="api-key-banner__input"
          type="password"
          placeholder="sk-ant-..."
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          autoComplete="off"
          spellCheck={false}
        />
        <button className="api-key-banner__save" style={{ background: accent }} onClick={save} disabled={!draft.trim()}>
          Save
        </button>
      </div>
    </div>
  )
}

function ChatMessage({ msg }) {
  return (
    <div className={`chat-msg chat-msg--${msg.role}`}>
      <div className="chat-msg__bubble">{msg.content}</div>
    </div>
  )
}

function ChatPanel({ sectionId, sectionColor }) {
  const [open, setOpen] = useState(false)
  const { apiKey, userProfile } = useDashboard()
  const { messages, loading, error, sendMessage, clearHistory } = useAIChat(sectionId)
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)

  const accent = sectionColor || 'var(--color-accent)'
  const label = SECTION_LABELS[sectionId] || 'AI Assistant'
  const hint = SECTION_HINTS[sectionId] || 'Ask me anything…'

  const profileKnown = !!(userProfile.name || userProfile.age || userProfile.fitnessGoals?.length || userProfile.financialGoals?.length)

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading, open])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text || loading) return
    setDraft('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    sendMessage(text)
  }, [draft, loading, sendMessage])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e) {
    setDraft(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
  }

  return (
    <div
      className={`chat-panel ${open ? 'chat-panel--open' : 'chat-panel--collapsed'}`}
      style={{ '--accent': accent }}
    >
      <div className="chat-panel__header" onClick={() => setOpen(o => !o)}>
        <span className="chat-panel__header-icon">✨</span>
        <span className="chat-panel__header-title">{label}</span>
        {profileKnown && <span className="chat-panel__profile-badge">profile ●</span>}
        {messages.length > 0 && (
          <span className="chat-panel__profile-badge">{messages.length / 2 | 0} msgs</span>
        )}
        <svg className="chat-panel__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </div>

      {open && (
        <div className="chat-panel__body">
          {!apiKey ? (
            <ApiKeySetup accent={accent} />
          ) : (
            <>
              <div className="chat-panel__messages">
                {messages.length === 0 && (
                  <div className="chat-panel__empty">
                    <strong>{label}</strong>
                    {hint}
                    <br /><br />
                    I'll remember what you share across all sections.
                  </div>
                )}
                {messages.map((msg, i) => (
                  <ChatMessage key={i} msg={msg} />
                ))}
                {loading && (
                  <div className="chat-panel__typing">
                    <span /><span /><span />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && <div className="chat-panel__error">{error}</div>}

              <div className="chat-panel__footer">
                <textarea
                  ref={el => { inputRef.current = el; textareaRef.current = el }}
                  className="chat-panel__input"
                  placeholder={hint}
                  value={draft}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={loading}
                />
                <div className="chat-panel__actions">
                  {messages.length > 0 && (
                    <button className="chat-panel__clear" onClick={clearHistory} title="Clear history">
                      Clear
                    </button>
                  )}
                  <button
                    className="chat-panel__send"
                    onClick={handleSend}
                    disabled={!draft.trim() || loading}
                    style={{ background: accent }}
                    aria-label="Send"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatPanel
