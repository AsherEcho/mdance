import { clamp, lerp, polarToCartesian, sampleAt } from './math'

describe('visualizer math helpers', () => {
  it('clamps values into range', () => {
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(-3, 0, 10)).toBe(0)
    expect(clamp(4, 0, 10)).toBe(4)
  })

  it('linearly interpolates', () => {
    expect(lerp(10, 20, 0.25)).toBe(12.5)
  })

  it('converts polar values to cartesian points', () => {
    const point = polarToCartesian(10, Math.PI / 2)
    expect(point.x).toBeCloseTo(0, 5)
    expect(point.y).toBeCloseTo(10, 5)
  })

  it('samples array-like values by normalized ratio', () => {
    const data = Uint8Array.from([0, 64, 255])
    expect(sampleAt(data, 0)).toBe(0)
    expect(sampleAt(data, 0.5)).toBeCloseTo(64 / 255, 5)
    expect(sampleAt(data, 1)).toBe(1)
  })
})
