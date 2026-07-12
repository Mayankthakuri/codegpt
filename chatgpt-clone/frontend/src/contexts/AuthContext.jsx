import { createContext, useContext, useState, useEffect } from 'react'
import API_URL from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for token in URL (Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('token')
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl)
      window.history.replaceState({}, document.title, window.location.pathname)
      fetchUser(tokenFromUrl)
    } else {
      const token = localStorage.getItem('token')
      if (token) {
        fetchUser(token)
      } else {
        setLoading(false)
      }
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error)

    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (email, password, name) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error)

    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateProgress = async (progressData) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/auth/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(progressData)
      })

      if (response.ok) {
        const data = await response.json()
        setUser(prev => ({
          ...prev,
          progress: data.user.progress,
          achievements: data.user.achievements,
          stats: data.user.stats
        }))
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const getProgress = async () => {
    const token = localStorage.getItem('token')
    if (!token) return null

    try {
      const response = await fetch(`${API_URL}/auth/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
    return null
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProgress,
      getProgress
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
