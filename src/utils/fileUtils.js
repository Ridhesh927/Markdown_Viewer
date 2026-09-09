const SUPPORTED_EXTENSIONS = ['.md', '.markdown']
const SUPPORTED_MIME = ['text/markdown', 'text/x-markdown', 'text/plain', '']

/** Maximum allowed file size in bytes (10 MB) to prevent browser memory exhaustion / DoS */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Validate a File object is a Markdown file.
 * Checks extension, MIME type, and size limits.
 *
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateMarkdownFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' }
  }

  if (file.size && file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`,
    }
  }

  const name = file.name || ''
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase()

  const validExt = SUPPORTED_EXTENSIONS.includes(ext)

  if (!validExt) {
    return {
      valid: false,
      error: `Please select a Markdown file (.md or .markdown). "${name}" is not supported.`,
    }
  }

  return { valid: true }
}

/**
 * Read a File using FileReader, returning a Promise<string>.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result ?? '')
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}".`))
    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * Extract the first valid Markdown file from a DataTransfer or FileList.
 *
 * @param {FileList | File[]} files
 * @returns {{ file: File | null, error?: string }}
 */
export function pickMarkdownFile(files) {
  if (!files || files.length === 0) {
    return { file: null, error: 'No files received.' }
  }

  const fileArray = Array.from(files)

  for (const f of fileArray) {
    const { valid } = validateMarkdownFile(f)
    if (valid) return { file: f }
  }

  return {
    file: null,
    error:
      fileArray.length === 1
        ? `Please select a Markdown file (.md or .markdown). "${fileArray[0].name}" is not supported.`
        : 'None of the dropped files are Markdown files (.md or .markdown).',
  }
}
