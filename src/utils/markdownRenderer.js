import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Configure DOMPurify hook to ensure all external or target="_blank" links have noopener noreferrer
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    const target = node.getAttribute('target')
    if (target === '_blank') {
      const rel = node.getAttribute('rel') || ''
      const parts = new Set(rel.split(/\s+/).filter(Boolean))
      parts.add('noopener')
      parts.add('noreferrer')
      node.setAttribute('rel', Array.from(parts).join(' '))
    }
  }
})

/**
 * Simple syntax highlighter – no external dependency.
 * Colours tokens using CSS classes compatible with our stylesheet.
 */
function highlight(code, lang) {
  if (!lang) return escapeHtml(code)

  const l = lang.toLowerCase()

  // Map common aliases
  const langMap = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    sh: 'bash',
    shell: 'bash',
    yml: 'yaml',
  }
  const canonical = langMap[l] || l

  try {
    return highlightCode(code, canonical)
  } catch {
    return escapeHtml(code)
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Regex-based tokenizer – produces token spans.
 * Uses index-based sticky matching to ensure linear O(N) performance and avoid ReDoS/slicing churn.
 */
function highlightCode(code, lang) {
  const patterns = getPatterns(lang)
  if (!patterns) return escapeHtml(code)

  let result = ''
  let cursor = 0
  const len = code.length
  let safetyCounter = 0
  const maxTokens = 100000

  while (cursor < len) {
    safetyCounter++
    if (safetyCounter > maxTokens) {
      // Safely append remaining code escaped rather than truncating
      result += escapeHtml(code.slice(cursor))
      break
    }

    let matched = false
    for (const { regex, className } of patterns) {
      regex.lastIndex = cursor
      const m = regex.exec(code)
      if (m && m.index === cursor) {
        const text = m[0]
        if (text.length > 0) {
          result += `<span class="token ${className}">${escapeHtml(text)}</span>`
          cursor += text.length
          matched = true
          break
        }
      }
    }

    if (!matched) {
      result += escapeHtml(code[cursor])
      cursor++
    }
  }

  return result
}

function getPatterns(lang) {
  // Sticky regexes ('y' flag) match strictly at regex.lastIndex
  const jsPatterns = [
    { regex: /\/\/[^\n]*/y, className: 'comment' },
    { regex: /\/\*[\s\S]*?\*\//y, className: 'comment' },
    { regex: /(["'`])(?:(?!\1)[^\\\r\n]|\\.)*?\1/y, className: 'string' },
    { regex: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|import|export|default|class|extends|async|await|try|catch|finally|throw|void|delete|in|of|yield|super|static|get|set|from|as)\b/y, className: 'keyword' },
    { regex: /\b(?:true|false|null|undefined|NaN|Infinity)\b/y, className: 'boolean' },
    { regex: /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?n?\b/y, className: 'number' },
    { regex: /\b([A-Z][a-zA-Z0-9_]*)\b/y, className: 'class-name' },
    { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/y, className: 'function' },
    { regex: /[{}[\]().,;:=!<>+\-*/%&|^~?]/y, className: 'punctuation' },
  ]

  const pyPatterns = [
    { regex: /#[^\n]*/y, className: 'comment' },
    { regex: /"""[\s\S]*?"""/y, className: 'string' },
    { regex: /'''[\s\S]*?'''/y, className: 'string' },
    { regex: /(["'])(?:(?!\1)[^\\\r\n]|\\.)*?\1/y, className: 'string' },
    { regex: /\b(?:def|class|return|if|elif|else|for|while|in|not|and|or|import|from|as|pass|break|continue|lambda|with|yield|try|except|finally|raise|del|global|nonlocal|assert|is|None|True|False|async|await)\b/y, className: 'keyword' },
    { regex: /\b\d+(?:\.\d+)?\b/y, className: 'number' },
    { regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/y, className: 'function' },
    { regex: /[{}[\]().,;:=!<>+\-*/%&|^~]/y, className: 'punctuation' },
  ]

  const htmlPatterns = [
    { regex: /<!--[\s\S]*?-->/y, className: 'comment' },
    { regex: /<\/?[a-zA-Z][a-zA-Z0-9-]*/y, className: 'tag' },
    { regex: /\/?>/y, className: 'punctuation' },
    { regex: /[a-zA-Z-]+=/, className: 'attr-name' },
    { regex: /(["'])(?:(?!\1)[^\\\r\n]|\\.)*?\1/y, className: 'string' },
  ]

  const cssPatterns = [
    { regex: /\/\*[\s\S]*?\*\//y, className: 'comment' },
    { regex: /(["'])(?:(?!\1)[^\\\r\n]|\\.)*?\1/y, className: 'string' },
    { regex: /@[a-zA-Z-]+/y, className: 'atrule' },
    { regex: /\.[a-zA-Z_-][a-zA-Z0-9_-]*/y, className: 'selector' },
    { regex: /#[a-fA-F0-9]{3,8}\b/y, className: 'string' },
    { regex: /\b(?:px|em|rem|%|vh|vw|vmin|vmax|fr|ms|s)\b/y, className: 'number' },
    { regex: /\b\d+(?:\.\d+)?\b/y, className: 'number' },
    { regex: /\b(?:color|background|margin|padding|font|border|display|position|top|left|right|bottom|width|height|flex|grid|transform|transition|animation|opacity|overflow|z-index|content|cursor)\b/y, className: 'property' },
    { regex: /[{}:;,]/y, className: 'punctuation' },
  ]

  const bashPatterns = [
    { regex: /#[^\n]*/y, className: 'comment' },
    { regex: /(["'])(?:(?!\1)[^\\\r\n]|\\.)*?\1/y, className: 'string' },
    { regex: /\$\{?[a-zA-Z_][a-zA-Z0-9_]*\}?/y, className: 'variable' },
    { regex: /\b(?:echo|if|then|else|fi|for|do|done|while|case|esac|function|return|exit|export|source|cd|ls|mkdir|rm|cp|mv|grep|sed|awk|cat|chmod|sudo|apt|npm|pip|git|docker)\b/y, className: 'keyword' },
    { regex: /\b\d+\b/y, className: 'number' },
    { regex: /[{}[\]().,;:=!<>|&]/y, className: 'punctuation' },
  ]

  const jsonPatterns = [
    { regex: /(["'])(?:(?!\1)[^\\\r\n]|\\.)*?\1/y, className: 'string' },
    { regex: /\b(?:true|false|null)\b/y, className: 'boolean' },
    { regex: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y, className: 'number' },
    { regex: /[{}[\],:]/y, className: 'punctuation' },
  ]

  const langMap = {
    javascript: jsPatterns,
    typescript: jsPatterns,
    python: pyPatterns,
    html: htmlPatterns,
    xml: htmlPatterns,
    css: cssPatterns,
    scss: cssPatterns,
    bash: bashPatterns,
    json: jsonPatterns,
    yaml: jsonPatterns,
  }

  return langMap[lang] || null
}

// ─── Configure marked ──────────────────────────────────────────
const renderer = new marked.Renderer()

// Track heading IDs for deduplication with null-prototype map
let headingIdMap = Object.create(null)

export const CLOBBERING_IDS = new Set([
  'constructor', 'prototype', '__proto__', 'attributes', 'children',
  'elements', 'item', 'nameditem', 'tostring', 'valueof',
])

renderer.heading = function ({ tokens, depth, raw }) {
  // raw includes the '#' chars; strip them to get just the text
  const rawText = raw.replace(/^#{1,6}\s+/, '').replace(/\s+#+\s*$/, '').trim()
  const rawBase = rawText
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'section'

  const baseId = CLOBBERING_IDS.has(rawBase) ? `h-${rawBase}` : rawBase

  let id = baseId
  if (headingIdMap[baseId] !== undefined) {
    headingIdMap[baseId] += 1
    id = `${baseId}-${headingIdMap[baseId]}`
  } else {
    headingIdMap[baseId] = 0
  }

  const tag = `h${depth}`
  // Parse inline tokens using the parser instance
  const innerHtml = this.parser ? this.parser.parseInline(tokens) : escapeHtml(rawText)
  return `<${tag} id="${escapeHtml(id)}">${innerHtml}</${tag}>\n`
}

renderer.code = function ({ text, lang }) {
  const language = lang ? lang.split(/\s+/)[0] : ''
  const highlighted = highlight(text, language)
  const langClass = language ? ` class="language-${escapeHtml(language)}"` : ''
  const langAttr = language ? ` data-lang="${escapeHtml(language)}"` : ''
  const codeAttr = language === 'mermaid' ? ` data-code="${escapeHtml(text)}"` : ''
  return `<div class="code-block-wrapper"><pre${langAttr}${codeAttr}><code${langClass}>${highlighted}</code></pre></div>\n`
}

/**
 * Validate URL protocols strictly.
 * Allows safe protocols (http, https, mailto, tel, relative, anchors).
 * Blocks dangerous schemes (javascript:, vbscript:, data:, blob:, file:, etc.)
 */
function isSafeUrl(url) {
  if (!url) return false
  const trimmed = url.trim()

  // Disallow control characters
  if (/[\x00-\x1f\x7f]/.test(trimmed)) return false

  // Strip backslashes, whitespace, and control chars to check for disguised dangerous protocols
  const normalized = trimmed.replace(/[\s\\\x00-\x1f\x7f]+/g, '').toLowerCase()
  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return false
  }

  // Block protocol-relative URLs (//) to avoid scheme confusion
  if (trimmed.startsWith('//')) {
    return false
  }

  // Allow anchor and relative paths
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return true
  }

  try {
    const parsed = new URL(trimmed, 'https://markdown-viewer.local')
    const protocol = parsed.protocol.toLowerCase()
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)
  } catch {
    return false
  }
}

// Open external links in new tab safely
renderer.link = function ({ href, title, text, tokens }) {
  const innerText = text || (tokens ? tokens.map(t => t.raw || '').join('') : '')
  if (!href || !isSafeUrl(href)) return innerText

  const isExternal = /^https?:\/\//i.test(href)
  const escapedHref = escapeHtml(href)
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
  const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
  return `<a href="${escapedHref}"${titleAttr}${externalAttrs}>${innerText}</a>`
}

marked.use({
  renderer,
  gfm: true,
  breaks: false,
})

/**
 * Reset heading ID deduplication map. Call before each render.
 */
export function resetHeadingIds() {
  headingIdMap = Object.create(null)
}

/**
 * Render Markdown → sanitized HTML.
 * @param {string} markdown
 * @returns {string} safe HTML
 */
export function renderMarkdown(markdown) {
  if (!markdown || !markdown.trim()) return ''

  resetHeadingIds()

  let rawHtml
  try {
    rawHtml = marked.parse(markdown)
  } catch (err) {
    console.error('marked.parse error:', err)
    return ''
  }

  const safe = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    SANITIZE_DOM: true,
    ADD_ATTR: ['id', 'class', 'data-lang', 'data-code', 'target', 'rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'style'],
  })

  return safe
}
