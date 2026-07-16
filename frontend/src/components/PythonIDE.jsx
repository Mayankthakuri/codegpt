import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { markdown } from '@codemirror/lang-markdown'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { lintKeymap } from '@codemirror/lint'
import API_URL from '../config'

const WELCOME_CELLS = [
  { id: 1, type: 'code', content: `# Welcome to Python Notebook!\n# This is a Google Colab clone\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))` },
  { id: 2, type: 'text', content: `## Getting Started\n\nThis notebook works just like **Google Colab**:\n\n- Click **▶ Run** to execute code cells\n- Use **+ Code** or **+ Text** to add cells\n- AI assistant can generate code for you` },
  { id: 3, type: 'code', content: `# Try running this cell!\nnumbers = [1, 2, 3, 4, 5]\nsquared = [x**2 for x in numbers]\nprint(f"Squares: {squared}")` },
]

function CellEditor({ cell, onChange }) {
  const editorRef = useRef(null)
  const viewRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!editorRef.current) return

    const lang = cell.type === 'text' ? markdown() : python()

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
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...lintKeymap, indentWithTab]),
        lang,
        syntaxHighlighting(defaultHighlightStyle),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { fontSize: '13px', height: '100%' },
          '.cm-scroller': { fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace", overflow: 'auto' },
          '.cm-content': { padding: '8px 0', minHeight: '40px' },
          '.cm-gutters': { backgroundColor: 'transparent', border: 'none', minWidth: '0' },
          '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 0', minWidth: '24px' },
        }),
      ],
    })

    viewRef.current = new EditorView({ state, parent: editorRef.current })

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, [cell.id, cell.type])

  return <div ref={editorRef} className="cell-editor-content" />
}

function TextRenderer({ content }) {
  return (
    <div className="text-cell-content">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

export default function PythonIDE() {
  const [cells, setCells] = useState(WELCOME_CELLS)
  const [outputs, setOutputs] = useState({})
  const [runningCells, setRunningCells] = useState(new Set())
  const [pyodide, setPyodide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCellId, setSelectedCellId] = useState(null)
  const [hoveredCellId, setHoveredCellId] = useState(null)
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [runtimeInfo, setRuntimeInfo] = useState({ python: 'Loading...', memory: '—' })
  const cellsRef = useRef(cells)
  const pyodideRef = useRef(null)
  const selectedCellRef = useRef(selectedCellId)
  cellsRef.current = cells
  pyodideRef.current = pyodide
  selectedCellRef.current = selectedCellId

  useEffect(() => {
    loadPyodide()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        const id = selectedCellRef.current
        if (id) runCell(id)
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        runAllCells()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loadPyodide = async () => {
    try {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
      script.async = true
      script.onload = async () => {
        const py = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' })
        setPyodide(py)
        setRuntimeInfo({ python: 'Python 3.12 (Pyodide)', memory: 'Browser' })
        setLoading(false)
      }
      document.head.appendChild(script)
    } catch (err) {
      console.error('Failed to load Pyodide:', err)
      setLoading(false)
    }
  }

  const runCell = useCallback(async (cellId) => {
    const py = pyodideRef.current
    if (!py) return
    const cell = cellsRef.current.find(c => c.id === cellId)
    if (!cell || cell.type !== 'code') return

    setRunningCells(prev => new Set([...prev, cellId]))
    setOutputs(prev => ({ ...prev, [cellId]: '' }))

    try {
      py.runPython('import sys\nfrom io import StringIO\nsys.stdout = StringIO()')
      py.runPython(cell.content)
      const stdout = py.runPython('sys.stdout.getvalue()')
      py.runPython('sys.stdout = sys.__stdout__')
      setOutputs(prev => ({ ...prev, [cellId]: { type: 'text', content: stdout || '(no output)' } }))
    } catch (err) {
      setOutputs(prev => ({ ...prev, [cellId]: { type: 'error', content: err.message } }))
    } finally {
      setRunningCells(prev => { const n = new Set(prev); n.delete(cellId); return n })
    }
  }, [])

  const runAllCells = useCallback(async () => {
    for (const cell of cellsRef.current) {
      if (cell.type === 'code') await runCell(cell.id)
    }
  }, [runCell])

  const addCell = (afterId, type = 'code') => {
    const newId = Date.now()
    const newCell = { id: newId, type, content: '' }
    if (afterId) {
      const idx = cells.findIndex(c => c.id === afterId)
      setCells(prev => [...prev.slice(0, idx + 1), newCell, ...prev.slice(idx + 1)])
    } else {
      setCells(prev => [...prev, newCell])
    }
    setTimeout(() => setSelectedCellId(newId), 100)
  }

  const deleteCell = (cellId) => {
    if (cellsRef.current.length <= 1) return
    setCells(prev => prev.filter(c => c.id !== cellId))
    setOutputs(prev => { const n = { ...prev }; delete n[cellId]; return n })
    if (selectedCellId === cellId) setSelectedCellId(null)
  }

  const moveCell = (cellId, dir) => {
    const idx = cellsRef.current.findIndex(c => c.id === cellId)
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === cellsRef.current.length - 1)) return
    const newCells = [...cellsRef.current]
    const [removed] = newCells.splice(idx, 1)
    newCells.splice(idx + dir, 0, removed)
    setCells(newCells)
  }

  const duplicateCell = (cellId) => {
    const cell = cellsRef.current.find(c => c.id === cellId)
    if (!cell) return
    const newId = Date.now()
    const idx = cellsRef.current.findIndex(c => c.id === cellId)
    setCells(prev => [...prev.slice(0, idx + 1), { ...cell, id: newId }, ...prev.slice(idx + 1)])
  }

  const toggleCellType = (cellId) => {
    const cell = cellsRef.current.find(c => c.id === cellId)
    if (!cell) return
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, type: c.type === 'code' ? 'text' : 'code' } : c))
    if (cell.type === 'code') {
      setOutputs(prev => { const n = { ...prev }; delete n[cellId]; return n })
    }
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return
    setAiGenerating(true)
    setAiResponse('')

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Write Python code for: ${aiPrompt}\nReturn ONLY the code, no markdown or explanations.` }],
          stream: true,
        }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                fullText += parsed.choices[0].delta.content
                setAiResponse(fullText)
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      setAiResponse(`Error: ${err.message}`)
    } finally {
      setAiGenerating(false)
    }
  }

  const insertAiCode = () => {
    if (!aiResponse.trim()) return
    let code = aiResponse.replace(/```python\n?/g, '').replace(/```\n?/g, '').trim()
    
    const selectedId = selectedCellRef.current
    const selectedCell = cellsRef.current.find(c => c.id === selectedId)
    
    if (selectedCell && selectedCell.type === 'code') {
      setCells(prev => prev.map(c => c.id === selectedId ? { ...c, content: code } : c))
      setTimeout(() => runCell(selectedId), 100)
    } else {
      const newId = Date.now()
      setCells(prev => [...prev, { id: newId, type: 'code', content: code }])
      setSelectedCellId(newId)
      setTimeout(() => runCell(newId), 100)
    }
    
    setAiResponse('')
    setAiPrompt('')
  }

  return (
    <div className="colab-container">
      {/* Top Menu Bar */}
      <div className="colab-menubar">
        <div className="menubar-left">
          <span className="colab-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 8h20" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 3v5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="6" y="11" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
              <rect x="12" y="11" width="6" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
              <rect x="6" y="16" width="8" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
            </svg>
          </span>
          <span className="colab-title-text">Python Notebook</span>
        </div>
        <div className="menubar-center">
          <button className="menu-item">File</button>
          <button className="menu-item">Edit</button>
          <button className="menu-item">View</button>
          <button className="menu-item">Insert</button>
          <button className="menu-item">Runtime</button>
          <button className="menu-item">Tools</button>
          <button className="menu-item">Help</button>
        </div>
        <div className="menubar-right">
          <button className="menubar-btn ai-toggle" onClick={() => setShowAiPanel(!showAiPanel)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            AI
          </button>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="colab-toolbar">
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={() => addCell(null, 'code')} title="Add code cell">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <span>Code</span>
          </button>
          <button className="toolbar-btn" onClick={() => addCell(null, 'text')} title="Add text cell">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7V4h16v3"/>
              <path d="M9 20h6"/>
              <path d="M12 4v16"/>
            </svg>
            <span>Text</span>
          </button>
        </div>

        <div className="toolbar-divider-v" />

        <div className="toolbar-group">
          <button className="toolbar-btn play-btn" onClick={runAllCells} disabled={loading} title="Run all cells">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>Run all</span>
          </button>
        </div>

        <div className="toolbar-spacer" />

        <div className="toolbar-group">
          <div className="runtime-indicator">
            <div className={`runtime-dot ${loading ? 'loading' : 'connected'}`} />
            <span>{loading ? 'Connecting...' : 'Connected'}</span>
          </div>
        </div>
      </div>

      {/* Notebook Area */}
      <div className="colab-body">
        <div className="colab-cells">
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              id={`cell-${cell.id}`}
              className={`cell-wrapper ${cell.type} ${selectedCellId === cell.id ? 'selected' : ''} ${runningCells.has(cell.id) ? 'running' : ''}`}
              onClick={() => setSelectedCellId(cell.id)}
              onMouseEnter={() => setHoveredCellId(cell.id)}
              onMouseLeave={() => setHoveredCellId(null)}
            >
              {/* Cell Actions - Left Side */}
              <div className="cell-actions-left">
                {cell.type === 'code' && (
                  <button
                    className={`cell-play-btn ${runningCells.has(cell.id) ? 'running' : ''}`}
                    onClick={(e) => { e.stopPropagation(); runCell(cell.id) }}
                    disabled={loading}
                    title="Run cell"
                  >
                    {runningCells.has(cell.id) ? (
                      <div className="play-spinner" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* Cell Content */}
              <div className="cell-content">
                {/* Cell Type Indicator */}
                <div className="cell-type-indicator">
                  {cell.type === 'code' ? (
                    <span className="cell-badge code-badge">CODE</span>
                  ) : (
                    <span className="cell-badge text-badge">TEXT</span>
                  )}
                </div>

                {/* Editor */}
                <div className="cell-editor-area">
                  {cell.type === 'code' ? (
                    <CellEditor
                      cell={cell}
                      onChange={(val) => setCells(prev => prev.map(c => c.id === cell.id ? { ...c, content: val } : c))}
                    />
                  ) : (
                    <div className="text-cell-editor" onClick={() => {
                      const textarea = document.getElementById(`text-${cell.id}`)
                      if (textarea) textarea.focus()
                    }}>
                      <textarea
                        id={`text-${cell.id}`}
                        className="text-textarea"
                        value={cell.content}
                        onChange={(e) => setCells(prev => prev.map(c => c.id === cell.id ? { ...c, content: e.target.value } : c))}
                        placeholder="Type markdown here..."
                      />
                      <div className="text-preview">
                        <TextRenderer content={cell.content || '*Click to edit...*'} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Output */}
                {outputs[cell.id] && (
                  <div className={`cell-output ${outputs[cell.id].type === 'error' ? 'error' : ''}`}>
                    <div className="output-header">
                      <span className="output-label">Out [{index + 1}]:</span>
                      <button
                        className="output-clear-btn"
                        onClick={(e) => { e.stopPropagation(); setOutputs(prev => { const n = { ...prev }; delete n[cell.id]; return n }) }}
                        title="Clear output"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <pre className="output-content">{outputs[cell.id].content}</pre>
                  </div>
                )}
              </div>

              {/* Cell Actions - Right Side (on hover) */}
              {(hoveredCellId === cell.id || selectedCellId === cell.id) && (
                <div className="cell-actions-right">
                  <button className="cell-action-icon" onClick={(e) => { e.stopPropagation(); moveCell(cell.id, -1) }} title="Move up" disabled={index === 0}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                  <button className="cell-action-icon" onClick={(e) => { e.stopPropagation(); moveCell(cell.id, 1) }} title="Move down" disabled={index === cells.length - 1}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <button className="cell-action-icon" onClick={(e) => { e.stopPropagation(); toggleCellType(cell.id) }} title="Toggle type">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7V4h16v3"/>
                      <path d="M9 20h6"/>
                      <path d="M12 4v16"/>
                    </svg>
                  </button>
                  <button className="cell-action-icon" onClick={(e) => { e.stopPropagation(); duplicateCell(cell.id) }} title="Duplicate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                  <button className="cell-action-icon delete" onClick={(e) => { e.stopPropagation(); deleteCell(cell.id) }} title="Delete" disabled={cells.length <= 1}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Cell Buttons */}
          <div className="add-cell-container">
            <button className="add-cell-btn" onClick={() => addCell(cells[cells.length - 1]?.id, 'code')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Code
            </button>
            <button className="add-cell-btn" onClick={() => addCell(cells[cells.length - 1]?.id, 'text')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Text
            </button>
          </div>
        </div>

        {/* AI Sidebar */}
        {showAiPanel && (
          <div className="ai-sidebar">
            <div className="ai-sidebar-header">
              <div className="ai-header-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                AI Assistant
              </div>
              <button className="ai-close-btn" onClick={() => setShowAiPanel(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="ai-sidebar-content">
              <textarea
                className="ai-textarea"
                placeholder="Describe what you want to generate...&#10;&#10;Examples:&#10;• Sort a list using quicksort&#10;• Binary search implementation&#10;• Read CSV and calculate average&#10;• Create a Flask API endpoint"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
              />
              <button className="ai-generate-btn" onClick={generateWithAI} disabled={aiGenerating || !aiPrompt.trim()}>
                {aiGenerating ? (
                  <>
                    <div className="ai-spinner" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Generate
                  </>
                )}
              </button>

              {aiResponse && (
                <div className="ai-result">
                  <div className="ai-result-header">
                    <span>Generated Code</span>
                    <button className="ai-insert-btn" onClick={insertAiCode}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                      Run in Cell
                    </button>
                  </div>
                  <pre className="ai-code">{aiResponse}</pre>
                </div>
              )}

              <div className="ai-examples">
                <div className="examples-label">Quick Examples</div>
                {['Merge Sort', 'Calculator Class', 'REST API with Flask', 'Palindrome Check', 'Linked List', 'Read JSON file'].map(ex => (
                  <button key={ex} className="example-chip" onClick={() => setAiPrompt(ex)}>{ex}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="colab-statusbar">
        <div className="status-left">
          <span className="status-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            Python {loading ? '...' : '3.12'}
          </span>
          <span className="status-divider">|</span>
          <span className="status-item">{cells.length} cells</span>
          <span className="status-divider">|</span>
          <span className="status-item">{cells.filter(c => c.type === 'code').length} code</span>
        </div>
        <div className="status-right">
          <span className="status-item">Ctrl+Enter: Run</span>
          <span className="status-divider">|</span>
          <span className="status-item">Shift+Ctrl+Enter: Run All</span>
        </div>
      </div>
    </div>
  )
}
