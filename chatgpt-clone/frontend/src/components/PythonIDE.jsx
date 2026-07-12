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
          '&': { fontSize: '13px' },
          '.cm-scroller': { fontFamily: "'Monaco', 'Menlo', monospace", overflow: 'auto' },
          '.cm-content': { padding: '8px 0' },
          '.cm-gutters': { backgroundColor: 'transparent', border: 'none' },
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
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [showToc, setShowToc] = useState(false)
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
    const newId = Date.now()
    setCells(prev => [...prev, { id: newId, type: 'code', content: code }])
    setAiResponse('')
    setAiPrompt('')
  }

  return (
    <div className="colab-container">
      <div className="colab-toolbar">
        <div className="toolbar-left">
          <span className="colab-logo">📓</span>
          <span className="colab-title">Python Notebook</span>
          <div className="toolbar-divider" />
          <button className="toolbar-btn" onClick={() => addCell(null, 'code')}>
            <span className="btn-icon">+</span> Code
          </button>
          <button className="toolbar-btn" onClick={() => addCell(null, 'text')}>
            <span className="btn-icon">T</span> Text
          </button>
          <div className="toolbar-divider" />
          <button className="toolbar-btn run-all" onClick={runAllCells} disabled={loading}>
            ▶ Run All
          </button>
        </div>
        <div className="toolbar-right">
          <div className="runtime-badge">
            <span className="runtime-dot" />
            {loading ? 'Loading...' : runtimeInfo.python}
          </div>
          <button className={`toolbar-btn ai-btn ${showAiPanel ? 'active' : ''}`} onClick={() => setShowAiPanel(!showAiPanel)}>
            ✨ AI
          </button>
          <button className={`toolbar-btn ${showToc ? 'active' : ''}`} onClick={() => setShowToc(!showToc)}>
            ☰
          </button>
        </div>
      </div>

      <div className="colab-body">
        {showToc && (
          <div className="toc-sidebar">
            <div className="toc-header">Table of Contents</div>
            <div className="toc-list">
              {cells.map((cell, i) => (
                <div
                  key={cell.id}
                  className={`toc-item ${selectedCellId === cell.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCellId(cell.id)
                    document.getElementById(`cell-${cell.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                >
                  <span className="toc-number">[{i + 1}]</span>
                  <span className="toc-type">{cell.type === 'code' ? '🐍' : '📝'}</span>
                  <span className="toc-preview">{cell.content.split('\n')[0]?.slice(0, 30) || 'Empty'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="colab-cells">
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              id={`cell-${cell.id}`}
              className={`cell ${cell.type} ${selectedCellId === cell.id ? 'selected' : ''} ${runningCells.has(cell.id) ? 'running' : ''}`}
              onClick={() => setSelectedCellId(cell.id)}
            >
              <div className="cell-gutter">
                <div className="cell-number">[{index + 1}]</div>
                <div className="cell-actions-vertical">
                  <button className="cell-action-btn" onClick={(e) => { e.stopPropagation(); moveCell(cell.id, -1) }} title="Move up" disabled={index === 0}>↑</button>
                  <button className="cell-action-btn" onClick={(e) => { e.stopPropagation(); moveCell(cell.id, 1) }} title="Move down" disabled={index === cells.length - 1}>↓</button>
                </div>
              </div>

              <div className="cell-main">
                <div className="cell-toolbar">
                  <div className="cell-toolbar-left">
                    {cell.type === 'code' && (
                      <button className="cell-run-btn" onClick={(e) => { e.stopPropagation(); runCell(cell.id) }} disabled={loading}>
                        {runningCells.has(cell.id) ? <span className="spinner-small" /> : '▶'}
                      </button>
                    )}
                    <span className="cell-type-label">{cell.type === 'code' ? 'Code' : 'Text'}</span>
                  </div>
                  <div className="cell-toolbar-right">
                    <button className="cell-tool-btn" onClick={(e) => { e.stopPropagation(); toggleCellType(cell.id) }} title="Toggle type">
                      {cell.type === 'code' ? '📝' : '🐍'}
                    </button>
                    <button className="cell-tool-btn" onClick={(e) => { e.stopPropagation(); duplicateCell(cell.id) }} title="Duplicate">⧉</button>
                    <button className="cell-tool-btn delete" onClick={(e) => { e.stopPropagation(); deleteCell(cell.id) }} title="Delete" disabled={cells.length <= 1}>🗑</button>
                  </div>
                </div>

                <div className="cell-body">
                  {cell.type === 'code' ? (
                    <CellEditor cell={cell} onChange={(val) => setCells(prev => prev.map(c => c.id === cell.id ? { ...c, content: val } : c))} />
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

                {outputs[cell.id] && (
                  <div className={`cell-output ${outputs[cell.id].type === 'error' ? 'error' : ''}`}>
                    <div className="output-header">
                      <span className="output-label">Out [{index + 1}]:</span>
                      <button className="output-clear" onClick={(e) => { e.stopPropagation(); setOutputs(prev => { const n = { ...prev }; delete n[cell.id]; return n }) }}>×</button>
                    </div>
                    <pre className="output-content">{outputs[cell.id].content}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="add-cell-area">
            <button className="add-cell-btn" onClick={() => addCell(cells[cells.length - 1]?.id, 'code')}>
              <span>+</span> Code
            </button>
            <button className="add-cell-btn" onClick={() => addCell(cells[cells.length - 1]?.id, 'text')}>
              <span>+</span> Text
            </button>
          </div>
        </div>

        {showAiPanel && (
          <div className="ai-sidebar">
            <div className="ai-sidebar-header">
              <span>✨ AI Assistant</span>
              <button onClick={() => setShowAiPanel(false)}>×</button>
            </div>
            <div className="ai-sidebar-content">
              <textarea
                className="ai-textarea"
                placeholder="Describe what you want to generate...&#10;&#10;Examples:&#10;• Sort a list using quicksort&#10;• Binary search implementation&#10;• Read CSV and calculate average&#10;• Create a Flask API endpoint"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={5}
              />
              <button className="ai-generate-btn" onClick={generateWithAI} disabled={aiGenerating || !aiPrompt.trim()}>
                {aiGenerating ? 'Generating...' : '✨ Generate'}
              </button>

              {aiResponse && (
                <div className="ai-result">
                  <div className="ai-result-header">
                    <span>Generated Code</span>
                    <button className="ai-insert-btn" onClick={insertAiCode}>+ Add Cell</button>
                  </div>
                  <pre className="ai-code">{aiResponse}</pre>
                </div>
              )}

              <div className="ai-examples">
                <div className="examples-label">Quick Examples</div>
                {['Merge Sort', 'Calculator Class', 'REST API with Flask', 'Palindrome Check', 'Linked List', 'Read JSON file'].map(ex => (
                  <button key={ex} className="example-btn" onClick={() => setAiPrompt(ex)}>{ex}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="colab-statusbar">
        <span>Python {loading ? '...' : '3.12'} | Pyodide</span>
        <span>{cells.length} cells | {cells.filter(c => c.type === 'code').length} code</span>
        <span>Ctrl+Enter: Run | Shift+Ctrl+Enter: Run All</span>
      </div>
    </div>
  )
}
