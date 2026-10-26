import '@testing-library/jest-dom'

// Mock createObjectURL & revokeObjectURL in jsdom
if (typeof window !== 'undefined') {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => 'blob:mock-url'
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {}
  }
  if (!window.print) {
    window.print = () => {}
  }
  if (!window.focus) {
    window.focus = () => {}
  }

  // Prevent jsdom navigation warning on simulated link click
  if (typeof HTMLAnchorElement !== 'undefined') {
    HTMLAnchorElement.prototype.click = function () {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      this.dispatchEvent(event)
    }
  }
}
