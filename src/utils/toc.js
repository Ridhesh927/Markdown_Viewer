import { CLOBBERING_IDS } from './markdownRenderer.js'

/**
 * Extract headings from Markdown text and build a TOC array.
 * IDs must match exactly what markdownRenderer.js generates.
 *
 * @param {string} markdown
 * @returns {Array<{id: string, text: string, level: number}>}
 */
export function buildToc(markdown) {
  if (!markdown || !markdown.trim()) return []

  const toc = []
  const idCount = Object.create(null)

  // Match ATX headings: # through ######
  const headingRegex = /^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/gm

  let match
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const rawText = match[2].trim()

    // Strip inline markdown syntax for display text
    const text = rawText
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/~~(.+?)~~/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .trim()

    // Generate ID: matches markdownRenderer's logic
    const rawBase = rawText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'section'

    const baseId = CLOBBERING_IDS.has(rawBase) ? `h-${rawBase}` : rawBase

    let id = baseId
    if (idCount[baseId] !== undefined) {
      idCount[baseId] += 1
      id = `${baseId}-${idCount[baseId]}`
    } else {
      idCount[baseId] = 0
    }

    toc.push({ id, text, level })
  }

  return toc
}
