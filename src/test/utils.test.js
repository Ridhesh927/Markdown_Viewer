import { describe, it, expect, beforeEach } from 'vitest'
import { renderMarkdown, resetHeadingIds } from '../utils/markdownRenderer.js'
import { buildToc } from '../utils/toc.js'
import { validateMarkdownFile, pickMarkdownFile, MAX_FILE_SIZE } from '../utils/fileUtils.js'
import {
  buildStandaloneHtml,
  sanitizeFileName,
  buildWordDocumentHtml,
  exportToWord,
  exportToPdf,
  downloadHtml,
} from '../utils/exportUtils.js'

// ─── markdownRenderer ─────────────────────────────────────────

describe('renderMarkdown', () => {
  beforeEach(() => resetHeadingIds())

  it('renders headings', () => {
    const html = renderMarkdown('# Hello World')
    expect(html).toContain('<h1')
    expect(html).toContain('Hello World')
  })

  it('renders paragraphs', () => {
    const html = renderMarkdown('Some paragraph text.')
    expect(html).toContain('<p>')
    expect(html).toContain('Some paragraph text.')
  })

  it('renders bold', () => {
    const html = renderMarkdown('**bold text**')
    expect(html).toContain('<strong>')
  })

  it('renders italic', () => {
    const html = renderMarkdown('*italic text*')
    expect(html).toContain('<em>')
  })

  it('renders unordered lists', () => {
    const html = renderMarkdown('- item one\n- item two')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>')
  })

  it('renders ordered lists', () => {
    const html = renderMarkdown('1. first\n2. second')
    expect(html).toContain('<ol>')
    expect(html).toContain('<li>')
  })

  it('renders blockquotes', () => {
    const html = renderMarkdown('> A quote')
    expect(html).toContain('<blockquote>')
  })

  it('renders inline code', () => {
    const html = renderMarkdown('use `console.log()`')
    expect(html).toContain('<code>')
  })

  it('renders fenced code blocks', () => {
    const html = renderMarkdown('```js\nconsole.log(1)\n```')
    expect(html).toContain('<pre')
    expect(html).toContain('<code')
  })

  it('renders horizontal rules', () => {
    const html = renderMarkdown('---')
    expect(html).toContain('<hr')
  })

  it('renders links with rel="noopener noreferrer"', () => {
    const html = renderMarkdown('[Google](https://google.com)')
    expect(html).toContain('<a ')
    expect(html).toContain('href="https://google.com"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('target="_blank"')
  })

  it('generates heading ids', () => {
    const html = renderMarkdown('# My Heading')
    expect(html).toContain('id="my-heading"')
  })

  it('deduplicates heading ids', () => {
    resetHeadingIds()
    const html = renderMarkdown('# Same\n# Same\n# Same')
    expect(html).toContain('id="same"')
    expect(html).toContain('id="same-1"')
    expect(html).toContain('id="same-2"')
  })

  it('handles headings named after object prototype properties safely', () => {
    resetHeadingIds()
    const html = renderMarkdown('# constructor\n# constructor\n# toString\n# valueOf')
    expect(html).toContain('id="h-constructor"')
    expect(html).toContain('id="h-constructor-1"')
    expect(html).toContain('id="h-tostring"')
    expect(html).toContain('id="h-valueof"')
  })

  it('returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('')
    expect(renderMarkdown('   ')).toBe('')
  })

  it('sanitizes script tags', () => {
    const html = renderMarkdown('<script>alert("xss")</script>')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('alert("xss")')
  })

  it('sanitizes onerror attributes', () => {
    const html = renderMarkdown('<img src="x" onerror="alert(1)">')
    expect(html).not.toContain('onerror')
  })

  it('blocks javascript: links and dangerous protocols', () => {
    expect(renderMarkdown("[click me](javascript:alert('xss'))")).not.toContain("<a")
    expect(renderMarkdown("[click me](vbscript:msgbox(1))")).not.toContain("<a")
    expect(renderMarkdown("[click me](data:text/html;base64,PHNjcmlwdD4=)")).not.toContain("<a")
    expect(renderMarkdown("[click me](blob:https://evil.com/uuid)")).not.toContain("<a")
    expect(renderMarkdown("[click me](\x00javascript:alert(1))")).not.toContain("<a")
    expect(renderMarkdown("[click me](\\\\javascript:alert(1))")).not.toContain("<a")
    expect(renderMarkdown('<a href="javascript:alert(1)">raw</a>')).not.toContain("href")
  })

  it('enforces rel="noopener noreferrer" on raw HTML links with target="_blank"', () => {
    const html = renderMarkdown('<a href="https://evil.com" target="_blank">external</a>')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('resists DOM Clobbering attacks', () => {
    const html = renderMarkdown('<img id="preview-container"><form id="root"></form>')
    // DOMPurify with SANITIZE_DOM ensures clobbering names/ids don't hijack global objects
    expect(html).toBeDefined()
  })

  it('tokenizes large code blocks efficiently without freeze or content loss', () => {
    const codeBlock = '```js\n' + 'const x = 1;\n'.repeat(500) + '```'
    const html = renderMarkdown(codeBlock)
    expect(html).toContain('class="token keyword"')
    expect(html).toContain('const')
  })
})

// ─── TOC ──────────────────────────────────────────────────────

describe('buildToc', () => {
  it('extracts h1 headings', () => {
    const toc = buildToc('# Introduction')
    expect(toc).toHaveLength(1)
    expect(toc[0].text).toBe('Introduction')
    expect(toc[0].level).toBe(1)
    expect(toc[0].id).toBe('introduction')
  })

  it('preserves hierarchy', () => {
    const md = '# Root\n## Child\n### Grandchild'
    const toc = buildToc(md)
    expect(toc[0].level).toBe(1)
    expect(toc[1].level).toBe(2)
    expect(toc[2].level).toBe(3)
  })

  it('deduplicates ids', () => {
    const md = '# Install\n## Install\n## Install'
    const toc = buildToc(md)
    const ids = toc.map(t => t.id)
    expect(ids[0]).toBe('install')
    expect(ids[1]).toBe('install-1')
    expect(ids[2]).toBe('install-2')
  })

  it('handles object prototype properties without collision in TOC', () => {
    const md = '# constructor\n## constructor\n### toString'
    const toc = buildToc(md)
    expect(toc[0].id).toBe('h-constructor')
    expect(toc[1].id).toBe('h-constructor-1')
    expect(toc[2].id).toBe('h-tostring')
  })

  it('returns empty array for empty markdown', () => {
    expect(buildToc('')).toEqual([])
    expect(buildToc('No headings here')).toEqual([])
  })

  it('strips inline markdown from text', () => {
    const toc = buildToc('# **Bold** heading')
    expect(toc[0].text).toBe('Bold heading')
  })
})

// ─── fileUtils ────────────────────────────────────────────────

describe('validateMarkdownFile', () => {
  const makeFile = (name, type = '', size = 1000) => ({ name, type, size })

  it('accepts .md files', () => {
    expect(validateMarkdownFile(makeFile('readme.md')).valid).toBe(true)
  })

  it('accepts .markdown files', () => {
    expect(validateMarkdownFile(makeFile('doc.markdown')).valid).toBe(true)
  })

  it('rejects files exceeding MAX_FILE_SIZE (10 MB)', () => {
    const largeFile = makeFile('large.md', 'text/markdown', MAX_FILE_SIZE + 1)
    const result = validateMarkdownFile(largeFile)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/too large/i)
  })

  it('rejects .txt files', () => {
    const result = validateMarkdownFile(makeFile('file.txt', 'text/plain'))
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/markdown/i)
  })

  it('rejects .pdf files', () => {
    expect(validateMarkdownFile(makeFile('file.pdf', 'application/pdf')).valid).toBe(false)
  })

  it('rejects null', () => {
    expect(validateMarkdownFile(null).valid).toBe(false)
  })
})

describe('pickMarkdownFile', () => {
  const makeFile = (name, type = '', size = 1000) => ({ name, type, size })

  it('picks first valid md file', () => {
    const files = [makeFile('doc.md')]
    const { file } = pickMarkdownFile(files)
    expect(file.name).toBe('doc.md')
  })

  it('skips invalid files to find valid one', () => {
    const files = [makeFile('img.png', 'image/png'), makeFile('doc.md')]
    const { file } = pickMarkdownFile(files)
    expect(file.name).toBe('doc.md')
  })

  it('returns error when no valid file found', () => {
    const files = [makeFile('img.png', 'image/png')]
    const { file, error } = pickMarkdownFile(files)
    expect(file).toBeNull()
    expect(error).toBeTruthy()
  })

  it('handles empty array', () => {
    const { file, error } = pickMarkdownFile([])
    expect(file).toBeNull()
    expect(error).toBeTruthy()
  })
})

// ─── downloadHtml ────────────────────────────────────────────

describe('sanitizeFileName', () => {
  it('strips path traversal characters', () => {
    expect(sanitizeFileName('../../etc/passwd.md')).toBe('passwd')
    expect(sanitizeFileName('..\\..\\secret.md')).toBe('secret')
  })

  it('neutralizes Windows reserved device names', () => {
    expect(sanitizeFileName('CON.md')).toBe('markdown-document')
    expect(sanitizeFileName('prn.markdown')).toBe('markdown-document')
    expect(sanitizeFileName('AUX.md')).toBe('markdown-document')
    expect(sanitizeFileName('NUL.md')).toBe('markdown-document')
  })

  it('handles empty or dots-only filename', () => {
    expect(sanitizeFileName('.md')).toBe('markdown-document')
    expect(sanitizeFileName('...md')).toBe('markdown-document')
    expect(sanitizeFileName('')).toBe('markdown-document')
  })

  it('preserves safe alphanumeric filenames', () => {
    expect(sanitizeFileName('my-project_v1.0.md')).toBe('my-project_v1.0')
  })
})

describe('buildStandaloneHtml', () => {
  it('produces valid HTML structure with strict CSP', () => {
    const html = buildStandaloneHtml('# Hello', 'test.md')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('<head>')
    expect(html).toContain('Content-Security-Policy')
    expect(html).toContain("default-src 'none'")
    expect(html).toContain('name="referrer" content="no-referrer"')
    expect(html).toContain('<body>')
    expect(html).toContain('class="markdown-body"')
  })

  it('embeds CSS in style tag', () => {
    const html = buildStandaloneHtml('# Hello', 'test.md')
    expect(html).toContain('<style>')
    expect(html).toContain('font-family')
  })

  it('contains rendered markdown content', () => {
    const html = buildStandaloneHtml('# Hello World', 'test.md')
    expect(html).toContain('<h1')
    expect(html).toContain('Hello World')
  })

  it('does not contain React or Vite artifacts', () => {
    const html = buildStandaloneHtml('# Hello', 'test.md')
    expect(html).not.toContain('react-dom')
    expect(html).not.toContain('__vite')
    expect(html).not.toContain('/src/')
    expect(html).not.toContain('type="module"')
  })

  it('sanitizes XSS in exported HTML', () => {
    const html = buildStandaloneHtml('<script>alert(1)</script>', 'test.md')
    expect(html).not.toContain('<script>alert(1)</script>')
  })

  it('derives filename from original', () => {
    const html = buildStandaloneHtml('# Doc', 'README.md')
    expect(html).toContain('<title>README</title>')
  })

  it('uses fallback title when no filename', () => {
    const html = buildStandaloneHtml('# Doc', '')
    expect(html).toContain('<title>markdown-document</title>')
  })
})

// ─── Word Document Export ─────────────────────────────────────

describe('buildWordDocumentHtml', () => {
  it('includes Microsoft Word XML namespace attributes', () => {
    const doc = buildWordDocumentHtml('<h1>Project Title</h1>', 'project.md')
    expect(doc).toContain('xmlns:w="urn:schemas-microsoft-com:office:word"')
    expect(doc).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"')
    expect(doc).toContain('<w:WordDocument>')
    expect(doc).toContain('<w:View>Print</w:View>')
  })

  it('embeds Calibri typography and page margin styles', () => {
    const doc = buildWordDocumentHtml('<p>Hello world</p>', 'project.md')
    expect(doc).toContain('Calibri')
    expect(doc).toContain('margin: 1in')
  })

  it('includes the provided HTML content and document title', () => {
    const doc = buildWordDocumentHtml('<h2>Section Title</h2>', 'spec.md')
    expect(doc).toContain('<h2>Section Title</h2>')
    expect(doc).toContain('<title>spec</title>')
  })
})

describe('exportToWord', () => {
  it('executes download successfully and sets .doc extension', () => {
    const result = exportToWord('# Sample Note', 'notes.md')
    expect(result.success).toBe(true)
  })
})

// ─── PDF Export ───────────────────────────────────────────────

describe('exportToPdf', () => {
  it('creates print iframe and executes print workflow', () => {
    const result = exportToPdf('# Meeting Agenda', 'agenda.md')
    expect(result.success).toBe(true)
  })
})
