/**
 * Markdown editor – simple textarea that preserves whitespace.
 * Updates parent state on every keystroke (live preview).
 */
export default function MarkdownEditor({ value, onChange, fileName }) {
  return (
    <section className="flex flex-col h-full min-h-0" aria-label="Markdown editor">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-600 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs font-mono text-gray-500 truncate max-w-32" title={fileName || 'editor'}>
            {fileName || 'markdown'}
          </span>
        </div>
        <span className="text-xs text-gray-600 hidden sm:block">
          {value.length.toLocaleString()} chars
        </span>
      </div>

      {/* Textarea */}
      <div className="flex-1 min-h-0 p-2">
        <textarea
          id="markdown-editor"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="editor-textarea h-full"
          placeholder="Type or paste Markdown here…"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Markdown source editor"
          aria-multiline="true"
        />
      </div>
    </section>
  )
}
