import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header.jsx'
import DropZone from './components/DropZone.jsx'
import MarkdownEditor from './components/MarkdownEditor.jsx'
import MarkdownPreview from './components/MarkdownPreview.jsx'
import TableOfContents from './components/TableOfContents.jsx'
import ResizableSplit from './components/ResizableSplit.jsx'
import ExportMenu from './components/ExportMenu.jsx'
import { downloadHtml, exportToPdf, exportToWord } from './utils/exportUtils.js'

export default function App() {
  // ── Core state ──────────────────────────────────────────────
  const [markdown, setMarkdown] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'dark'
  })

  const hasDocument = markdown !== '' || fileName !== ''

  // ── Apply theme to document ─────────────────────────────────
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
      document.body.classList.add('light')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
      document.body.classList.remove('light')
    }
  }, [theme])

  // ── Handlers ────────────────────────────────────────────────
  const handleFileLoaded = useCallback(({ text, name }) => {
    setError('')
    setMarkdown(text)
    setFileName(name)
  }, [])

  const handleError = useCallback((msg) => setError(msg), [])

  const handleClear = useCallback(() => {
    setMarkdown('')
    setFileName('')
    setError('')
  }, [])

  const handleToggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }, [])

  const handleExport = useCallback((format = 'html') => {
    if (!markdown) return
    const previewContainer = typeof document !== 'undefined' ? document.getElementById('preview-container') : null
    let result

    if (format === 'pdf') {
      result = exportToPdf(markdown, fileName, previewContainer)
    } else if (format === 'doc' || format === 'word') {
      result = exportToWord(markdown, fileName, previewContainer)
    } else {
      result = downloadHtml(markdown, fileName, previewContainer)
    }

    if (result && !result.success) {
      setError(result.error || `Export as ${format.toUpperCase()} failed. Please try again.`)
    }
  }, [markdown, fileName])

  const handleDownload = useCallback(() => {
    handleExport('html')
  }, [handleExport])

  const handleMarkdownChange = useCallback((text) => {
    setMarkdown(text)
    setError('')
  }, [])

  const dismissError = useCallback(() => setError(''), [])

  // ── Panels ──────────────────────────────────────────────────
  const editorPanel = (
    <MarkdownEditor
      value={markdown}
      onChange={handleMarkdownChange}
      fileName={fileName}
    />
  )

  const previewPanel = (
    <MarkdownPreview markdown={markdown} theme={theme} />
  )

  return (
    <div
      className={`
        h-screen flex flex-col overflow-hidden
        ${theme === 'dark' ? 'bg-surface-900' : 'bg-gray-100'}
        transition-colors duration-200
      `}
      data-testid="app-root"
    >
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        hasDocument={hasDocument}
        onClear={handleClear}
        onDownload={handleDownload}
        onExport={handleExport}
      />

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center justify-between px-4 py-2.5 bg-red-950/80 border-b border-red-800/60 text-sm text-red-300 flex-shrink-0"
        >
          <span>⚠ {error}</span>
          <button
            onClick={dismissError}
            className="ml-4 text-red-400 hover:text-red-200 focus-visible:outline-none"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main content */}
      {!hasDocument ? (
        <DropZone onFileLoaded={handleFileLoaded} onError={handleError} />
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* ── Desktop: horizontal resizable split ── */}
          <div className="flex-1 min-h-0 hidden lg:flex flex-col overflow-hidden">
            <ResizableSplit
              left={editorPanel}
              right={previewPanel}
              direction="horizontal"
              defaultSplit={50}
              minSize={15}
            />
          </div>

          {/* ── Mobile/Tablet: vertical resizable split ── */}
          <div className="flex-1 min-h-0 lg:hidden flex flex-col overflow-hidden">
            <ResizableSplit
              left={editorPanel}
              right={previewPanel}
              direction="vertical"
              defaultSplit={40}
              minSize={15}
            />
          </div>

          {/* TOC + Mobile export bar */}
          <div className="flex-shrink-0">
            {/* Mobile export menu bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-surface-600 sm:hidden bg-surface-800">
              <span className="text-xs text-gray-500 truncate max-w-40">{fileName}</span>
              <ExportMenu onExport={handleExport} theme={theme} compact dropDirection="up" />
            </div>

            <TableOfContents markdown={markdown} />
          </div>
        </div>
      )}
    </div>
  )
}
