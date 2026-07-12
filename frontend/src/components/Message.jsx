import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from 'react'

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="code-block-header">
        <span>{language || 'code'}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'text'}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0 0 8px 8px' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

export default function Message({ role, content }) {
  return (
    <div className={`message ${role}`}>
      <div className="message-avatar">
        {role === 'user' ? 'U' : 'AI'}
      </div>
      <div className="message-content">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              if (!inline && match) {
                return (
                  <CodeBlock language={match[1]}>
                    {String(children).replace(/\n$/, '')}
                  </CodeBlock>
                )
              }
              if (!inline && !match) {
                return (
                  <CodeBlock language="text">
                    {String(children).replace(/\n$/, '')}
                  </CodeBlock>
                )
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
