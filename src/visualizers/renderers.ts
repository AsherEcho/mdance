import type {
  AudioFrame,
  CanvasMetrics,
  RenderContext,
  VisualizerModeId,
  VisualizerRenderer,
} from '../types/visualizer'
import { clamp, lerp, polarToCartesian, sampleAt } from './math'

interface Particle {
  angle: number
  distance: number
  speed: number
  size: number
  alpha: number
}

export function createRenderer(mode: VisualizerModeId): VisualizerRenderer {
  switch (mode) {
    case 'bars':
      return {
        render: renderBars,
      }
    case 'ring':
      return {
        render: renderRing,
      }
    case 'particles':
      return createParticleRenderer()
    case 'wall':
      return {
        render: renderWall,
      }
    case 'fluid':
      return {
        render: renderFluid,
      }
    default:
      return {
        render: renderBars,
      }
  }
}

function paintBackdrop(
  ctx: CanvasRenderingContext2D,
  metrics: CanvasMetrics,
  frame: AudioFrame,
  hueOffset: number,
) {
  const gradient = ctx.createRadialGradient(
    metrics.centerX,
    metrics.centerY,
    metrics.shortestSide * 0.12,
    metrics.centerX,
    metrics.centerY,
    metrics.longestSide * 0.78,
  )
  const hue = (220 + frame.bass * 80 + hueOffset) % 360
  gradient.addColorStop(0, `hsla(${hue}, 92%, 62%, 0.26)`)
  gradient.addColorStop(0.36, `hsla(${(hue + 55) % 360}, 96%, 46%, 0.14)`)
  gradient.addColorStop(1, 'rgba(3, 6, 20, 0.96)')

  ctx.clearRect(0, 0, metrics.width, metrics.height)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, metrics.width, metrics.height)

  ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + frame.treble * 0.04})`
  for (let i = 0; i < 30; i += 1) {
    const x = ((i * 53.2 + frame.timestamp * 0.01) % metrics.width + metrics.width) % metrics.width
    const y = (i * 87.3) % metrics.height
    const r = 0.8 + (i % 3) * 0.9
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function renderBars({ ctx, frame, metrics, now }: RenderContext) {
  paintBackdrop(ctx, metrics, frame, 0)

  const barCount = Math.min(88, Math.floor(metrics.width / 16))
  const barWidth = metrics.width / barCount
  const horizon = metrics.height * 0.82

  ctx.save()
  ctx.shadowBlur = 24
  ctx.shadowColor = 'rgba(78, 236, 255, 0.24)'

  for (let i = 0; i < barCount; i += 1) {
    const ratio = i / Math.max(1, barCount - 1)
    const energy = sampleAt(frame.frequency, ratio)
    const barHeight =
      metrics.height * (0.08 + energy * 0.48 + frame.bass * 0.12 * Math.sin(now * 0.002 + ratio * 6))
    const x = i * barWidth
    const y = horizon - barHeight
    const hue = 190 + ratio * 85 + frame.mid * 40
    const gradient = ctx.createLinearGradient(x, y, x, horizon)
    gradient.addColorStop(0, `hsla(${hue}, 100%, 72%, 0.95)`)
    gradient.addColorStop(1, `hsla(${hue + 50}, 100%, 50%, 0.22)`)
    ctx.fillStyle = gradient
    ctx.fillRect(x + 2, y, Math.max(4, barWidth - 5), barHeight)
  }

  ctx.restore()
  drawWaveRibbon(ctx, frame, metrics, horizon - metrics.height * 0.16, '#d8f6ff', 0.8, 1.4)
}

function renderRing({ ctx, frame, metrics, now }: RenderContext) {
  paintBackdrop(ctx, metrics, frame, 48)

  const baseRadius = metrics.shortestSide * 0.22
  const layers = [1, 0.74, 0.52]
  ctx.save()
  ctx.translate(metrics.centerX, metrics.centerY)

  layers.forEach((layer, index) => {
    ctx.beginPath()
    const alpha = 0.85 - index * 0.18
    const hue = 270 + index * 24 + frame.treble * 50
    const step = (Math.PI * 2) / frame.waveform.length

    for (let i = 0; i < frame.waveform.length; i += 1) {
      const normalized = frame.waveform[i] / 255 - 0.5
      const radius =
        baseRadius * layer +
        normalized * metrics.shortestSide * 0.18 +
        frame.peak * metrics.shortestSide * 0.04
      const angle = i * step + now * 0.00018 * (index + 1)
      const point = polarToCartesian(radius, angle)
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    }

    ctx.closePath()
    ctx.strokeStyle = `hsla(${hue}, 100%, 72%, ${alpha})`
    ctx.lineWidth = 2 + index * 2
    ctx.shadowBlur = 30
    ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.35)`
    ctx.stroke()
  })

  ctx.restore()
}

function createParticleRenderer(): VisualizerRenderer {
  let particles: Particle[] = []
  let initialized = false

  const seedParticles = (metrics: CanvasMetrics) => {
    particles = Array.from({ length: 120 }, (_, index) => ({
      angle: (index / 120) * Math.PI * 2,
      distance: metrics.shortestSide * (0.08 + (index % 24) * 0.016),
      speed: 0.15 + (index % 7) * 0.05,
      size: 1.8 + (index % 5) * 0.9,
      alpha: 0.2 + (index % 6) * 0.08,
    }))
    initialized = true
  }

  return {
    resize(metrics) {
      seedParticles(metrics)
    },
    dispose() {
      particles = []
      initialized = false
    },
    render({ ctx, frame, metrics, deltaMs, now }) {
      if (!initialized || particles.length === 0) {
        seedParticles(metrics)
      }

      paintBackdrop(ctx, metrics, frame, 105)

      ctx.save()
      ctx.translate(metrics.centerX, metrics.centerY)

      for (const particle of particles) {
        particle.angle += particle.speed * deltaMs * 0.00035 * (0.4 + frame.energy)
        particle.distance += (frame.bass * 40 - 12) * deltaMs * 0.01
        if (particle.distance > metrics.shortestSide * 0.48) {
          particle.distance = metrics.shortestSide * 0.08
        }
        if (particle.distance < metrics.shortestSide * 0.05) {
          particle.distance = metrics.shortestSide * 0.12
        }

        const orbit = polarToCartesian(
          particle.distance + Math.sin(now * 0.002 + particle.angle * 3) * frame.mid * 12,
          particle.angle,
        )
        const alpha = clamp(particle.alpha + frame.peak * 0.55, 0.2, 0.95)
        const radius = particle.size + frame.treble * 3.2

        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 214, 248, ${alpha})`
        ctx.shadowBlur = 18
        ctx.shadowColor = 'rgba(255, 130, 220, 0.35)'
        ctx.arc(orbit.x, orbit.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
      drawWaveRibbon(ctx, frame, metrics, metrics.height * 0.72, '#ffe8fa', 0.45, 1)
    },
  }
}

function renderWall({ ctx, frame, metrics, now }: RenderContext) {
  paintBackdrop(ctx, metrics, frame, 180)

  const depthLayers = 22
  const columns = Math.min(48, Math.floor(metrics.width / 28))
  const horizon = metrics.height * 0.32
  const floor = metrics.height * 0.88

  for (let z = depthLayers; z >= 1; z -= 1) {
    const depth = z / depthLayers
    const perspective = lerp(0.24, 1, depth)
    const layerWidth = metrics.width * perspective
    const startX = (metrics.width - layerWidth) * 0.5
    const yBase = lerp(horizon, floor, depth)
    const barWidth = layerWidth / columns
    const alpha = lerp(0.1, 0.55, depth)

    for (let i = 0; i < columns; i += 1) {
      const ratio = i / Math.max(columns - 1, 1)
      const freq = sampleAt(frame.frequency, ratio)
      const pulse = Math.sin(now * 0.0014 + z * 0.5 + i * 0.26) * 0.04
      const height = metrics.height * (0.06 + freq * 0.34 + pulse + frame.bass * 0.1) * perspective
      const x = startX + i * barWidth
      ctx.fillStyle = `hsla(${190 + ratio * 120}, 98%, 60%, ${alpha})`
      ctx.fillRect(x, yBase - height, Math.max(2, barWidth - 2), height)
    }
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(metrics.width * 0.18, floor)
  ctx.lineTo(metrics.centerX, horizon)
  ctx.lineTo(metrics.width * 0.82, floor)
  ctx.stroke()
}

function renderFluid({ ctx, frame, metrics, now }: RenderContext) {
  paintBackdrop(ctx, metrics, frame, 240)

  const lines = [
    { offset: metrics.height * 0.42, color: 'rgba(127, 255, 212, 0.28)', width: 3.4, speed: 0.9 },
    { offset: metrics.height * 0.52, color: 'rgba(60, 255, 210, 0.36)', width: 2.8, speed: 1.35 },
    { offset: metrics.height * 0.62, color: 'rgba(162, 255, 230, 0.48)', width: 2.2, speed: 1.8 },
  ]

  for (const line of lines) {
    ctx.beginPath()
    ctx.lineWidth = line.width
    ctx.strokeStyle = line.color
    ctx.shadowBlur = 22
    ctx.shadowColor = line.color

    for (let x = 0; x <= metrics.width; x += 8) {
      const ratio = x / metrics.width
      const wave = sampleAt(frame.waveform, ratio) - 0.5
      const y =
        line.offset +
        Math.sin(ratio * Math.PI * 5 + now * 0.0013 * line.speed) * metrics.height * 0.05 +
        wave * metrics.height * (0.2 + frame.energy * 0.08)

      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }

  drawWaveRibbon(ctx, frame, metrics, metrics.height * 0.8, '#b8ffe6', 0.68, 2)
}

function drawWaveRibbon(
  ctx: CanvasRenderingContext2D,
  frame: AudioFrame,
  metrics: CanvasMetrics,
  baseline: number,
  color: string,
  alpha: number,
  lineWidth: number,
) {
  ctx.beginPath()
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha

  for (let i = 0; i < frame.waveform.length; i += 1) {
    const ratio = i / Math.max(1, frame.waveform.length - 1)
    const x = ratio * metrics.width
    const y = baseline + (frame.waveform[i] / 255 - 0.5) * metrics.height * 0.24
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()
  ctx.globalAlpha = 1
}
