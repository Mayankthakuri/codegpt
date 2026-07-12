import { courses } from '../data/courses'

export default function Sidebar({ 
  conversations, 
  currentId, 
  onSelect, 
  onNewChat, 
  onDelete, 
  isOpen, 
  onToggle, 
  showLearning,
  onToggleLearning,
  onSelectLesson,
  currentView,
  onBackToDashboard
}) {
  const handleLessonClick = (course, module, lesson) => {
    onSelectLesson(course, module, lesson, false)
  }

  const handleQuizClick = (course, module) => {
    onSelectLesson(course, module, null, true)
  }

  return (
    <>
      {isOpen && window.innerWidth < 768 && (
        <div className="sidebar-overlay" onClick={onToggle}></div>
      )}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {!showLearning ? (
            <button className="new-chat-btn" onClick={onNewChat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>
          ) : (
            <button className="new-chat-btn back-btn" onClick={onBackToDashboard}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Learning Path
            </button>
          )}
        </div>
        
        <div className="conversations-list">
          {!showLearning ? (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${conv.id === currentId ? 'active' : ''}`}
                onClick={() => onSelect(conv.id)}
              >
                <span className="conversation-title">{conv.title}</span>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(conv.id)
                  }}
                  title="Delete conversation"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            courses.map(course => (
              <div key={course.id} className="sidebar-course">
                <div className="sidebar-course-header">
                  <span className="course-icon">{course.icon}</span>
                  <span className="course-title">{course.title}</span>
                </div>
                {course.modules.map(module => (
                  <div key={module.id} className="sidebar-module">
                    <div className="module-title">{module.title}</div>
                    {module.lessons.map(lesson => (
                      <div 
                        key={lesson.id} 
                        className="sidebar-lesson"
                        onClick={() => handleLessonClick(course, module, lesson)}
                      >
                        ○ {lesson.title}
                      </div>
                    ))}
                    {module.quiz && (
                      <div 
                        className="sidebar-lesson quiz-link"
                        onClick={() => handleQuizClick(course, module)}
                      >
                        📝 {module.quiz.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
