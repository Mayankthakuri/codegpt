import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function LessonView({ lesson, module, onBack, onComplete, onNext, hasNext }) {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('chatgpt-clone-progress')
    return saved ? JSON.parse(saved) : {}
  })

  const isCompleted = progress[`${module.id}-${lesson.id}`] === 'completed'

  const markComplete = () => {
    const newProgress = { ...progress, [`${module.id}-${lesson.id}`]: 'completed' }
    localStorage.setItem('chatgpt-clone-progress', JSON.stringify(newProgress))
    setProgress(newProgress)
    onComplete()
  }

  return (
    <div className="lesson-view">
      <div className="lesson-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Course
        </button>
        <div className="lesson-meta">
          <span className="module-label">{module.title}</span>
          {isCompleted && <span className="completed-badge">✓ Completed</span>}
        </div>
        <h1>{lesson.title}</h1>
      </div>

      <div className="lesson-content">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              if (!inline && match) {
                return (
                  <div className="code-block">
                    <pre><code className={className} {...props}>{String(children).replace(/\n$/, '')}</code></pre>
                  </div>
                )
              }
              return <code className={className} {...props}>{children}</code>
            }
          }}
        >
          {lesson.content}
        </ReactMarkdown>

        {lesson.codeExample && (
          <div className="code-example">
            <h3>{lesson.codeExample.title}</h3>
            <div className="code-block">
              <pre><code>{lesson.codeExample.code}</code></pre>
            </div>
            {lesson.codeExample.output && (
              <div className="code-output">
                <div className="output-label">Output:</div>
                <pre>{lesson.codeExample.output}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lesson-footer">
        <button 
          className={`complete-btn ${isCompleted ? 'completed' : ''}`}
          onClick={markComplete}
        >
          {isCompleted ? '✓ Completed' : 'Mark as Complete'}
        </button>
        {isCompleted && hasNext && (
          <button className="next-btn" onClick={onNext}>
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
