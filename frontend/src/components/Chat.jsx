import { useState, useRef, useEffect, useCallback } from 'react'
import Message from './Message'

export default function Chat({ conversation, onUpdateConversation, onNewConversation }) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

  const messages = conversation?.messages || []
  const convIdRef = useRef(null)

  useEffect(() => {
    convIdRef.current = conversation?.id || null
  }, [conversation?.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const generateTitle = (text) => {
    return text.slice(0, 40) + (text.length > 40 ? '...' : '')
  }

  const sendMessage = useCallback(async () => {
    const msg = input.trim()
    if (!msg || isLoading) return

    const userMessage = { role: 'user', content: msg }
    const isNew = !conversation
    const id = convIdRef.current || Date.now().toString()

    let currentMessages = [...messages, userMessage]

    if (isNew) {
      convIdRef.current = id
      onNewConversation(id, {
        id,
        title: generateTitle(msg),
        messages: currentMessages,
        createdAt: new Date().toISOString()
      })
    } else {
      onUpdateConversation(id, {
        messages: currentMessages,
        title: messages.length === 0 ? generateTitle(msg) : conversation.title
      })
    }

    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              assistantContent = `Error: ${parsed.error}`
              break
            }
            if (parsed.content) {
              assistantContent += parsed.content
              onUpdateConversation(convIdRef.current, {
                messages: [...currentMessages, { role: 'assistant', content: assistantContent }]
              })
            }
          } catch (e) { /* skip malformed chunks */ }
        }
      }

      // If no content was received, show error
      if (!assistantContent) {
        onUpdateConversation(convIdRef.current, {
          messages: [...currentMessages, { role: 'assistant', content: 'No response received. Please try again.' }]
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      onUpdateConversation(convIdRef.current, {
        messages: [...currentMessages, { role: 'assistant', content: `Error: ${error.message}. Please try again.` }]
      })
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, conversation, onUpdateConversation, onNewConversation])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="chat-container">
      {isEmpty ? (
        <div className="welcome-screen">
          <div className="welcome-icon">
            <img src="/falcon.svg" alt="CodeGPT" />
          </div>
          <h1 className="welcome-title">CodeGPT</h1>
          <p className="welcome-subtitle">Ask me anything — powered by DeepSeek AI</p>
          <div className="welcome-suggestions">
            {['Explain quantum computing', 'Write a Python function', 'Help me debug code', 'What is machine learning?'].map((s, i) => (
              <button key={i} className="suggestion-btn" onClick={() => setInput(s)}>{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <Message key={idx} role={msg.role} content={msg.content} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="message assistant">
              <div className="message-avatar">AI</div>
              <div className="message-content">
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      <div className="input-area">
        <div className="input-wrapper">
          <div className="input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
            />
          </div>
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="6" width="12" height="12" rx="2"></rect>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
