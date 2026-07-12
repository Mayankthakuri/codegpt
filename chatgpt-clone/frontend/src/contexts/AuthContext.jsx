import { createContext, useContext, useState, useEffect } from 'react'
import supabase from '../lib/supabase'
import API_URL from '../config'

const AuthContext = createContext(null)

function checkAchievements(progress, stats, existing = []) {
  const achievements = [...existing]
  const checks = [
    { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', cond: stats.lessonsCompleted >= 1 },
    { id: 'five-lessons', title: 'Getting Started', description: 'Complete 5 lessons', icon: '📚', cond: stats.lessonsCompleted >= 5 },
    { id: 'ten-lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '🎓', cond: stats.lessonsCompleted >= 10 },
    { id: 'twenty-lessons', title: 'Knowledge Seeker', description: 'Complete 20 lessons', icon: '🧠', cond: stats.lessonsCompleted >= 20 },
    { id: 'first-quiz', title: 'Quiz Master', description: 'Pass your first quiz', icon: '✅', cond: stats.quizzesPassed >= 1 },
    { id: 'five-quizzes', title: 'Quiz Champion', description: 'Pass 5 quizzes', icon: '🏆', cond: stats.quizzesPassed >= 5 },
    { id: 'ten-quizzes', title: 'Quiz Legend', description: 'Pass 10 quizzes', icon: '👑', cond: stats.quizzesPassed >= 10 },
    { id: 'perfect-score', title: 'Perfectionist', description: 'Get 100% on a quiz', icon: '💯', cond: progress.some(p => p.quizScore === 100) },
  ]
  checks.forEach(a => {
    if (!achievements.find(e => e.id === a.id) && a.cond) {
      achievements.push({ id: a.id, title: a.title, description: a.description, icon: a.icon, earnedAt: new Date().toISOString() })
    }
  })
  return achievements
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          avatar: data.avatar,
          provider: data.provider,
          stats: data.stats || {},
          achievements: data.achievements || [],
          progress: data.progress || [],
          created_at: data.created_at
        })
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          avatar: authUser.user_metadata?.avatar_url || '',
          provider: authUser.app_metadata?.provider || 'email',
          stats: {},
          achievements: [],
          progress: [],
          created_at: authUser.created_at
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        avatar: authUser.user_metadata?.avatar_url || '',
        provider: authUser.app_metadata?.provider || 'email',
        stats: {},
        achievements: [],
        progress: []
      })
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await loadUserProfile(data.user)
    return data.user
  }

  const register = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) throw error

    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email,
        name: name,
        provider: 'local',
        stats: {},
        achievements: [],
        progress: []
      })
      await loadUserProfile(data.user)
    }
    return data.user
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateProgress = async (progressData) => {
    if (!user) return

    const progress = [...(user.progress || [])]
    const { courseId, moduleId, lessonId, completed, quizScore, quizPassed } = progressData
    const idx = progress.findIndex(p => p.courseId === courseId && p.moduleId === moduleId && p.lessonId === lessonId)

    if (idx >= 0) {
      progress[idx] = { ...progress[idx], completed, completedAt: completed ? new Date().toISOString() : null }
      if (quizScore !== undefined) progress[idx].quizScore = quizScore
      if (quizPassed !== undefined) progress[idx].quizPassed = quizPassed
    } else {
      progress.push({ courseId, moduleId, lessonId, completed, completedAt: completed ? new Date().toISOString() : null, quizScore: quizScore || null, quizPassed: quizPassed || false })
    }

    const stats = { ...(user.stats || {}) }
    stats.lessonsCompleted = progress.filter(p => p.completed).length
    stats.quizzesPassed = progress.filter(p => p.quizPassed).length
    stats.lastActive = new Date().toISOString()

    const achievements = checkAchievements(progress, stats, user.achievements || [])

    await supabase.from('users').update({ progress, stats, achievements }).eq('id', user.id)

    setUser(prev => ({ ...prev, progress, stats, achievements }))
  }

  const getProgress = async () => {
    if (!user) return null
    return { progress: user.progress, achievements: user.achievements, stats: user.stats }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateProgress, getProgress }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
