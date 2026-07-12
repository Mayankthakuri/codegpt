import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { courses } from '../data/courses'
import API_URL from '../config'

export default function Profile() {
  const { user, logout } = useAuth()
  const [progressData, setProgressData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      loadProgress()
    }
  }, [user])

  const loadProgress = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_URL}/auth/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setProgressData(data)
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  if (!user) return null

  const stats = user.stats || progressData?.stats || {
    lessonsCompleted: 0,
    quizzesPassed: 0,
    totalQuizScore: 0,
    coursesCompleted: 0,
    streakDays: 0
  }

  const achievements = user.achievements || progressData?.achievements || []
  const progress = user.progress || progressData?.progress || []

  const allAchievements = [
    { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯' },
    { id: 'five-lessons', title: 'Getting Started', description: 'Complete 5 lessons', icon: '📚' },
    { id: 'ten-lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '🎓' },
    { id: 'twenty-lessons', title: 'Knowledge Seeker', description: 'Complete 20 lessons', icon: '🧠' },
    { id: 'first-quiz', title: 'Quiz Master', description: 'Pass your first quiz', icon: '✅' },
    { id: 'five-quizzes', title: 'Quiz Champion', description: 'Pass 5 quizzes', icon: '🏆' },
    { id: 'ten-quizzes', title: 'Quiz Legend', description: 'Pass 10 quizzes', icon: '👑' },
    { id: 'perfect-score', title: 'Perfectionist', description: 'Get 100% on a quiz', icon: '💯' },
    { id: 'streak-3', title: 'On Fire', description: '3 day streak', icon: '🔥' },
    { id: 'streak-7', title: 'Week Warrior', description: '7 day streak', icon: '⚡' },
  ]

  const totalLessons = courses.reduce((acc, course) => {
    return acc + course.modules.reduce((mAcc, module) => mAcc + module.lessons.length, 0)
  }, 0)

  const completionPercent = totalLessons > 0 ? Math.round((stats.lessonsCompleted / totalLessons) * 100) : 0

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <span className="member-since">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          My Courses
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-value">{stats.lessonsCompleted}</div>
                <div className="stat-label">Lessons Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.quizzesPassed}</div>
                <div className="stat-label">Quizzes Passed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{achievements.length}</div>
                <div className="stat-label">Achievements</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats.streakDays}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>

            <div className="progress-section">
              <h3>Overall Progress</h3>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${completionPercent}%` }}></div>
                <span className="progress-text">{completionPercent}% Complete</span>
              </div>
              <p className="progress-detail">
                {stats.lessonsCompleted} of {totalLessons} lessons completed
              </p>
            </div>

            {achievements.length > 0 && (
              <div className="recent-achievements">
                <h3>Recent Achievements</h3>
                <div className="achievements-row">
                  {achievements.slice(0, 4).map(achievement => (
                    <div key={achievement.id} className="achievement-badge">
                      <span className="achievement-icon">{achievement.icon}</span>
                      <span className="achievement-title">{achievement.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            <h3>All Achievements</h3>
            <div className="achievements-grid">
              {allAchievements.map(achievement => {
                const earned = achievements.find(a => a.id === achievement.id)
                return (
                  <div
                    key={achievement.id}
                    className={`achievement-card ${earned ? 'earned' : 'locked'}`}
                  >
                    <div className="achievement-icon-large">
                      {earned ? achievement.icon : '🔒'}
                    </div>
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    {earned && (
                      <span className="earned-date">
                        Earned {new Date(earned.earnedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="courses-tab">
            <h3>My Courses</h3>
            <div className="courses-grid">
              {courses.map(course => {
                const courseProgress = progress.filter(p => p.courseId === course.id)
                const completedLessons = courseProgress.filter(p => p.completed).length
                const totalCourseLessons = course.modules.reduce(
                  (acc, module) => acc + module.lessons.length, 0
                )
                const coursePercent = totalCourseLessons > 0
                  ? Math.round((completedLessons / totalCourseLessons) * 100)
                  : 0

                return (
                  <div key={course.id} className="course-progress-card">
                    <div className="course-header">
                      <span className="course-icon">{course.icon}</span>
                      <h4>{course.title}</h4>
                    </div>
                    <div className="course-progress-bar">
                      <div
                        className="course-progress-fill"
                        style={{ width: `${coursePercent}%` }}
                      ></div>
                    </div>
                    <div className="course-stats">
                      <span>{completedLessons}/{totalCourseLessons} lessons</span>
                      <span>{coursePercent}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
