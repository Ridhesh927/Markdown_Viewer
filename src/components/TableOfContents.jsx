import { useMemo, useState, useCallback } from 'react'
import { buildToc } from '../utils/toc.js'
import { ListIcon, ChevronRightIcon } from './Icons.jsx'

/**
 * Table of Contents panel.
 * Generates TOC from current Markdown, renders a clickable hierarchy.
 */
export default function TableOfContents({ markdown }) {
  const [isOpen, setIsOpen] = useState(true)

  const toc = useMemo(() => buildToc(markdown), [markdown])

  const scrollToHeading = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Move focus for accessibility
      el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
    }
  }, [])

  if (toc.length === 0) return null

  return (
    <aside
      className="border-t border-surface-600 bg-surface-800 flex-shrink-0"
      aria-label="Table of contents"
    >
      {/* Toggle header */}
      <button
        id="toc-toggle-btn"
        onClick={() => setIsOpen(o => !o)}
        className="
          w-full flex items-center justify-between
          px-4 py-2.5 text-left
          text-sm font-medium text-gray-300
          hover:text-gray-100
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-accent
        "
        aria-expanded={isOpen}
        aria-controls="toc-content"
      >
        <div className="flex items-center gap-2">
          <ListIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <span>Table of Contents</span>
          <span className="text-xs text-gray-600 font-normal">({toc.length})</span>
        </div>
        <ChevronRightIcon
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* TOC list */}
      {isOpen && (
        <nav id="toc-content" aria-label="Document headings">
          <ol
            className="px-4 pb-3 max-h-48 overflow-y-auto space-y-0.5"
            role="list"
          >
            {toc.map((item) => (
              <TocItem key={item.id} item={item} onActivate={scrollToHeading} />
            ))}
          </ol>
        </nav>
      )}
    </aside>
  )
}

function TocItem({ item, onActivate }) {
  const indent = (item.level - 1) * 16

  return (
    <li role="listitem">
      <a
        href={`#${item.id}`}
        className="
          inline-block w-full py-0.5
          text-sm text-gray-400
          hover:text-accent
          transition-colors duration-100
          rounded
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
          truncate
        "
        style={{ paddingLeft: `${indent}px` }}
        onClick={(e) => {
          e.preventDefault()
          onActivate(item.id)
        }}
        title={item.text}
        aria-label={`Navigate to heading: ${item.text}`}
      >
        {item.level > 1 && (
          <span className="text-gray-600 mr-1" aria-hidden="true">
            {'·'.repeat(item.level - 1)}
          </span>
        )}
        {item.text}
      </a>
    </li>
  )
}
