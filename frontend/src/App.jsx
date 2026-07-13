import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import LessonView from './components/LessonView'
import QuizView from './components/QuizView'
import PythonIDE from './components/PythonIDE'
import AuthPage from './components/AuthPage'
import Profile from './components/Profile'
import { courses } from './data/courses'
import './App.css'

function AppContent() {
  const { user, loading, updateProgress } = useAuth()
  const [mode, setMode] = useState('chat')
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showLearning, setShowLearning] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('chatgpt-clone-conversations')
    return saved ? JSON.parse(saved) : []
  })
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('chatgpt-clone-darkmode')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    localStorage.setItem('chatgpt-clone-conversations', JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    localStorage.setItem('chatgpt-clone-darkmode', JSON.stringify(darkMode))
    document.body.className = darkMode ? 'dark' : 'light'
  }, [darkMode])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  if (showProfile) {
    return (
      <div className={`app ${darkMode ? 'dark' : 'light'}`}>
        <Profile onBack={() => setShowProfile(false)} />
      </div>
    )
  }

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  const createNewConversation = () => {
    const newConv = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString()
    }
    setConversations(prev => [newConv, ...prev])
    setCurrentConversationId(newConv.id)
    setShowLearning(false)
  }

  const updateConversation = (id, updates) => {
    setConversations(prev => {
      const exists = prev.some(c => c.id === id)
      if (exists) {
        return prev.map(c => c.id === id ? { ...c, ...updates } : c)
      } else {
        return [{ ...updates, id }, ...prev]
      }
    })
  }

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
    }
  }

  const selectConversation = (id) => {
    setCurrentConversationId(id)
    setMode('chat')
    setShowLearning(false)
    setShowProfile(false)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const handleSelectLesson = (course, module, lesson, isQuiz = false) => {
    setSelectedCourse(course)
    setSelectedModule(module)
    setSelectedLesson(lesson)
    setShowQuiz(isQuiz)
    setCurrentView(isQuiz ? 'quiz' : 'lesson')
    setShowLearning(true)
    setShowProfile(false)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedLesson(null)
    setSelectedModule(null)
    setSelectedCourse(null)
    setShowQuiz(false)
  }

  const handleLessonComplete = () => {
    if (selectedCourse && selectedModule && selectedLesson) {
      updateProgress({
        courseId: selectedCourse.id,
        moduleId: selectedModule.id,
        lessonId: selectedLesson.id,
        completed: true
      })
    }
  }

  const toggleLearning = () => {
    setShowLearning(!showLearning)
    setShowProfile(false)
    setSidebarOpen(true)
  }

  const getPageTitle = () => {
    if (mode === 'ide') return 'Python IDE'
    if (showLearning) {
      if (currentView === 'dashboard') return 'Learning Dashboard'
      if (currentView === 'lesson') return selectedLesson?.title || 'Lesson'
      if (currentView === 'quiz') return selectedModule?.quiz?.title || 'Quiz'
    }
    return currentConversation?.title || 'New Chat'
  }

  const findNextLesson = () => {
    if (!selectedCourse || !selectedModule || !selectedLesson) return null

    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id)
    if (courseIndex === -1) return null

    const course = courses[courseIndex]
    const moduleIndex = course.modules.findIndex(m => m.id === selectedModule.id)
    if (moduleIndex === -1) return null

    const module = course.modules[moduleIndex]
    const lessonIndex = module.lessons.findIndex(l => l.id === selectedLesson.id)

    if (lessonIndex < module.lessons.length - 1) {
      return {
        course: course,
        module: module,
        lesson: module.lessons[lessonIndex + 1]
      }
    }

    if (moduleIndex < course.modules.length - 1) {
      const nextModule = course.modules[moduleIndex + 1]
      if (nextModule.lessons.length > 0) {
        return {
          course: course,
          module: nextModule,
          lesson: nextModule.lessons[0]
        }
      }
    }

    if (courseIndex < courses.length - 1) {
      const nextCourse = courses[courseIndex + 1]
      if (nextCourse.modules.length > 0 && nextCourse.modules[0].lessons.length > 0) {
        return {
          course: nextCourse,
          module: nextCourse.modules[0],
          lesson: nextCourse.modules[0].lessons[0]
        }
      }
    }

    return null
  }

  const handleNextLesson = () => {
    const next = findNextLesson()
    if (next) {
      handleSelectLesson(next.course, next.module, next.lesson, false)
    }
  }

  const nextLesson = findNextLesson()

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <Sidebar
        conversations={conversations}
        currentId={currentConversationId}
        onSelect={selectConversation}
        onNewChat={createNewConversation}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        showLearning={showLearning}
        onToggleLearning={toggleLearning}
        onSelectLesson={handleSelectLesson}
        currentView={currentView}
        onBackToDashboard={handleBackToDashboard}
        user={user}
        onShowProfile={() => { setShowProfile(true); setShowLearning(false); setSidebarOpen(false); }}
      />
      <div className="main-content">
        <Header
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle()}
          mode={mode}
          onModeChange={setMode}
          showLearning={showLearning}
          onToggleLearning={toggleLearning}
          user={user}
          onShowProfile={() => { setShowProfile(true); setShowLearning(false); }}
        />

        {mode === 'chat' && !showLearning && (
          <Chat
            conversation={currentConversation}
            onUpdateConversation={updateConversation}
            darkMode={darkMode}
          />
        )}
        {mode === 'ide' && (
          <PythonIDE />
        )}
        {showLearning && (
          <div className="learning-content">
            {currentView === 'dashboard' && (
              <Dashboard onSelectLesson={handleSelectLesson} />
            )}
            {currentView === 'lesson' && selectedLesson && (
              <LessonView
                lesson={selectedLesson}
                module={selectedModule}
                onBack={handleBackToDashboard}
                onComplete={handleLessonComplete}
                onNext={handleNextLesson}
                hasNext={nextLesson !== null}
              />
            )}
            {currentView === 'quiz' && selectedModule?.quiz && (
              <QuizView
                quiz={selectedModule.quiz}
                module={selectedModule}
                onBack={handleBackToDashboard}
                onComplete={handleLessonComplete}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
