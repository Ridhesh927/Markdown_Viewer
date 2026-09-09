import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * Resizable split pane.
 * Renders two panels separated by a draggable divider.
 *
 * Props:
 *   left        – left panel content
 *   right       – right panel content
 *   direction   – 'horizontal' (side-by-side) | 'vertical' (stacked)
 *   defaultSplit – initial split ratio 0–100 (default 50)
 *   minSize     – minimum % for each panel (default 20)
 */
export default function ResizableSplit({
  left,
  right,
  direction = 'horizontal',
  defaultSplit = 50,
  minSize = 15,
}) {
  const [split, setSplit] = useState(defaultSplit)
  const containerRef = useRef(null)
  const isDragging = useRef(false)
  const startPos = useRef(0)
  const startSplit = useRef(defaultSplit)

  const isHorizontal = direction === 'horizontal'

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    isDragging.current = true
    startPos.current = isHorizontal ? e.clientX : e.clientY
    startSplit.current = split

    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }, [split, isHorizontal])

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    isDragging.current = true
    startPos.current = isHorizontal ? touch.clientX : touch.clientY
    startSplit.current = split
  }, [split, isHorizontal])

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const totalSize = isHorizontal ? rect.width : rect.height
      const delta = isHorizontal
        ? e.clientX - startPos.current
        : e.clientY - startPos.current

      const deltaPct = (delta / totalSize) * 100
      const newSplit = Math.min(
        100 - minSize,
        Math.max(minSize, startSplit.current + deltaPct)
      )
      setSplit(newSplit)
    }

    const onTouchMove = (e) => {
      if (!isDragging.current || !containerRef.current) return
      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()
      const totalSize = isHorizontal ? rect.width : rect.height
      const delta = isHorizontal
        ? touch.clientX - startPos.current
        : touch.clientY - startPos.current

      const deltaPct = (delta / totalSize) * 100
      const newSplit = Math.min(
        100 - minSize,
        Math.max(minSize, startSplit.current + deltaPct)
      )
      setSplit(newSplit)
    }

    const onEnd = () => {
      if (!isDragging.current) return
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [isHorizontal, minSize])

  // Double-click to reset to 50/50
  const onDoubleClick = useCallback(() => setSplit(50), [])

  const firstStyle = isHorizontal
    ? { width: `${split}%`, flexShrink: 0 }
    : { height: `${split}%`, flexShrink: 0 }

  const secondStyle = isHorizontal
    ? { width: `${100 - split}%`, flexShrink: 0 }
    : { height: `${100 - split}%`, flexShrink: 0 }

  return (
    <div
      ref={containerRef}
      className={`flex flex-1 min-h-0 overflow-hidden ${isHorizontal ? 'flex-row' : 'flex-col'}`}
    >
      {/* First panel */}
      <div style={firstStyle} className="min-w-0 min-h-0 overflow-hidden flex flex-col">
        {left}
      </div>

      {/* Divider */}
      <div
        role="separator"
        aria-label={`Drag to resize panels. Double-click to reset to 50/50.`}
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        tabIndex={0}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onDoubleClick={onDoubleClick}
        onKeyDown={(e) => {
          const step = 2
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            setSplit(s => Math.max(minSize, s - step))
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            setSplit(s => Math.min(100 - minSize, s + step))
          } else if (e.key === 'Home') {
            setSplit(minSize)
          } else if (e.key === 'End') {
            setSplit(100 - minSize)
          } else if (e.key === 'Enter' || e.key === ' ') {
            setSplit(50)
          }
        }}
        className={`
          relative flex-shrink-0 group
          flex items-center justify-center
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset
          ${isHorizontal
            ? 'w-1.5 cursor-col-resize hover:w-2 bg-surface-600 hover:bg-accent/60 active:bg-accent'
            : 'h-1.5 cursor-row-resize hover:h-2 bg-surface-600 hover:bg-accent/60 active:bg-accent'
          }
        `}
        title="Drag to resize · Double-click to reset"
      >
        {/* Handle dots */}
        <div className={`
          flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity
          ${isHorizontal ? 'flex-col' : 'flex-row'}
        `}>
          {[0,1,2].map(i => (
            <span key={i} className="w-1 h-1 rounded-full bg-gray-300/70" />
          ))}
        </div>
      </div>

      {/* Second panel */}
      <div style={secondStyle} className="min-w-0 min-h-0 overflow-hidden flex flex-col">
        {right}
      </div>
    </div>
  )
}
