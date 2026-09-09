import { useMemo, useRef, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { renderMarkdown } from '../utils/markdownRenderer.js'

let mermaidInstance = null

async function getMermaid(theme = 'dark') {
  if (mermaidInstance) return mermaidInstance
  try {
    const mod = await import('mermaid')
    mermaidInstance = mod.default
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'antiscript',
      suppressErrorRendering: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    })
    return mermaidInstance
  } catch {
    return null
  }
}

/**
 * Renders sanitized Markdown HTML, injects Copy buttons into code blocks,
 * and renders Mermaid diagrams.
 */
export default function MarkdownPreview({ markdown, theme }) {
  const containerRef = useRef(null)
  const cleanupRef = useRef([])

  const html = useMemo(() => {
    if (!markdown || !markdown.trim()) return ''
    try {
      return renderMarkdown(markdown)
    } catch (err) {
      console.error('Render error:', err)
      return '<p style="color:#ff7b72">Rendering error. Check console for details.</p>'
    }
  }, [markdown])

  // After HTML is injected, inject Copy buttons + render Mermaid diagrams
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clean up previous injected buttons
    cleanupRef.current.forEach(fn => fn())
    cleanupRef.current = []

    // ── Copy buttons for code blocks ──────────────────────────
    const wrappers = container.querySelectorAll('.code-block-wrapper')
    wrappers.forEach(wrapper => {
      const pre = wrapper.querySelector('pre')
      const code = wrapper.querySelector('code')
      if (!pre || !code) return

      // Skip mermaid blocks – they'll be replaced with SVG
      if (pre.getAttribute('data-lang') === 'mermaid') return

      const lang = pre.getAttribute('data-lang') || ''

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.setAttribute('aria-label', `Copy ${lang || 'code'} to clipboard`)
      btn.className = [
        'copy-btn absolute top-2 right-2',
        'flex items-center gap-1',
        'text-xs font-medium px-2 py-1 rounded-md',
        'bg-surface-700 text-gray-400 border border-surface-600',
        'hover:bg-surface-600 hover:text-gray-100',
        'transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      ].join(' ')

      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
        <span>Copy</span>
      `
      const labelSpan = btn.querySelector('span')

      let timeoutId = null
      const onClick = async () => {
        const rawCode = code.innerText ?? code.textContent ?? ''
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(rawCode)
          } else {
            const ta = document.createElement('textarea')
            ta.value = rawCode
            ta.style.cssText = 'position:fixed;opacity:0'
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
          }
          btn.setAttribute('aria-label', 'Copied!')
          labelSpan.textContent = 'Copied!'
          btn.classList.add('text-green-400', 'border-green-400/40')
          btn.classList.remove('text-gray-400')
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            labelSpan.textContent = 'Copy'
            btn.setAttribute('aria-label', `Copy ${lang || 'code'} to clipboard`)
            btn.classList.remove('text-green-400', 'border-green-400/40')
            btn.classList.add('text-gray-400')
          }, 2000)
        } catch (err) {
          console.error('Clipboard error:', err)
          labelSpan.textContent = 'Failed'
          setTimeout(() => { labelSpan.textContent = 'Copy' }, 2000)
        }
      }

      btn.addEventListener('click', onClick)
      wrapper.style.position = 'relative'
      wrapper.appendChild(btn)

      cleanupRef.current.push(() => {
        clearTimeout(timeoutId)
        btn.removeEventListener('click', onClick)
        if (btn.parentNode === wrapper) wrapper.removeChild(btn)
      })
    })

    // Clean up any stray error elements Mermaid may have injected into document.body
    const cleanStrayErrors = () => {
      document.querySelectorAll('[id^="dmermaid-"], [id^="mermaid-"], .error-icon').forEach(el => {
        if (el.parentNode === document.body) {
          el.remove()
        }
      })
    }
    cleanStrayErrors()

    // ── Mermaid rendering (sequential to prevent parser race conditions) ──
    const mermaidWrappers = Array.from(
      container.querySelectorAll('.code-block-wrapper pre[data-lang="mermaid"]')
    )

    if (mermaidWrappers.length > 0) {
      let isCancelled = false
      cleanupRef.current.push(() => {
        isCancelled = true
        cleanStrayErrors()
      })

      getMermaid(theme).then(async (mermaid) => {
        if (!mermaid || isCancelled) return

        for (let idx = 0; idx < mermaidWrappers.length; idx++) {
          if (isCancelled) break
          const pre = mermaidWrappers[idx]
          const code = pre.querySelector('code')
          const graphDef = (pre.getAttribute('data-code') || code?.textContent || '').trim()
          const wrapper = pre.closest('.code-block-wrapper')
          if (!graphDef || !wrapper) continue

          const id = `mermaid-diag-${Date.now()}-${idx}`

          try {
            // Validate syntax first if parse function is available
            if (typeof mermaid.parse === 'function') {
              const parseResult = await mermaid.parse(graphDef)
              if (parseResult === false) {
                continue
              }
            }

            const { svg } = await mermaid.render(id, graphDef)
            cleanStrayErrors()

            // If mermaid returned an error SVG despite catch, do not replace code block
            if (!svg || svg.includes('class="error-icon"') || svg.includes('Syntax error in text')) {
              continue
            }

            const cleanSvg = DOMPurify.sanitize(svg, {
              USE_PROFILES: { svg: true, svgFilters: true },
              ADD_TAGS: ['use'],
            })

            if (isCancelled || !wrapper.parentNode) continue

            const div = document.createElement('div')
            div.className = 'mermaid-diagram my-4 overflow-x-auto rounded-lg p-4 bg-surface-800 border border-surface-600 shadow-sm'
            div.innerHTML = cleanSvg
            wrapper.replaceWith(div)
          } catch (err) {
            cleanStrayErrors()
            console.warn('Mermaid diagram render skipped:', err.message || err)
            // Leave the code block readable with syntax highlighting fallback
          }
        }
      })
    }

    return () => {
      cleanupRef.current.forEach(fn => fn())
      cleanupRef.current = []
      cleanStrayErrors()
    }
  }, [html, theme])

  // Re-initialize mermaid theme when theme changes
  useEffect(() => {
    if (!mermaidInstance) return
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'antiscript',
      suppressErrorRendering: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    })
  }, [theme])

  if (!html) {
    return (
      <section className="flex flex-col h-full min-h-0" aria-label="Markdown preview" aria-live="polite">
        <PreviewHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-gray-600 italic">Nothing to preview yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col h-full min-h-0" aria-label="Markdown preview" aria-live="polite">
      <PreviewHeader />
      <div
        ref={containerRef}
        id="preview-container"
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6"
      >
        <article
          className="markdown-preview max-w-none fade-in"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  )
}

function PreviewHeader() {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-surface-600 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex gap-1" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-surface-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-surface-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-surface-500" />
        </div>
        <span className="text-xs text-gray-500 font-mono">preview</span>
      </div>
      <span className="text-xs text-gray-600">rendered</span>
    </div>
  )
}
