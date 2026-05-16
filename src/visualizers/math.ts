export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor
}

export function polarToCartesian(radius: number, angle: number) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

export function sampleAt<T extends ArrayLike<number>>(data: T, ratio: number) {
  if (data.length === 0) {
    return 0
  }
  const index = Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1))))
  return data[index] / 255
}
