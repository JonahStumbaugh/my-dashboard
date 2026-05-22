import { useState, useCallback, useRef } from 'react'
import { sendChatMessage } from '../utils/anthropic.js'
import { buildSystemPrompt } from '../constants/systemPrompts.js'
import { useDashboard } from '../context/DashboardContext.jsx'

const HISTORY_KEY_PREFIX = 'dashboard_chat_'
const MAX_HISTORY = 40

function loadHistory(sectionId) {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY_PREFIX + sectionId)) || []
  } catch {
    return []
  }
}

function saveHistory(sectionId, messages) {
  const trimmed = messages.slice(-MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY_PREFIX + sectionId, JSON.stringify(trimmed))
}

export function useAIChat(sectionId) {
  const { userProfile, updateProfile, apiKey } = useDashboard()
  const [messages, setMessages] = useState(() => loadHistory(sectionId))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(false)

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return
    if (!apiKey) {
      setError('Add your Anthropic API key to start chatting.')
      return
    }

    const userMsg = { role: 'user', content: text.trim() }
    const nextMessages = [...messages, userMsg]

    setMessages(nextMessages)
    setLoading(true)
    setError(null)
    abortRef.current = false

    try {
      const systemPrompt = buildSystemPrompt(sectionId, userProfile)
      const apiMessages = nextMessages.map(m => ({ role: m.role, content: m.content }))

      const reply = await sendChatMessage({
        apiKey,
        messages: apiMessages,
        systemPrompt,
        onProfileUpdate: updateProfile,
      })

      if (abortRef.current) return

      const assistantMsg = { role: 'assistant', content: reply }
      const finalMessages = [...nextMessages, assistantMsg]
      setMessages(finalMessages)
      saveHistory(sectionId, finalMessages)
    } catch (err) {
      if (!abortRef.current) {
        setError(err.message || 'Something went wrong. Try again.')
      }
    } finally {
      if (!abortRef.current) setLoading(false)
    }
  }, [messages, loading, apiKey, sectionId, userProfile, updateProfile])

  const clearHistory = useCallback(() => {
    setMessages([])
    localStorage.removeItem(HISTORY_KEY_PREFIX + sectionId)
  }, [sectionId])

  return { messages, loading, error, sendMessage, clearHistory }
}
