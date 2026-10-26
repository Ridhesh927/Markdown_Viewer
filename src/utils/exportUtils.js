import { renderMarkdown } from './markdownRenderer.js'

/**
 * Embedded CSS for the standalone HTML export.
 * Self-contained – no external dependencies.
 */
export const EXPORT_CSS = `
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
  .mermaid-diagram {
    margin: 1.5em 0;
    padding: 1em;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    overflow-x: auto;
    text-align: center;
  }
  .mermaid-diagram svg {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
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

/**
 * Print stylesheet for PDF generation.
 * Optimized for crisp vector text, proper pagination, clean margins, and light background.
 */
export const PDF_PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 18mm 16mm 18mm 16mm;
  }
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.6;
    color: #1f2937;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }
  main.markdown-body {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  h1, h2, h3, h4, h5, h6 {
    color: #111827;
    page-break-after: avoid;
    break-after: avoid;
    margin-top: 1.4em;
    margin-bottom: 0.5em;
    line-height: 1.3;
  }
  h1 {
    font-size: 22pt;
    font-weight: 700;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.3em;
    margin-top: 0;
  }
  h2 {
    font-size: 16pt;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.25em;
  }
  h3 { font-size: 13pt; font-weight: 600; }
  h4 { font-size: 11pt; font-weight: 600; }
  p { margin: 0 0 0.85em; }
  a { color: #2563eb; text-decoration: underline; }
  ul, ol { margin: 0 0 0.85em; padding-left: 1.8em; }
  li { margin-bottom: 0.25em; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    page-break-inside: avoid;
    break-inside: avoid;
    font-size: 9.5pt;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6pt 9pt;
    text-align: left;
  }
  th {
    background-color: #f1f5f9 !important;
    font-weight: 600;
    color: #0f172a;
  }
  tr:nth-child(even) td {
    background-color: #f8fafc !important;
  }
  blockquote {
    border-left: 4px solid #94a3b8;
    padding: 6pt 12pt;
    margin: 1em 0;
    color: #475569;
    background: #f8fafc !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  pre {
    background: #f8fafc !important;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10pt;
    margin: 1em 0;
    page-break-inside: avoid;
    break-inside: avoid;
    overflow-x: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 9pt;
    line-height: 1.5;
  }
  pre code {
    background: transparent !important;
    color: #1f2937 !important;
    padding: 0;
  }
  code:not(pre code) {
    background: #f1f5f9 !important;
    color: #be185d;
    padding: 0.15em 0.35em;
    border-radius: 4px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 8.5pt;
  }
  .mermaid-diagram {
    margin: 1.2em 0;
    padding: 8pt;
    page-break-inside: avoid;
    break-inside: avoid;
    text-align: center;
    background: #ffffff !important;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
  }
  .mermaid-diagram svg {
    max-width: 100%;
    height: auto;
    margin: 0 auto;
    display: block;
  }
  img {
    max-width: 100%;
    height: auto;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 1.5em 0;
  }
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

export function escapeAttr(str) {
  if (!str) return ''
  return String(str).replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

/**
 * Extract HTML content for export, optionally taking rendered DOM content
 * (which contains rendered Mermaid SVGs and syntax tokens) or falling back to rendered Markdown.
 *
 * @param {string} markdown
 * @param {HTMLElement|null} previewElement
 * @returns {string}
 */
export function getExportHtml(markdown, previewElement = null) {
  let contentHtml = ''

  if (previewElement) {
    try {
      const clone = previewElement.cloneNode(true)
      // Remove any injected Copy buttons from code blocks
      clone.querySelectorAll('.copy-btn').forEach(btn => btn.remove())
      contentHtml = clone.innerHTML
    } catch {
      // Fallback
    }
  }

  // If not provided or empty, render directly from markdown
  if (!contentHtml || !contentHtml.trim()) {
    contentHtml = renderMarkdown(markdown || '')
  }

  return contentHtml
}

/**
 * Build a complete standalone HTML document string from content.
 *
 * @param {string} contentHtml
 * @param {string} fileName
 * @returns {string}
 */
export function buildStandaloneHtmlFromContent(contentHtml, fileName) {
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
    ${contentHtml}
  </main>
</body>
</html>`
}

/**
 * Build a complete standalone HTML document from raw markdown.
 * Preserves backwards compatibility.
 *
 * @param {string} markdown
 * @param {string} fileName
 * @returns {string}
 */
export function buildStandaloneHtml(markdown, fileName) {
  const sanitizedHtml = renderMarkdown(markdown)
  return buildStandaloneHtmlFromContent(sanitizedHtml, fileName)
}

/**
 * Build a Microsoft Word-compatible HTML document string.
 * Uses Word XML namespace metadata and Calibri typography for seamless opening
 * in Microsoft Word, Google Docs, and LibreOffice.
 *
 * @param {string} contentHtml
 * @param {string} fileName
 * @returns {string}
 */
export function buildWordDocumentHtml(contentHtml, fileName) {
  const safeTitle = sanitizeFileName(fileName)

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${escapeAttr(safeTitle)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 8.5in 11in;
      margin: 1in 1in 1in 1in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
    }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Calibri Light', 'Segoe UI', Arial, sans-serif;
      color: #1f2937;
      margin-top: 18pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    h1 {
      font-size: 20pt;
      font-weight: bold;
      border-bottom: 2pt solid #2563eb;
      padding-bottom: 4pt;
      color: #1e3a8a;
    }
    h2 {
      font-size: 15pt;
      font-weight: bold;
      border-bottom: 1pt solid #cbd5e1;
      padding-bottom: 3pt;
      color: #1e40af;
    }
    h3 { font-size: 12.5pt; font-weight: bold; color: #1f2937; }
    h4 { font-size: 11pt; font-weight: bold; }
    p { margin-top: 0; margin-bottom: 8pt; }
    a { color: #2563eb; text-decoration: underline; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8pt;
      margin-bottom: 12pt;
    }
    th, td {
      border: 1pt solid #cbd5e1;
      padding: 6pt 8pt;
      text-align: left;
      font-size: 10pt;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #0f172a;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    blockquote {
      border-left: 3pt solid #94a3b8;
      padding-left: 10pt;
      margin-left: 0;
      margin-right: 0;
      margin-bottom: 8pt;
      color: #475569;
      font-style: italic;
      background-color: #f8fafc;
      padding-top: 4pt;
      padding-bottom: 4pt;
    }
    pre {
      background-color: #f1f5f9;
      border: 1pt solid #cbd5e1;
      border-radius: 4pt;
      padding: 8pt;
      margin-bottom: 8pt;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9.5pt;
      line-height: 1.4;
    }
    code:not(pre code) {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9.5pt;
      background-color: #f1f5f9;
      color: #be185d;
      padding: 1pt 3pt;
      border-radius: 2pt;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 8pt;
      padding-left: 24pt;
    }
    li { margin-bottom: 3pt; }
    img { max-width: 100%; height: auto; margin: 8pt 0; }
    hr { border: none; border-top: 1pt solid #cbd5e1; margin: 14pt 0; }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>`
}

/**
 * Trigger browser download for HTML.
 *
 * @param {string} markdown
 * @param {string} fileName
 * @param {HTMLElement|null} previewElement
 * @returns {{success: boolean, error?: string}}
 */
export function downloadHtml(markdown, fileName, previewElement = null) {
  try {
    const contentHtml = getExportHtml(markdown, previewElement)
    const html = buildStandaloneHtmlFromContent(contentHtml, fileName)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)

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
    console.error('HTML export error:', err)
    return { success: false, error: err.message || 'HTML export failed.' }
  }
}

/**
 * Trigger browser download for Word Document (.doc format).
 *
 * @param {string} markdown
 * @param {string} fileName
 * @param {HTMLElement|null} previewElement
 * @returns {{success: boolean, error?: string}}
 */
export function exportToWord(markdown, fileName, previewElement = null) {
  try {
    const contentHtml = getExportHtml(markdown, previewElement)
    const wordHtml = buildWordDocumentHtml(contentHtml, fileName)

    // Using \ufeff (UTF-8 BOM) guarantees Microsoft Word decodes UTF-8 text flawlessly
    const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const baseName = sanitizeFileName(fileName)
    const outName = `${baseName}.doc`

    const a = document.createElement('a')
    a.href = url
    a.download = outName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (err) {
    console.error('Word export error:', err)
    return { success: false, error: err.message || 'Word export failed.' }
  }
}

/**
 * Export to PDF using native browser print layout with clean, vector-sharp typography
 * and automatic pagination.
 *
 * @param {string} markdown
 * @param {string} fileName
 * @param {HTMLElement|null} previewElement
 * @returns {{success: boolean, error?: string}}
 */
export function exportToPdf(markdown, fileName, previewElement = null) {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { success: false, error: 'PDF export requires a browser environment.' }
    }

    const contentHtml = getExportHtml(markdown, previewElement)
    const safeTitle = sanitizeFileName(fileName)

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.title = 'PDF Print Preview'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (!doc) {
      document.body.removeChild(iframe)
      throw new Error('Unable to create print frame.')
    }

    doc.open()
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeAttr(safeTitle)}</title>
  <style>${PDF_PRINT_CSS}</style>
</head>
<body>
  <main class="markdown-body">
    ${contentHtml}
  </main>
</body>
</html>`)
    doc.close()

    let hasPrinted = false
    const triggerPrint = () => {
      if (hasPrinted) return
      hasPrinted = true
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch (printErr) {
        console.error('Print execution error:', printErr)
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe)
          }
        }, 2000)
      }
    }

    if (iframe.contentWindow) {
      iframe.contentWindow.onload = triggerPrint
      setTimeout(triggerPrint, 300)
    } else {
      triggerPrint()
    }

    return { success: true }
  } catch (err) {
    console.error('PDF export error:', err)
    return { success: false, error: err.message || 'PDF export failed.' }
  }
}
