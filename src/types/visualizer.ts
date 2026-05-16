export type VisualizerModeId =
  | 'bars'
  | 'ring'
  | 'particles'
  | 'wall'
  | 'fluid'

export interface AudioFrame {
  frequency: Uint8Array
  waveform: Uint8Array
  bass: number
  mid: number
  treble: number
  energy: number
  peak: number
  timestamp: number
  source: 'microphone' | 'demo'
}

export interface CanvasMetrics {
  width: number
  height: number
  dpr: number
  aspectRatio: number
  centerX: number
  centerY: number
  shortestSide: number
  longestSide: number
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D
  frame: AudioFrame
  metrics: CanvasMetrics
  now: number
  deltaMs: number
}

export interface VisualizerRenderer {
  render(args: RenderContext): void
  resize?(metrics: CanvasMetrics): void
  dispose?(): void
}

export type MicrophoneStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'error'
  | 'unsupported'
  | 'demo'
