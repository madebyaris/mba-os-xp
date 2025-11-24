import { memo, type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import clsx from 'clsx'
import { Minus, Square, X } from 'lucide-react'

import type { WindowInstance, WindowPosition, WindowSize } from '@/types/window'
import styles from './Window.module.css'

interface WindowProps {
  window: WindowInstance
  children: ReactNode
  onFocus: (id: string) => void
  onClose: (id: string) => void
  onMinimize: (id: string) => void
  onMaximizeToggle: (id: string) => void
  onPositionChange: (id: string, position: WindowPosition) => void
  onSizeChange: (id: string, size: WindowSize, position?: WindowPosition) => void
}

const WindowComponent = ({
  window,
  children,
  onFocus,
  onClose,
  onMinimize,
  onMaximizeToggle,
  onPositionChange,
  onSizeChange,
}: WindowProps) => {
  const { id, title, size, position, zIndex, isFocused, isMinimized, isMaximized, isResizable } =
    window
  const [isDragging, setIsDragging] = useState(false)
  const rndRef = useRef<Rnd>(null)
  // Minimum spacing from menu bar (in pixels)
  const MIN_TOP_OFFSET = 8

  const rndProps = useMemo(
    () => ({
      size: {
        width: size.width,
        height: size.height,
      },
      position: {
        x: position.x,
        y: position.y,
      },
    }),
    [size.height, size.width, position.x, position.y],
  )


  const handleFocus = useCallback(() => {
    if (!isFocused) {
      onFocus(id)
    }
  }, [id, isFocused, onFocus])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    handleFocus()
  }, [handleFocus])

  const handleDrag = useCallback(
    (_: unknown, data: { x: number; y: number }) => {
      // Constrain window during drag to maintain spacing from menu bar
      // Since windowsLayer has padding-top, y:0 is already below menu bar
      // Add MIN_TOP_OFFSET to ensure title bar doesn't touch menu bar
      if (data.y < MIN_TOP_OFFSET && rndRef.current) {
        const element = rndRef.current.getSelfElement()
        if (element) {
          // Immediately force position to maintain minimum spacing
          requestAnimationFrame(() => {
            if (element) {
              element.style.transform = `translate(${data.x}px, ${MIN_TOP_OFFSET}px)`
            }
          })
        }
      }
    },
    [],
  )

  const handleDragStop = useCallback(
    (_: unknown, data: { x: number; y: number }) => {
      setIsDragging(false)
      // Ensure window maintains minimum spacing from menu bar
      const constrainedY = Math.max(MIN_TOP_OFFSET, data.y)
      onPositionChange(id, {
        x: data.x,
        y: constrainedY,
      })
    },
    [id, onPositionChange],
  )

  const handleResizeStop = useCallback(
    (_: unknown, __: unknown, ref: HTMLElement, ___: unknown, newPosition?: WindowPosition) => {
      onSizeChange(
        id,
        {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        },
        newPosition,
      )
    },
    [id, onSizeChange],
  )

  return (
    <Rnd
      ref={rndRef}
      disableDragging={isMaximized || isMinimized}
      enableResizing={isResizable && !isMaximized && !isMinimized}
      bounds="parent"
      minWidth={window.minSize.width}
      minHeight={window.minSize.height}
      size={rndProps.size}
      position={rndProps.position}
      dragHandleClassName={styles.titleBar}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResizeStart={handleFocus}
      onResizeStop={handleResizeStop}
      className={clsx(styles.window, {
        [styles.focused]: isFocused,
        [styles.minimized]: isMinimized,
        [styles.maximized]: isMaximized,
        [styles.dragging]: isDragging,
      })}
      style={{ zIndex }}
      tabIndex={0}
      onMouseDown={handleFocus}
      onTouchStart={handleFocus}
    >
      <div
        className={styles.titleBar}
        onDoubleClick={() => onMaximizeToggle(id)}
        aria-label={`${title} window title bar`}
      >
        <div className={styles.titleContent}>
          <span className={styles.titleText}>{title}</span>
        </div>
        <div className={styles.windowActions}>
          <button
            type="button"
            className={clsx(styles.actionButton, styles.minimize)}
            onClick={() => onMinimize(id)}
            aria-label="Minimize window"
          >
            <Minus size={12} strokeWidth={3} />
          </button>
          <button
            type="button"
            className={clsx(styles.actionButton, styles.maximize)}
            onClick={() => onMaximizeToggle(id)}
            aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          >
            <Square size={12} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            className={clsx(styles.actionButton, styles.close)}
            onClick={() => onClose(id)}
            aria-label="Close window"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <div className={styles.contentArea} role="document">
        {children}
      </div>
    </Rnd>
  )
}

export default memo(WindowComponent)

