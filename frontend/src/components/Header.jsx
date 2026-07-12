export default function Header({ darkMode, onToggleDark, onToggleSidebar, title, mode, onModeChange, showLearning, onToggleLearning, user, onShowProfile }) {
  return (
    <div className="header">
      <div className="header-left">
        <button className="icon-btn" onClick={onToggleSidebar} title="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <span className="header-title">{title}</span>
      </div>
      <div className="header-center">
        <div className="mode-switcher">
          <button
            className={`mode-btn ${mode === 'chat' && !showLearning ? 'active' : ''}`}
            onClick={() => { onModeChange('chat'); onToggleLearning(false); }}
          >
            <span className="mode-icon">💬</span>
            Chat
          </button>
          <button
            className={`mode-btn ${mode === 'ide' ? 'active' : ''}`}
            onClick={() => { onModeChange('ide'); onToggleLearning(false); }}
          >
            <span className="mode-icon">🐍</span>
            IDE
          </button>
          <button
            className={`mode-btn ${showLearning ? 'active' : ''}`}
            onClick={onToggleLearning}
          >
            <span className="mode-icon">📚</span>
            Learn
          </button>
        </div>
      </div>
      <div className="header-right">
        <button className="icon-btn" onClick={onToggleDark} title="Toggle theme">
          {darkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
        {user && (
          <button className="user-avatar-btn" onClick={onShowProfile} title="Profile">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="user-avatar-img" />
            ) : (
              <span className="user-avatar-text">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
