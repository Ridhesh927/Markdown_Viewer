import { renderMarkdown } from './markdownRenderer.js'

/**
 * Embedded CSS for the standalone HTML export.
 * Self-contained – no external dependencies.
 */
const EXPORT_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    font-size: 16px;
    line-height: 1.75;
    color: #e6edf3;
    background: #0d1117;
    margin: 0;
    padding: 2rem 1rem;
  }
  main.markdown-body {
    max-width: 800px;
    margin: 0 auto;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    color: #f0f6fc;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.3;
    scroll-margin-top: 2rem;
  }
  h1 { font-size: 2em; border-bottom: 1px solid #30363d; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #30363d; padding-bottom: 0.2em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1em; }
  p { margin: 0 0 1em; }
  a { color: #58a6ff; text-decoration: underline; text-underline-offset: 2px; }
  a:hover { color: #79b8ff; }
  ul, ol { margin-bottom: 1em; padding-left: 2em; }
  ul { list-style-type: disc; }
  ol { list-style-type: decimal; }
  li { margin-bottom: 0.25em; }
  blockquote {
    border-left: 4px solid #3d444d;
    padding: 0.5em 1em;
    margin: 0 0 1em;
    background: #161b22;
    color: #8b949e;
    border-radius: 0 6px 6px 0;
  }
  blockquote p:last-child { margin-bottom: 0; }
  code:not(pre code) {
    background: #21262d;
    color: #ff79c6;
    padding: 0.15em 0.4em;
    border-radius: 4px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.875em;
  }
  pre {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1em;
  }
  pre code {
    display: block;
    padding: 1.25em;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.875em;
    line-height: 1.6;
    background: transparent;
    color: #e6edf3;
    white-space: pre;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1em;
    overflow-x: auto;
    display: block;
    font-size: 0.9em;
  }
  thead { background: #21262d; }
  th, td { padding: 0.5em 1em; border: 1px solid #30363d; text-align: left; }
  th { font-weight: 600; color: #f0f6fc; }
  tr:nth-child(even) { background: #161b22; }
  img { max-width: 100%; height: auto; border-radius: 6px; display: block; margin: 0.5em auto; }
  hr { border: none; border-top: 1px solid #30363d; margin: 1.5em 0; }
  .code-block-wrapper { position: relative; margin-bottom: 1em; }
  .code-block-wrapper pre { margin-bottom: 0; }
  /* Syntax tokens */
  .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #8b949e; }
  .token.punctuation { color: #c9d1d9; }
  .token.property, .token.tag, .token.constant, .token.symbol, .token.deleted { color: #ff7b72; }
  .token.boolean, .token.number { color: #79c0ff; }
  .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #a5d6ff; }
  .token.operator, .token.entity, .token.url { color: #ffa657; }
  .token.atrule, .token.attr-value, .token.keyword { color: #ff7b72; }
  .token.function, .token.class-name { color: #d2a8ff; }
  .token.regex, .token.important, .token.variable { color: #ffa657; }
`

const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i

/**
 * Sanitize a filename to prevent path traversal, reserved OS names, and empty basenames.
 * @param {string} fileName
 * @returns {string}
 */
export function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') return 'markdown-document'

  // Strip path traversal components
  const base = fileName.split(/[\\/]/).pop() || ''
  // Strip extension and dangerous characters
  let clean = base.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_\-. ]/g, '_').trim()

  // Avoid empty, dots-only, or Windows reserved device names
  if (!clean || /^\.+$/.test(clean) || WINDOWS_RESERVED_NAMES.test(clean)) {
    clean = 'markdown-document'
  }

  return clean
}

/**
 * Build a complete standalone HTML document from markdown.
 *
 * @param {string} markdown  Raw markdown text
 * @param {string} fileName  Original filename (e.g. "README.md")
 * @returns {string}         Complete HTML document as a string
 */
export function buildStandaloneHtml(markdown, fileName) {
  const sanitizedHtml = renderMarkdown(markdown)
  const safeTitle = sanitizeFileName(fileName)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https: http:; font-src https: data:; form-action 'none'; base-uri 'none';" />
  <meta name="referrer" content="no-referrer" />
  <title>${escapeAttr(safeTitle)}</title>
  <style>${EXPORT_CSS}</style>
</head>
<body>
  <main class="markdown-body">
    ${sanitizedHtml}
  </main>
</body>
</html>`
}

function escapeAttr(str) {
  return str.replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

/**
 * Trigger a browser download of the rendered document.
 *
 * @param {string} markdown
 * @param {string} fileName  Original .md file name, or empty string
 * @returns {{success: boolean, error?: string}}
 */
export function downloadHtml(markdown, fileName) {
  try {
    const html = buildStandaloneHtml(markdown, fileName)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    // Derive output filename safely
    const baseName = sanitizeFileName(fileName)
    const outName = `${baseName}.html`

    const a = document.createElement('a')
    a.href = url
    a.download = outName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (err) {
    console.error('Download error:', err)
    return { success: false, error: err.message || 'Download failed.' }
  }
}
