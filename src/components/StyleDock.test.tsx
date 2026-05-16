import { fireEvent, render, screen } from '@testing-library/react'

import { VISUALIZER_MODES } from '../config/visualizerModes'
import { StyleDock } from './StyleDock'

describe('StyleDock', () => {
  it('renders all style presets and emits selection', () => {
    const onSelectMode = vi.fn()
    render(
      <StyleDock
        modes={VISUALIZER_MODES}
        activeMode="bars"
        collapsed={false}
        onToggleCollapsed={vi.fn()}
        onSelectMode={onSelectMode}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /环形波形/i }))
    expect(onSelectMode).toHaveBeenCalledWith('ring')
  })

  it('toggles via handle button', () => {
    const onToggleCollapsed = vi.fn()
    render(
      <StyleDock
        modes={VISUALIZER_MODES}
        activeMode="bars"
        collapsed={true}
        onToggleCollapsed={onToggleCollapsed}
        onSelectMode={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /展开样式栏/i }))
    expect(onToggleCollapsed).toHaveBeenCalledTimes(1)
  })
})
