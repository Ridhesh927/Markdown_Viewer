import { SunIcon, MoonIcon, MarkdownBadgeIcon } from './Icons.jsx'
import ExportMenu from './ExportMenu.jsx'

/**
 * Top app header with branding, theme toggle, and export / action controls.
 */
export default function Header({
  theme,
  onToggleTheme,
  hasDocument,
  onClear,
  onDownload,
  onExport,
}) {
  const handleExport = onExport || onDownload

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
            <div className="hidden sm:inline-block">
              <ExportMenu onExport={handleExport} theme={theme} />
            </div>

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
