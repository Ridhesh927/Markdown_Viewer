import { SunIcon, MoonIcon, MarkdownBadgeIcon } from './Icons.jsx'

/**
 * Top app header with branding, theme toggle, and optional action buttons.
 */
export default function Header({ theme, onToggleTheme, hasDocument, onClear, onDownload }) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface-800 border-b border-surface-600 shadow-md flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 min-w-0">
        <MarkdownBadgeIcon className="w-6 h-6 flex-shrink-0 drop-shadow-sm" />
        <h1 className="text-base sm:text-lg font-semibold text-gray-100 truncate tracking-tight">
          Markdown Live Viewer
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {hasDocument && (
          <>
            <button
              id="download-html-btn"
              onClick={onDownload}
              className="
                hidden sm:inline-flex items-center gap-1.5 text-sm font-medium
                px-3 py-1.5 rounded-lg
                bg-accent text-white
                hover:bg-accent-hover
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
              "
              aria-label="Download as standalone HTML file"
            >
              <DownloadIcon className="w-4 h-4" aria-hidden="true" />
              Download HTML
            </button>

            <button
              id="clear-btn"
              onClick={onClear}
              className="
                text-sm font-medium px-3 py-1.5 rounded-lg
                text-gray-400 hover:text-red-400
                border border-surface-600 hover:border-red-400/50
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400
              "
              aria-label="Clear document and return to empty state"
            >
              Clear
            </button>
          </>
        )}

        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          className="
            p-2 rounded-lg
            text-gray-400 hover:text-gray-100
            border border-surface-600 hover:border-surface-500
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
          "
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark'
            ? <SunIcon className="w-4 h-4" aria-hidden="true" />
            : <MoonIcon className="w-4 h-4" aria-hidden="true" />
          }
        </button>
      </div>
    </header>
  )
}

function DownloadIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}
