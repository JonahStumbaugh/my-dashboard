import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const PROFILE_KEY = 'dashboard_user_profile'
const API_KEY_STORAGE = 'dashboard_anthropic_key'

const defaultProfile = {
  name: null,
  age: null,
  fitnessGoals: [],
  dietPreferences: [],
  financialGoals: [],
  workDetails: {
    role: 'Finance/Accounting Intern',
    company: 'Kish Bank',
    notes: [],
  },
  habitGoals: [],
  miscFacts: [],
  lastUpdated: null,
}

function loadProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROFILE_KEY))
    return stored ? { ...defaultProfile, ...stored } : defaultProfile
  } catch {
    return defaultProfile
  }
}

function loadApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || ''
}

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [userProfile, setUserProfile] = useState(loadProfile)
  const [apiKey, setApiKeyState] = useState(loadApiKey)

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile))
  }, [userProfile])

  const setApiKey = useCallback((key) => {
    setApiKeyState(key)
    if (key) localStorage.setItem(API_KEY_STORAGE, key)
    else localStorage.removeItem(API_KEY_STORAGE)
  }, [])

  const updateProfile = useCallback((updates) => {
    setUserProfile(prev => {
      const next = { ...prev }
      for (const [key, val] of Object.entries(updates)) {
        if (Array.isArray(next[key]) && Array.isArray(val)) {
          const merged = [...next[key]]
          for (const item of val) {
            if (!merged.includes(item)) merged.push(item)
          }
          next[key] = merged
        } else if (typeof next[key] === 'object' && next[key] !== null && typeof val === 'object' && val !== null && !Array.isArray(val)) {
          next[key] = { ...next[key], ...val }
        } else if (val !== null && val !== undefined && val !== '') {
          next[key] = val
        }
      }
      next.lastUpdated = Date.now()
      return next
    })
  }, [])

  return (
    <DashboardContext.Provider value={{ userProfile, updateProfile, apiKey, setApiKey }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
