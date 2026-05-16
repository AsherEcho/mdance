import { DEFAULT_MODE_ID, VISUALIZER_MODES } from './visualizerModes'

describe('VISUALIZER_MODES', () => {
  it('exposes five presets with unique ids', () => {
    expect(VISUALIZER_MODES).toHaveLength(5)
    const ids = VISUALIZER_MODES.map((mode) => mode.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses the first preset as default', () => {
    expect(DEFAULT_MODE_ID).toBe(VISUALIZER_MODES[0].id)
  })
})
