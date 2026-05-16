import type { MicrophoneStatus } from '../types/visualizer'

interface PermissionOverlayProps {
  status: MicrophoneStatus
  errorMessage: string | null
  sourceLabel: string
  onEnableMicrophone: () => void
  onUseDemo: () => void
}

export function PermissionOverlay({
  status,
  errorMessage,
  sourceLabel,
  onEnableMicrophone,
  onUseDemo,
}: PermissionOverlayProps) {
  const isBusy = status === 'requesting'

  return (
    <section className="permission-overlay">
      <div className="permission-card">
        <p className="permission-card__eyebrow">MDance Visualizer</p>
        <h1>让环境声和人声直接驱动画面</h1>
        <p className="permission-card__body">
          允许麦克风权限后，系统会通过 Web Audio API 实时采集频谱和波形；如果当前设备不便授权，也可以先进入演示模式预览全部视觉风格。
        </p>

        <div className="permission-card__actions">
          <button type="button" onClick={onEnableMicrophone} disabled={isBusy}>
            {isBusy ? '正在请求权限...' : '开启麦克风'}
          </button>
          <button type="button" className="ghost" onClick={onUseDemo}>
            使用演示模式
          </button>
        </div>

        <p className="permission-card__hint">当前输入源：{sourceLabel}</p>
        {errorMessage ? <p className="permission-card__error">{errorMessage}</p> : null}
      </div>
    </section>
  )
}
