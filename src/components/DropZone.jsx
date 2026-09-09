import { useRef, useState, useCallback } from 'react'
import { pickMarkdownFile, readFileAsText } from '../utils/fileUtils.js'
import { UploadIcon, FileTextIcon } from './Icons.jsx'

/**
 * Full-page drop zone displayed when no document is loaded.
 * Handles drag-and-drop and click-to-browse.
 */
export default function DropZone({ onFileLoaded, onError }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const inputRef = useRef(null)

  const processFiles = useCallback(async (files) => {
    const { file, error } = pickMarkdownFile(files)
    if (!file) {
      onError(error || 'No valid Markdown file found.')
      return
    }

    setIsReading(true)
    try {
      const text = await readFileAsText(file)
      onFileLoaded({ text, name: file.name })
    } catch (err) {
      onError(err.message || 'Failed to read file.')
    } finally {
      setIsReading(false)
    }
  }, [onFileLoaded, onError])

  /* ── Drag events ── */
  const onDragOver = useCallback(e => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(e => {
    // Only clear when leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }, [])

  const onDrop = useCallback(e => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  /* ── File input ── */
  const onInputChange = useCallback(e => {
    if (e.target.files?.length) {
      processFiles(e.target.files)
      // Reset input so same file can be re-selected
      e.target.value = ''
    }
  }, [processFiles])

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }, [])

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div
        id="drop-zone"
        role="button"
        tabIndex={0}
        aria-label="Drop zone. Press Enter or Space to open file picker."
        aria-describedby="drop-zone-hint"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onKeyDown={handleKeyDown}
        onClick={() => inputRef.current?.click()}
        className={`
          drop-zone
          w-full max-w-xl
          flex flex-col items-center justify-center gap-5
          p-10 sm:p-14
          border-2 border-dashed rounded-2xl
          cursor-pointer
          select-none
          transition-all duration-200
          ${isDragging
            ? 'drag-over border-accent bg-surface-700'
            : 'border-surface-500 bg-surface-800 hover:border-accent/60 hover:bg-surface-700'
          }
        `}
      >
        {/* Icon */}
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center
          transition-all duration-200
          ${isDragging ? 'bg-accent/20 text-accent scale-110' : 'bg-surface-700 text-gray-400'}
        `}>
          {isReading
            ? <SpinnerIcon className="w-8 h-8 animate-spin" />
            : <UploadIcon className="w-8 h-8" />
          }
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <p className="text-lg font-semibold text-gray-100">
            {isReading ? 'Reading file…' : isDragging ? 'Drop to open' : 'Drop your Markdown file here'}
          </p>
          <p className="text-sm text-gray-400" id="drop-zone-hint">
            or{' '}
            <span className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors">
              choose a .md file
            </span>
          </p>
        </div>

        {/* Format badge */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FileTextIcon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Supported: <code className="font-mono">.md</code> and <code className="font-mono">.markdown</code></span>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept=".md,.markdown,text/markdown,text/x-markdown"
          onChange={onInputChange}
          className="sr-only"
          aria-label="Choose Markdown file"
          tabIndex={-1}
        />
      </div>
    </div>
  )
}

function SpinnerIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M12 3a9 9 0 109 9" />
    </svg>
  )
}
