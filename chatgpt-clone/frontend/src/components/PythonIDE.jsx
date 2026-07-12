import { useState, useRef, useEffect, useCallback } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { lintKeymap } from '@codemirror/lint'
import API_URL from '../config'

const DEFAULT_CELLS = [
  {
    id: 1,
    type: 'code',
    content: `# Welcome to Python IDE! 🐍
# This is a cell-based notebook like Google Colab

def greet(name):
    """Greet someone by name"""
    return f"Hello, {name}! Welcome to Python IDE!"

print(greet("Mayank"))
`,
  },
  {
    id: 2,
    type: 'code',
    content: `# Variables and Data Types
language = "Python"
version = 3.12
isAwesome = True

print(f"Language: {language}")
print(f"Version: {version}")
print(f"Is Awesome: {isAwesome}")
`,
  },
  {
    id: 3,
    type: 'code',
    content: `# List Comprehension
squares = [x**2 for x in range(10)]
print(f"Squares: {squares}")

# Lambda Function
add = lambda x, y: x + y
print(f"5 + 3 = {add(5, 3)}")
`,
  },
]

export default function PythonIDE() {
  const [cells, setCells] = useState(DEFAULT_CELLS)
  const [outputs, setOutputs] = useState({})
  const [runningCells, setRunningCells] = useState(new Set())
  const [pyodide, setPyodide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(true)
  const [selectedCellId, setSelectedCellId] = useState(null)
  const editorRefs = useRef({})
  const aiOutputRef = useRef(null)

  useEffect(() => {
    // Load Pyodide
    loadPyodide()
  }, [])

  useEffect(() => {
    // Initialize editors for cells
    cells.forEach(cell => {
      if (editorRefs.current[cell.id] && !editorRefs.current[cell.id].view) {
        initEditor(cell)
      }
    })
  }, [cells])

  const loadPyodide = async () => {
    try {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
      script.async = true
      script.onload = async () => {
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        })
        setPyodide(pyodideInstance)
        setLoading(false)
      }
      document.head.appendChild(script)
    } catch (error) {
      console.error('Failed to load Pyodide:', error)
      setLoading(false)
    }
  }

  const initEditor = (cell) => {
    const container = document.getElementById(`editor-${cell.id}`)
    if (!container || editorRefs.current[cell.id]?.view) return

    const state = EditorState.create({
      doc: cell.content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        foldGutter(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...lintKeymap,
          indentWithTab,
        ]),
        python(),
        syntaxHighlighting(defaultHighlightStyle),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            updateCellContent(cell.id, update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': {
            fontSize: '13px',
          },
          '.cm-scroller': {
            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            overflow: 'auto',
          },
          '.cm-content': {
            padding: '8px 0',
          },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: container,
    })

    editorRefs.current[cell.id] = { view }
  }

  const updateCellContent = useCallback((cellId, content) => {
    setCells(prev => prev.map(cell => 
      cell.id === cellId ? { ...cell, content } : cell
    ))
  }, [])

  const runCell = async (cellId) => {
    if (!pyodide) return

    const cell = cells.find(c => c.id === cellId)
    if (!cell) return

    setRunningCells(prev => new Set([...prev, cellId]))
    setOutputs(prev => ({ ...prev, [cellId]: '' }))

    try {
      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
`)

      pyodide.runPython(cell.content)

      const stdout = pyodide.runPython('sys.stdout.getvalue()')
      pyodide.runPython('sys.stdout = sys.__stdout__')

      setOutputs(prev => ({ ...prev, [cellId]: stdout || '(no output)' }))
    } catch (error) {
      setOutputs(prev => ({ ...prev, [cellId]: `Error: ${error.message}` }))
    } finally {
      setRunningCells(prev => {
        const next = new Set(prev)
        next.delete(cellId)
        return next
      })
    }
  }

  const runAllCells = async () => {
    for (const cell of cells) {
      await runCell(cell.id)
    }
  }

  const addCell = (afterId = null) => {
    const newId = Math.max(...cells.map(c => c.id), 0) + 1
    const newCell = { id: newId, type: 'code', content: '' }
    
    if (afterId) {
      const index = cells.findIndex(c => c.id === afterId)
      setCells(prev => [...prev.slice(0, index + 1), newCell, ...prev.slice(index + 1)])
    } else {
      setCells(prev => [...prev, newCell])
    }
  }

  const deleteCell = (cellId) => {
    if (cells.length <= 1) return
    setCells(prev => prev.filter(c => c.id !== cellId))
    setOutputs(prev => {
      const next = { ...prev }
      delete next[cellId]
      return next
    })
  }

  const moveCell = (cellId, direction) => {
    const index = cells.findIndex(c => c.id === cellId)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === cells.length - 1)) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newCells = [...cells]
    const [removed] = newCells.splice(index, 1)
    newCells.splice(newIndex, 0, removed)
    setCells(newCells)
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return

    setAiGenerating(true)
    setAiResponse('')

    const fullPrompt = `Write Python code for the following task. Return ONLY the code, no explanations or markdown formatting. The code should be complete and runnable.

Task: ${aiPrompt}`

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: fullPrompt }],
          stream: true,
        }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.choices && data.choices[0]) {
              const content = data.choices[0].delta?.content || ''
              fullText += content
              setAiResponse(fullText)
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      setAiResponse(`Error: ${error.message}`)
    } finally {
      setAiGenerating(false)
    }
  }

  const insertGeneratedCode = () => {
    if (!aiResponse.trim()) return

    // Clean the response - remove markdown code blocks if present
    let code = aiResponse
      .replace(/^```python\n?/gm, '')
      .replace(/^```\n?/gm, '')
      .trim()

    if (selectedCellId) {
      // Insert into selected cell
      setCells(prev => prev.map(cell => 
        cell.id === selectedCellId 
          ? { ...cell, content: cell.content + '\n' + code }
          : cell
      ))
    } else {
      // Create new cell
      const newId = Math.max(...cells.map(c => c.id), 0) + 1
      setCells(prev => [...prev, { id: newId, type: 'code', content: code }])
    }

    setAiResponse('')
    setAiPrompt('')
  }

  const formatAIOutput = (text) => {
    if (!text) return null
    
    // Check if it contains code blocks
    const hasCodeBlocks = text.includes('```')
    
    if (hasCodeBlocks) {
      const parts = text.split(/(```[\s\S]*?```)/g)
      return parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/```\w*\n?/g, '').replace(/```$/g, '')
          return (
            <pre key={i} className="ai-code-block">
              <code>{code}</code>
            </pre>
          )
        }
        return <span key={i}>{part}</span>
      })
    }
    
    return <pre className="ai-code-block"><code>{text}</code></pre>
  }

  return (
    <div className="notebook-container">
      <div className="notebook-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={() => addCell()} title="Add cell">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Cell
          </button>
          <button 
            className="toolbar-btn run-all-btn" 
            onClick={runAllCells}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Run All
          </button>
          {loading && <span className="loading-badge">Loading Python...</span>}
        </div>
        <div className="toolbar-right">
          <button 
            className={`toolbar-btn ai-toggle-btn ${showAiPanel ? 'active' : ''}`}
            onClick={() => setShowAiPanel(!showAiPanel)}
          >
            <span className="ai-icon">✨</span>
            AI Assistant
          </button>
        </div>
      </div>

      <div className="notebook-body">
        <div className="notebook-cells">
          {cells.map((cell, index) => (
            <div 
              key={cell.id} 
              className={`cell ${selectedCellId === cell.id ? 'selected' : ''}`}
              onClick={() => setSelectedCellId(cell.id)}
            >
              <div className="cell-header">
                <div className="cell-number">[{index + 1}]</div>
                <div className="cell-actions">
                  <button 
                    className="cell-btn" 
                    onClick={(e) => { e.stopPropagation(); moveCell(cell.id, 'up') }}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button 
                    className="cell-btn" 
                    onClick={(e) => { e.stopPropagation(); moveCell(cell.id, 'down') }}
                    disabled={index === cells.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button 
                    className="cell-btn run-btn" 
                    onClick={(e) => { e.stopPropagation(); runCell(cell.id) }}
                    disabled={runningCells.has(cell.id) || loading}
                    title="Run cell"
                  >
                    {runningCells.has(cell.id) ? '⟳' : '▶'}
                  </button>
                  <button 
                    className="cell-btn delete-btn" 
                    onClick={(e) => { e.stopPropagation(); deleteCell(cell.id) }}
                    disabled={cells.length <= 1}
                    title="Delete cell"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="cell-editor" id={`editor-${cell.id}`}></div>
              {outputs[cell.id] && (
                <div className={`cell-output ${outputs[cell.id].startsWith('Error') ? 'error' : ''}`}>
                  <div className="output-label">Out [{index + 1}]:</div>
                  <pre>{outputs[cell.id]}</pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {showAiPanel && (
          <div className="ai-panel">
            <div className="ai-panel-header">
              <span className="ai-icon">✨</span>
              AI Code Assistant
            </div>
            <div className="ai-panel-content">
              <div className="ai-prompt-area">
                <textarea
                  className="ai-input"
                  placeholder="Describe what you want to generate...&#10;&#10;Examples:&#10;• Sort a list using quicksort&#10;• Binary search implementation&#10;• Read CSV file and find average&#10;• Create a simple API with Flask"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                />
                <button 
                  className="ai-generate-btn" 
                  onClick={generateWithAI}
                  disabled={aiGenerating || !aiPrompt.trim()}
                >
                  {aiGenerating ? (
                    <>
                      <span className="spinner-small"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="ai-icon">✨</span>
                      Generate Code
                    </>
                  )}
                </button>
              </div>
              
              {aiResponse && (
                <div className="ai-response" ref={aiOutputRef}>
                  <div className="ai-response-header">
                    <span>Generated Code</span>
                    <button 
                      className="ai-insert-btn"
                      onClick={insertGeneratedCode}
                    >
                      {selectedCellId ? 'Insert into Cell' : 'Add as New Cell'}
                    </button>
                  </div>
                  <div className="ai-response-content">
                    {formatAIOutput(aiResponse)}
                  </div>
                </div>
              )}

              <div className="ai-examples">
                <div className="examples-title">Quick Examples</div>
                <button className="example-btn" onClick={() => setAiPrompt('Sort a list using merge sort')}>
                  Merge Sort
                </button>
                <button className="example-btn" onClick={() => setAiPrompt('Create a simple calculator class')}>
                  Calculator Class
                </button>
                <button className="example-btn" onClick={() => setAiPrompt('Read a JSON file and extract data')}>
                  Read JSON
                </button>
                <button className="example-btn" onClick={() => setAiPrompt('Create a simple REST API endpoint')}>
                  REST API
                </button>
                <button className="example-btn" onClick={() => setAiPrompt('Write a function to check if a string is palindrome')}>
                  Palindrome Check
                </button>
                <button className="example-btn" onClick={() => setAiPrompt('Implement a linked list with insert and delete')}>
                  Linked List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
