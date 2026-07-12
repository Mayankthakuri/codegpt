import { useState, useEffect } from 'react'
import { courses } from '../data/courses'

export default function Dashboard({ onSelectLesson }) {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('chatgpt-clone-progress')
    return saved ? JSON.parse(saved) : {}
  })

  const getTotalLessons = () => {
    let total = 0
    courses.forEach(course => {
      course.modules.forEach(module => {
        total += module.lessons.length
      })
    })
    return total
  }

  const getCompletedLessons = () => {
    return Object.keys(progress).filter(key => progress[key] === 'completed').length
  }

  const getModuleProgress = (moduleId) => {
    const course = courses.find(c => c.modules.some(m => m.id === moduleId))
    if (!course) return 0
    const module = course.modules.find(m => m.id === moduleId)
    if (!module) return 0
    
    const completed = module.lessons.filter(l => 
      progress[`${moduleId}-${l.id}`] === 'completed'
    ).length
    return Math.round((completed / module.lessons.length) * 100)
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Python & ML Learning Path</h1>
        <p>Your journey from beginner to interview-ready</p>
      </div>

      <div className="progress-overview">
        <div className="progress-card">
          <div className="progress-number">{getCompletedLessons()}</div>
          <div className="progress-label">Lessons Done</div>
        </div>
        <div className="progress-card">
          <div className="progress-number">{getTotalLessons()}</div>
          <div className="progress-label">Total Lessons</div>
        </div>
        <div className="progress-card">
          <div className="progress-number">
            {Math.round((getCompletedLessons() / getTotalLessons()) * 100)}%
          </div>
          <div className="progress-label">Complete</div>
        </div>
      </div>

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card" style={{ borderColor: course.color }}>
            <div className="course-header">
              <span className="course-icon">{course.icon}</span>
              <h2>{course.title}</h2>
            </div>
            <p className="course-description">{course.description}</p>
            
            <div className="modules-list">
              {course.modules.map(module => {
                const moduleProgress = getModuleProgress(module.id)
                return (
                  <div key={module.id} className="module-item">
                    <div className="module-info">
                      <span className="module-title">{module.title}</span>
                      <span className="module-progress">{moduleProgress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${moduleProgress}%`,
                          backgroundColor: course.color
                        }}
                      />
                    </div>
                    <div className="lessons-list">
                      {module.lessons.map(lesson => {
                        const isCompleted = progress[`${module.id}-${lesson.id}`] === 'completed'
                        return (
                          <div
                            key={lesson.id}
                            className={`lesson-item ${isCompleted ? 'completed' : ''}`}
                            onClick={() => onSelectLesson(course, module, lesson)}
                          >
                            <span className="lesson-status">
                              {isCompleted ? '✓' : '○'}
                            </span>
                            <span className="lesson-title">{lesson.title}</span>
                          </div>
                        )
                      })}
                      {module.quiz && (
                        <div
                          className="lesson-item quiz-item"
                          onClick={() => onSelectLesson(course, module, null, true)}
                        >
                          <span className="lesson-status">📝</span>
                          <span className="lesson-title">{module.quiz.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
