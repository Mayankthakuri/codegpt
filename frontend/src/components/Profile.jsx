import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { courses } from '../data/courses'

const BADGE_TIERS = {
  'first-lesson': { tier: 'Bronze', color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32, #b8860b)' },
  'five-lessons': { tier: 'Silver', color: '#c0c0c0', gradient: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)' },
  'ten-lessons': { tier: 'Gold', color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700, #daa520)' },
  'twenty-lessons': { tier: 'Platinum', color: '#e5e4e2', gradient: 'linear-gradient(135deg, #e5e4e2, #b9b9b9)' },
  'first-quiz': { tier: 'Bronze', color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32, #b8860b)' },
  'five-quizzes': { tier: 'Silver', color: '#c0c0c0', gradient: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)' },
  'ten-quizzes': { tier: 'Gold', color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700, #daa520)' },
  'perfect-score': { tier: 'Diamond', color: '#b9f2ff', gradient: 'linear-gradient(135deg, #b9f2ff, #7dd3fc)' },
  'streak-3': { tier: 'Bronze', color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32, #b8860b)' },
  'streak-7': { tier: 'Gold', color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700, #daa520)' },
}

const ALL_ACHIEVEMENTS = [
  { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', category: 'progress' },
  { id: 'five-lessons', title: 'Getting Started', description: 'Complete 5 lessons', icon: '📚', category: 'progress' },
  { id: 'ten-lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '🎓', category: 'progress' },
  { id: 'twenty-lessons', title: 'Knowledge Seeker', description: 'Complete 20 lessons', icon: '🧠', category: 'progress' },
  { id: 'first-quiz', title: 'Quiz Master', description: 'Pass your first quiz', icon: '✅', category: 'quizzes' },
  { id: 'five-quizzes', title: 'Quiz Champion', description: 'Pass 5 quizzes', icon: '🏆', category: 'quizzes' },
  { id: 'ten-quizzes', title: 'Quiz Legend', description: 'Pass 10 quizzes', icon: '👑', category: 'quizzes' },
  { id: 'perfect-score', title: 'Perfectionist', description: 'Get 100% on a quiz', icon: '💯', category: 'quizzes' },
  { id: 'streak-3', title: 'On Fire', description: '3 day streak', icon: '🔥', category: 'streak' },
  { id: 'streak-7', title: 'Week Warrior', description: '7 day streak', icon: '⚡', category: 'streak' },
]

export default function Profile({ onBack }) {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  if (!user) return null

  const stats = user.stats || {
    lessonsCompleted: 0,
    quizzesPassed: 0,
    totalQuizScore: 0,
    coursesCompleted: 0,
    streakDays: 0
  }

  const achievements = user.achievements || []
  const progress = user.progress || []

  const totalLessons = courses.reduce((acc, course) => {
    return acc + course.modules.reduce((mAcc, module) => mAcc + module.lessons.length, 0)
  }, 0)

  const completionPercent = totalLessons > 0 ? Math.round((stats.lessonsCompleted / totalLessons) * 100) : 0

  const handleSendCertificate = async () => {
    if (!selectedBadge || sendingEmail) return
    setSendingEmail(true)
    setEmailSent(false)

    try {
      const res = await fetch('/api/achievements/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          achievement: selectedBadge
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEmailSent(true)
    } catch (err) {
      console.error('Failed to send certificate:', err)
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-top-bar">
        <button className="back-btn-profile" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back
        </button>
        <button className="logout-btn-top" onClick={logout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar-large">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
          <div className="avatar-ring"></div>
        </div>
        <div className="profile-hero-info">
          <h1>{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <div className="profile-meta">
            <span className="meta-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Joined {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
            <span className="meta-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              {stats.streakDays || 0} day streak
            </span>
          </div>
        </div>
      </div>

      <div className="profile-stats-row">
        <div className="pstat-card">
          <div className="pstat-number">{stats.lessonsCompleted || 0}</div>
          <div className="pstat-label">Lessons Done</div>
          <div className="pstat-bar">
            <div className="pstat-bar-fill" style={{ width: `${Math.min(100, (stats.lessonsCompleted / Math.max(totalLessons, 1)) * 100)}%` }}></div>
          </div>
        </div>
        <div className="pstat-card">
          <div className="pstat-number">{stats.quizzesPassed || 0}</div>
          <div className="pstat-label">Quizzes Passed</div>
          <div className="pstat-bar">
            <div className="pstat-bar-fill quizzes" style={{ width: `${Math.min(100, (stats.quizzesPassed / Math.max(totalLessons, 1)) * 100)}%` }}></div>
          </div>
        </div>
        <div className="pstat-card">
          <div className="pstat-number">{achievements.length}</div>
          <div className="pstat-label">Achievements</div>
          <div className="pstat-bar">
            <div className="pstat-bar-fill achievements" style={{ width: `${Math.min(100, (achievements.length / ALL_ACHIEVEMENTS.length) * 100)}%` }}></div>
          </div>
        </div>
        <div className="pstat-card">
          <div className="pstat-number">{completionPercent}%</div>
          <div className="pstat-label">Overall</div>
          <div className="pstat-bar">
            <div className="pstat-bar-fill overall" style={{ width: `${completionPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="profile-tabs-row">
        <button className={`ptab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Overview
        </button>
        <button className={`ptab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Courses
        </button>
        <button className={`ptab ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          Achievements
        </button>
      </div>

      <div className="profile-tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            {completionPercent > 0 && (
              <div className="overview-progress-card">
                <div className="opc-header">
                  <span className="opc-title">Learning Progress</span>
                  <span className="opc-count">{stats.lessonsCompleted}/{totalLessons} lessons</span>
                </div>
                <div className="opc-bar">
                  <div className="opc-bar-fill" style={{ width: `${completionPercent}%` }}></div>
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div className="overview-section">
                <h3>Latest Achievements</h3>
                <div className="overview-achievements">
                  {achievements.slice(0, 5).map(a => (
                    <div key={a.id} className="oa-item">
                      <span className="oa-icon">{a.icon}</span>
                      <div className="oa-info">
                        <span className="oa-title">{a.title}</span>
                        <span className="oa-date">{new Date(a.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements.length === 0 && completionPercent === 0 && (
              <div className="overview-empty">
                <div className="oe-icon">🚀</div>
                <h3>Start Your Journey</h3>
                <p>Complete lessons and quizzes to see your progress here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="courses-content">
            {courses.map(course => {
              const courseProgress = progress.filter(p => p.courseId === course.id)
              const completedLessons = courseProgress.filter(p => p.completed).length
              const totalCourseLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
              const pct = totalCourseLessons > 0 ? Math.round((completedLessons / totalCourseLessons) * 100) : 0

              return (
                <div key={course.id} className="course-card-elegant">
                  <div className="cce-left">
                    <span className="cce-icon">{course.icon}</span>
                    <div className="cce-info">
                      <h4>{course.title}</h4>
                      <p>{completedLessons}/{totalCourseLessons} lessons completed</p>
                    </div>
                  </div>
                  <div className="cce-right">
                    <div className="cce-bar">
                      <div className="cce-bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="cce-pct">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-content">
            <div className="ac-header-row">
              <div>
                <h3 className="ac-title">Your Badges</h3>
                <p className="ac-subtitle">{achievements.length} of {ALL_ACHIEVEMENTS.length} unlocked</p>
              </div>
            </div>
            <div className="ac-grid">
              {ALL_ACHIEVEMENTS.map(ach => {
                const earned = achievements.find(a => a.id === ach.id)
                const badge = BADGE_TIERS[ach.id]
                return (
                  <div
                    key={ach.id}
                    className={`ac-card ${earned ? 'earned' : 'locked'}`}
                    onClick={() => earned && setSelectedBadge(earned)}
                  >
                    <div className="ac-badge-wrapper">
                      <div
                        className={`ac-badge ${earned ? 'ac-badge-earned' : 'ac-badge-locked}`}
                        style={earned ? { background: badge.gradient } : {}}
                      >
                        <span className="ac-badge-icon">{earned ? ach.icon : '🔒'}</span>
                      </div>
                      {earned && (
                        <div className="ac-medal" style={{ background: badge.color }}>
                          {badge.tier}
                        </div>
                      )}
                    </div>
                    <div className="ac-info">
                      <h4>{ach.title}</h4>
                      <p>{ach.description}</p>
                      {earned ? (
                        <span className="ac-date">
                          Earned {new Date(earned.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="ac-locked-text">Locked</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {selectedBadge && (
        <div className="cert-modal-overlay" onClick={() => { setSelectedBadge(null); setEmailSent(false) }}>
          <div className="cert-modal" onClick={e => e.stopPropagation()}>
            <button className="cert-close" onClick={() => { setSelectedBadge(null); setEmailSent(false) }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="cert-card">
              <div
                className="cert-badge"
                style={{ background: BADGE_TIERS[selectedBadge.id]?.gradient || 'linear-gradient(135deg, #6366f1, #818cf8)' }}
              >
                <span className="cert-badge-icon">{selectedBadge.icon || '🏆'}</span>
              </div>
              <div className="cert-medal-label">
                {BADGE_TIERS[selectedBadge.id]?.tier || 'Achievement'} Medal
              </div>
              <h2 className="cert-title">{selectedBadge.title || selectedBadge.id}</h2>
              <p className="cert-desc">{selectedBadge.description || ''}</p>

              <div className="cert-details">
                <div className="cert-detail">
                  <span className="cert-detail-value">{user.name}</span>
                  <span className="cert-detail-label">Awarded To</span>
                </div>
                <div className="cert-detail">
                  <span className="cert-detail-value">
                    {new Date(selectedBadge.earnedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="cert-detail-label">Date Earned</span>
                </div>
              </div>
            </div>

            <button
              className="cert-send-btn"
              onClick={handleSendCertificate}
              disabled={sendingEmail || emailSent}
            >
              {emailSent ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Certificate Sent to {user.email}
                </>
              ) : sendingEmail ? (
                <>
                  <div className="cert-spinner"></div>
                  Sending Certificate...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Send Certificate to Email
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
