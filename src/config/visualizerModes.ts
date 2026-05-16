import type { VisualizerModeId } from '../types/visualizer'

export interface VisualizerModePreset {
  id: VisualizerModeId
  label: string
  description: string
  accent: string
}

export const VISUALIZER_MODES: VisualizerModePreset[] = [
  {
    id: 'bars',
    label: '柱状频谱',
    description: '高对比柱形频谱，强调低频冲击与节奏切片。',
    accent: '#6ee7ff',
  },
  {
    id: 'ring',
    label: '环形波形',
    description: '围绕中心扩散的极坐标波形，呈现脉冲呼吸感。',
    accent: '#c084fc',
  },
  {
    id: 'particles',
    label: '粒子脉冲',
    description: '粒子跟随能量扩散与回收，形成空间脉冲场。',
    accent: '#f9a8d4',
  },
  {
    id: 'wall',
    label: '3D 频谱墙',
    description: '透视叠层频谱墙，模拟纵深推进的舞台效果。',
    accent: '#22d3ee',
  },
  {
    id: 'fluid',
    label: '流体波浪',
    description: '多层流体曲线叠加，适合持续氛围和人声波纹。',
    accent: '#34d399',
  },
]

export const DEFAULT_MODE_ID: VisualizerModeId = VISUALIZER_MODES[0].id
