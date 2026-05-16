import type { AudioFrame } from '../types/visualizer'

const DEFAULT_BINS = 256
const WAVEFORM_SIZE = 1024

interface DemoState {
  phase: number
  hueDrift: number
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private mediaStream: MediaStream | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private frequencyData = new Uint8Array(DEFAULT_BINS)
  private waveformData = new Uint8Array(WAVEFORM_SIZE)
  private previousPeak = 0
  private demoState: DemoState = { phase: 0, hueDrift: 0 }
  private source: AudioFrame['source'] = 'demo'

  get isSupported() {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  }

  async startMicrophone() {
    if (!this.isSupported) {
      throw new Error('当前浏览器不支持麦克风采集。')
    }

    await this.dispose()

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    this.audioContext = new window.AudioContext()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 512
    this.analyser.smoothingTimeConstant = 0.82
    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.sourceNode.connect(this.analyser)

    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
    this.waveformData = new Uint8Array(this.analyser.fftSize)
    this.previousPeak = 0
    this.source = 'microphone'
  }

  startDemo() {
    void this.dispose()
    this.source = 'demo'
    this.previousPeak = 0
    this.demoState = { phase: 0, hueDrift: 0 }
    this.frequencyData = new Uint8Array(DEFAULT_BINS)
    this.waveformData = new Uint8Array(WAVEFORM_SIZE)
  }

  captureFrame(now = performance.now()): AudioFrame {
    if (this.source === 'microphone' && this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData)
      this.analyser.getByteTimeDomainData(this.waveformData)

      const bass = averageRange(this.frequencyData, 0, 0.08)
      const mid = averageRange(this.frequencyData, 0.08, 0.32)
      const treble = averageRange(this.frequencyData, 0.32, 1)
      const energy = averageUint8(this.frequencyData)
      const peak = smoothPeak(energy, this.previousPeak)
      this.previousPeak = peak

      return {
        frequency: this.frequencyData.slice(),
        waveform: this.waveformData.slice(),
        bass,
        mid,
        treble,
        energy,
        peak,
        timestamp: now,
        source: this.source,
      }
    }

    return this.generateDemoFrame(now)
  }

  async dispose() {
    this.sourceNode?.disconnect()
    this.sourceNode = null
    this.analyser?.disconnect()
    this.analyser = null

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }

    if (this.audioContext) {
      await this.audioContext.close()
      this.audioContext = null
    }
  }

  private generateDemoFrame(now: number): AudioFrame {
    this.demoState.phase += 0.032
    this.demoState.hueDrift += 0.012

    for (let i = 0; i < this.frequencyData.length; i += 1) {
      const normalized = i / this.frequencyData.length
      const pulse = Math.sin(this.demoState.phase * 2 + normalized * 12)
      const sweep = Math.cos(this.demoState.phase * 1.5 - normalized * 18)
      const spark = Math.sin(this.demoState.hueDrift + normalized * 35)
      const value = 92 + pulse * 48 + sweep * 42 + spark * 24
      this.frequencyData[i] = clampByte(value)
    }

    for (let i = 0; i < this.waveformData.length; i += 1) {
      const normalized = i / this.waveformData.length
      const y =
        128 +
        Math.sin(normalized * Math.PI * 6 + this.demoState.phase * 2.8) * 40 +
        Math.sin(normalized * Math.PI * 18 - this.demoState.phase * 4.4) * 12
      this.waveformData[i] = clampByte(y)
    }

    const bass = averageRange(this.frequencyData, 0, 0.08)
    const mid = averageRange(this.frequencyData, 0.08, 0.32)
    const treble = averageRange(this.frequencyData, 0.32, 1)
    const energy = averageUint8(this.frequencyData)
    const peak = smoothPeak(energy, this.previousPeak)
    this.previousPeak = peak

    return {
      frequency: this.frequencyData.slice(),
      waveform: this.waveformData.slice(),
      bass,
      mid,
      treble,
      energy,
      peak,
      timestamp: now,
      source: this.source,
    }
  }
}

export function averageUint8(data: Uint8Array) {
  if (data.length === 0) {
    return 0
  }

  let total = 0
  for (let i = 0; i < data.length; i += 1) {
    total += data[i]
  }
  return total / data.length / 255
}

export function averageRange(data: Uint8Array, startRatio: number, endRatio: number) {
  if (data.length === 0) {
    return 0
  }

  const start = Math.max(0, Math.floor(data.length * startRatio))
  const end = Math.max(start + 1, Math.min(data.length, Math.ceil(data.length * endRatio)))

  let total = 0
  for (let i = start; i < end; i += 1) {
    total += data[i]
  }

  return total / (end - start) / 255
}

export function smoothPeak(currentEnergy: number, previousPeak: number) {
  const rise = currentEnergy * 0.72 + previousPeak * 0.28
  return Math.max(currentEnergy, rise * 0.96)
}

function clampByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}
