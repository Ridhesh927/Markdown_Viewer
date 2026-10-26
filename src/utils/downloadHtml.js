/**
 * Backwards-compatible facade for export utilities.
 * All core export implementations are in exportUtils.js.
 */
export {
  EXPORT_CSS,
  PDF_PRINT_CSS,
  sanitizeFileName,
  escapeAttr,
  getExportHtml,
  buildStandaloneHtmlFromContent,
  buildStandaloneHtml,
  buildWordDocumentHtml,
  downloadHtml,
  exportToWord,
  exportToPdf,
} from './exportUtils.js'
