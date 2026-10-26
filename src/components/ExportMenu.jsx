import { useState, useRef, useEffect, useCallback } from 'react'
import {
  DownloadIcon,
  ChevronDownIcon,
  HtmlIcon,
  PdfIcon,
  DocIcon,
} from './Icons.jsx'

/**
 * Modern Export dropdown menu supporting HTML, PDF, and Word Document export.
 */
export default function ExportMenu({ onExport, theme = 'dark', compact = false, dropDirection = 'down' }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleSelect = useCallback((format) => {
    closeMenu()
    if (typeof onExport === 'function') {
      onExport(format)
    }
  }, [closeMenu, onExport])

  // Handle outside click & Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMenu()
        triggerRef.current?.focus()
      }
    }

    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen, closeMenu])

  const isDropup = dropDirection === 'up'

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        id="export-dropdown-btn"
        type="button"
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Export document in HTML, PDF, or Word format"
        className={`
          inline-flex items-center gap-1.5 font-medium rounded-lg
          bg-accent text-white hover:bg-accent-hover
          transition-colors duration-150 cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
          ${compact ? 'text-xs px-2.5 py-1.5' : 'text-sm px-3 py-1.5'}
        `}
      >
        <DownloadIcon className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} aria-hidden="true" />
        <span>Export</span>
        <ChevronDownIcon
          className={`
            transition-transform duration-150
            ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}
            ${isOpen ? (isDropup ? '-rotate-180' : 'rotate-180') : ''}
          `}
          aria-hidden="true"
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="export-dropdown-btn"
          className={`
            absolute right-0 z-50 w-64 rounded-xl p-1.5 shadow-xl border
            focus:outline-none animate-fadeIn
            ${isDropup ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'}
            ${theme === 'dark'
              ? 'bg-surface-800 border-surface-600 text-gray-100 shadow-black/40'
              : 'bg-white border-gray-200 text-gray-800 shadow-gray-400/20'
            }
          `}
        >
          {/* Header title */}
          <div className="px-2.5 py-1.5 mb-1 border-b border-surface-600/40">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400">
              Export Formats
            </span>
          </div>

          {/* Option: HTML */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('html')}
            className={`
              w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer
              ${theme === 'dark'
                ? 'hover:bg-surface-700 active:bg-surface-600 text-gray-200 hover:text-white'
                : 'hover:bg-blue-50 active:bg-blue-100 text-gray-700 hover:text-blue-900'
              }
            `}
          >
            <div className="mt-0.5 p-1 rounded-md bg-blue-500/10 text-blue-400 flex-shrink-0">
              <HtmlIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">HTML Document</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface-600/50 text-gray-400">.html</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight mt-0.5 truncate">
                Standalone self-contained web page
              </p>
            </div>
          </button>

          {/* Option: PDF */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('pdf')}
            className={`
              w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer mt-1
              ${theme === 'dark'
                ? 'hover:bg-surface-700 active:bg-surface-600 text-gray-200 hover:text-white'
                : 'hover:bg-red-50 active:bg-red-100 text-gray-700 hover:text-red-900'
              }
            `}
          >
            <div className="mt-0.5 p-1 rounded-md bg-red-500/10 text-red-400 flex-shrink-0">
              <PdfIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">PDF Document</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface-600/50 text-gray-400">.pdf</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight mt-0.5 truncate">
                Print layout with vector diagrams
              </p>
            </div>
          </button>

          {/* Option: Word (Doc) */}
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('doc')}
            className={`
              w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer mt-1
              ${theme === 'dark'
                ? 'hover:bg-surface-700 active:bg-surface-600 text-gray-200 hover:text-white'
                : 'hover:bg-indigo-50 active:bg-indigo-100 text-gray-700 hover:text-indigo-900'
              }
            `}
          >
            <div className="mt-0.5 p-1 rounded-md bg-indigo-500/10 text-indigo-400 flex-shrink-0">
              <DocIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Word Document</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface-600/50 text-gray-400">.doc</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight mt-0.5 truncate">
                Editable in Microsoft Word & Docs
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
