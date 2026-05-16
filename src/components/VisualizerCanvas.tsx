import { useEffect, useMemo, useRef } from 'react'

import type { AudioFrame, CanvasMetrics, VisualizerModeId, VisualizerRenderer } from '../types/visualizer'
import { createRenderer } from '../visualizers/renderers'

interface VisualizerCanvasProps {
  modeId: VisualizerModeId
  getFrame: () => AudioFrame
}

export function VisualizerCanvas({ modeId, getFrame }: VisualizerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<VisualizerRenderer | null>(null)
  const animationRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)

  const currentRenderer = useMemo(() => createRenderer(modeId), [modeId])

  useEffect(() => {
    rendererRef.current?.dispose?.()
    rendererRef.current = currentRenderer

    return () => {
      currentRenderer.dispose?.()
    }
  }, [currentRenderer])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
      return
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      rendererRef.current?.resize?.(buildMetrics(width, height, dpr))
    }

    const render = (now: number) => {
      const deltaMs = lastFrameRef.current === 0 ? 16.67 : now - lastFrameRef.current
      lastFrameRef.current = now

      const width = window.innerWidth
      const height = window.innerHeight
      const metrics = buildMetrics(width, height, Math.min(window.devicePixelRatio || 1, 2))
      const frame = getFrame()

      rendererRef.current?.render({
        ctx,
        frame,
        metrics,
        now,
        deltaMs,
      })

      animationRef.current = window.requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    animationRef.current = window.requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(animationRef.current)
      lastFrameRef.current = 0
    }
  }, [getFrame])

  return <canvas ref={canvasRef} className="visualizer-canvas" aria-hidden="true" />
}

function buildMetrics(width: number, height: number, dpr: number): CanvasMetrics {
  return {
    width,
    height,
    dpr,
    aspectRatio: width / Math.max(height, 1),
    centerX: width / 2,
    centerY: height / 2,
    shortestSide: Math.min(width, height),
    longestSide: Math.max(width, height),
  }
}
