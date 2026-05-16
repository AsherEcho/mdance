import { averageRange, averageUint8, smoothPeak } from './AudioAnalyzer'

describe('AudioAnalyzer helpers', () => {
  it('computes average energy from uint8 data', () => {
    const data = Uint8Array.from([0, 255, 255, 0])
    expect(averageUint8(data)).toBe(0.5)
  })

  it('computes segmented averages', () => {
    const data = Uint8Array.from([0, 0, 255, 255])
    expect(averageRange(data, 0, 0.5)).toBe(0)
    expect(averageRange(data, 0.5, 1)).toBe(1)
  })

  it('preserves responsive peak values', () => {
    expect(smoothPeak(0.8, 0.2)).toBeCloseTo(0.8, 5)
    expect(smoothPeak(0.2, 0.8)).toBeGreaterThan(0.2)
  })
})
