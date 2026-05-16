import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AudioAnalyzer } from './audio/AudioAnalyzer'
import { PermissionOverlay } from './components/PermissionOverlay'
import { StyleDock } from './components/StyleDock'
import { VisualizerCanvas } from './components/VisualizerCanvas'
import { DEFAULT_MODE_ID, VISUALIZER_MODES } from './config/visualizerModes'
import type { MicrophoneStatus, VisualizerModeId } from './types/visualizer'
import './App.css'

function App() {
  const analyzerRef = useRef<AudioAnalyzer>(new AudioAnalyzer())
  const [modeId, setModeId] = useState<VisualizerModeId>(DEFAULT_MODE_ID)
  const [dockCollapsed, setDockCollapsed] = useState(false)
  const [status, setStatus] = useState<MicrophoneStatus>('idle')
  const [experienceStarted, setExperienceStarted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const analyzer = analyzerRef.current
    return () => {
      void analyzer.dispose()
    }
  }, [])

  const handleEnableMicrophone = useCallback(async () => {
    const analyzer = analyzerRef.current

    if (!analyzer.isSupported) {
      analyzer.startDemo()
      setStatus('unsupported')
      setErrorMessage('浏览器未提供可用的麦克风 API，已自动切换到演示模式。')
      setExperienceStarted(true)
      return
    }

    setStatus('requesting')
    setErrorMessage(null)

    try {
      await analyzer.startMicrophone()
      setStatus('active')
      setExperienceStarted(true)
    } catch (error) {
      analyzer.startDemo()
      setStatus('demo')
      setErrorMessage(resolveErrorMessage(error))
      setExperienceStarted(true)
    }
  }, [])

  const handleUseDemo = useCallback(() => {
    analyzerRef.current.startDemo()
    setStatus('demo')
    setExperienceStarted(true)
    setErrorMessage(null)
  }, [])

  const getFrame = useCallback(() => analyzerRef.current.captureFrame(), [])

  const handleSelectMode = useCallback(
    (nextModeId: VisualizerModeId) => {
      if (nextModeId === modeId) {
        setDockCollapsed((current) => !current)
        return
      }

      setModeId(nextModeId)
      setDockCollapsed(false)
    },
    [modeId],
  )

  const sourceLabel = useMemo(() => {
    switch (status) {
      case 'active':
        return '麦克风实时输入'
      case 'requesting':
        return '正在请求权限'
      case 'unsupported':
        return '演示模式（浏览器不支持）'
      case 'demo':
        return '演示模式'
      default:
        return '未连接'
    }
  }, [status])

  return (
    <main className="app-shell">
      <VisualizerCanvas modeId={modeId} getFrame={getFrame} />

      <StyleDock
        modes={VISUALIZER_MODES}
        activeMode={modeId}
        collapsed={dockCollapsed}
        onToggleCollapsed={() => setDockCollapsed((current) => !current)}
        onSelectMode={handleSelectMode}
      />

      {!experienceStarted ? (
        <PermissionOverlay
          status={status}
          errorMessage={errorMessage}
          sourceLabel={sourceLabel}
          onEnableMicrophone={handleEnableMicrophone}
          onUseDemo={handleUseDemo}
        />
      ) : null}
    </main>
  )
}

function resolveErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return '你拒绝了麦克风权限，系统已切换到演示模式；重新授权后可获得真实频谱。'
    }

    if (error.name === 'NotFoundError') {
      return '未检测到可用麦克风设备，系统已切换到演示模式。'
    }
  }

  return '麦克风连接失败，系统已切换到演示模式。'
}

export default App
