# MDance - 高性能全屏音乐可视化系统 🎵

MDance 是一款基于 **React 18**、**TypeScript** 与 **Vite** 构建的高性能全屏音乐可视化交互站点。它通过 **Web Audio API** 实时捕捉音频频率与波形数据，并利用 **Canvas 2D** 实现 60 FPS 的沉浸式动画渲染。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ 核心特性

- 🌌 **沉浸式视觉体验**：全屏 Canvas 渲染，自动适配 16:9 至 21:9 宽屏及移动端横竖屏。
- 🎙️ **实时音频交互**：接入 Web Audio API，支持麦克风实时采样，并具备完善的权限处理机制。
- 🕹️ **5 种预设样式**：
  - **柱状频谱 (Bars)**：经典频域分布，带重力感应的峰值衰减。
  - **环形波形 (Ring)**：多层波纹环绕，展现声音的节奏张力。
  - **粒子脉冲 (Particles)**：基于低音能量触发的粒子爆发特效。
  - **3D 频谱墙 (Wall)**：利用透视算法模拟深度的虚拟舞台效果。
  - **流体波浪 (Fluid)**：平滑的丝绸感波纹，适合轻柔旋律。
- 📱 **极简交互控制**：底部可折叠“样式切换栏”，支持点击切换及手势滑动隐藏/显示。
- 🛡️ **优雅降级**：当麦克风不可用或被拒绝时，自动切换至高仿真演示（Demo）模式。

---

## 🚀 快速上手

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 构建生产版本
```bash
npm run build
```

### 4. 运行单元测试
```bash
npm run test:run
```

---

## 🛠️ 技术架构

项目采用模块化设计，将音频分析、渲染逻辑与 UI 状态彻底解耦：

- **音频分析层** ([AudioAnalyzer.ts](file:///e:/software/MDance/src/audio/AudioAnalyzer.ts))：封装 Web Audio 上下文，处理 FFT 数据提取与能量平滑算法。
- **渲染管线** ([VisualizerCanvas.tsx](file:///e:/software/MDance/src/components/VisualizerCanvas.tsx))：统一的渲染循环入口，处理 `requestAnimationFrame`、DPR 适配与 Resize 逻辑。
- **视觉算法库** ([renderers.ts](file:///e:/software/MDance/src/visualizers/renderers.ts))：纯数学驱动的绘制函数，易于扩展新的可视化模式。
- **配置中心** ([visualizerModes.ts](file:///e:/software/MDance/src/config/visualizerModes.ts))：声明式定义样式元数据，驱动 UI 自动生成。

---

## 📐 性能优化

- **分层渲染**：背景光晕与主体动画分层处理，减少重绘开销。
- **DPR 限制**：将 `devicePixelRatio` 限制在 `2` 以内，确保 4K 屏幕下依然保持 60 FPS。
- **内存管理**：严格的生命周期钩子处理，确保切换模式或关闭页面时音频上下文与计时器正确销毁。

---

## 📝 开源协议

基于 [MIT License](LICENSE) 开源。
