import { useRef } from 'react'

import type { VisualizerModePreset } from '../config/visualizerModes'
import type { VisualizerModeId } from '../types/visualizer'

interface StyleDockProps {
  modes: VisualizerModePreset[]
  activeMode: VisualizerModeId
  collapsed: boolean
  onToggleCollapsed: () => void
  onSelectMode: (modeId: VisualizerModeId) => void
}

export function StyleDock({
  modes,
  activeMode,
  collapsed,
  onToggleCollapsed,
  onSelectMode,
}: StyleDockProps) {
  const dragStartY = useRef<number | null>(null)

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartY.current = event.clientY
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) {
      return
    }

    const deltaY = event.clientY - dragStartY.current
    dragStartY.current = null

    if (Math.abs(deltaY) < 28) {
      return
    }

    if (deltaY > 0 && !collapsed) {
      onToggleCollapsed()
    }

    if (deltaY < 0 && collapsed) {
      onToggleCollapsed()
    }
  }

  return (
    <aside
      className={`style-dock ${collapsed ? 'is-collapsed' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <button
        type="button"
        className="style-dock__handle"
        onClick={onToggleCollapsed}
        aria-expanded={!collapsed}
        aria-controls="style-options"
      >
        <span className="style-dock__grabber" />
        <span>{collapsed ? '展开样式栏' : '收起样式栏'}</span>
      </button>

      <div className="style-dock__content" id="style-options" aria-hidden={collapsed}>
        {modes.map((mode) => {
          const active = mode.id === activeMode
          return (
            <button
              key={mode.id}
              type="button"
              className={`style-chip ${active ? 'is-active' : ''}`}
              style={{ '--chip-accent': mode.accent } as React.CSSProperties}
              onClick={() => onSelectMode(mode.id)}
            >
              <strong>{mode.label}</strong>
              <span>{mode.description}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
