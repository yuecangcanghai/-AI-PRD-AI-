# 🚀 ProductForge

**对话驱动、画布联动的 AI 产品顾问，从想法到 PRD 一站完成。**

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://yuecangcanghai.github.io/-AI-PRD-AI-/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 📖 项目简介

ProductForge 是一个面向独立开发者、早期创业者、产品新人的 **AI 产品顾问 Web 应用**。它通过**结构化对话**引导用户把一个模糊想法，一步步推导成一份完整、可交付给开发者的 **PRD（产品需求文档）**。

不同于通用聊天机器人，ProductForge 使用**有限状态机 + 轮次硬约束**，避免漫无目的的问答；不同于静态 AI 写作工具，它的 **对话 ↔ 画布双向联动**让需求随时可改、下游随时可重生。

### 一句话价值

> **让普通人也能从「我有个想法」，走到「这份 PRD 给程序员就能开发」。**

---

## ✨ 核心特性

| 特性 | 描述 |
|------|------|
| 🎯 **五阶段状态机** | 痛点发现 → 批判验证 → 用户群体 → 需求拆解 → PRD 生成，由 `StageController.canAdvance` 作为唯一推进闸门 |
| ⏱️ **轮次硬约束** | 每阶段最多 **3 轮交互**，第 3 轮强制收尾并推进，杜绝拖沓 |
| 🧭 **交互式引导卡片** | 首次访问自动弹出「🚀 产品设定」表单，6 字段（4 个 select = 67% 选择题）收集产品基础信息 |
| 📊 **进度清单** | 对话面板顶部实时显示当前阶段名、完成数/总进度%、✓/○ 清单项 |
| 🎨 **画布内联编辑** | PRD 画布的每个 SectionCard 支持按字段编辑，保存后**自动级联重生下游内容**（痛点→验证→用户→需求→PRD） |
| 🌐 **三语支持** | 中文 / English / 日本語，即时切换，全流程（含 PRD 输出）遵循所选语言 |
| ⚡ **双模式提问** | 标准模式（每轮一问一答）/ 高效模式（结构化表单卡片，单次收集 4-7 字段） |
| 🤖 **多模型自由** | OpenAI / Claude / DeepSeek / Qwen / 智谱 GLM，统一 `IModelAdapter` 接口 |
| 🔒 **数据本地** | Zustand + localStorage 持久化，对话历史与 PRD 留存本地，可一键下载 .md |

---

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | React 19 + TypeScript 5 |
| **构建** | Vite 8 |
| **样式** | Tailwind CSS v4（`@tailwindcss/vite` 插件方案） |
| **状态管理** | Zustand 5 + persist 中间件（localStorage，`productforge-*` 键前缀） |
| **多模型适配器** | 自定义 `IModelAdapter` 接口 + 5 个 Provider 适配器 |
| **标记解析** | 自定义 `<!-- EXTRACT:type -->` 和 `<!-- CARD -->` 标记方案 |
| **Markdown** | react-markdown + remark-gfm |

---

## 🚀 快速开始

### 前置要求

- Node.js ≥ 18
- npm ≥ 9
- 任一 LLM 提供商的 API Key（OpenAI / Claude / DeepSeek / Qwen / 智谱）

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/yuecangcanghai/-AI-PRD-AI-.git
cd -AI-PRD-AI-

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问终端打印的 URL（默认 `http://localhost:5173/`）。

### 首次使用

1. 点击右上角 **⚙️ 设置**，选择模型提供商并输入 API Key
2. 点击 **「验证 API Key」** 确认配置正常
3. 返回对话面板，填写自动弹出的 **「🚀 产品设定」** 表单
4. 提交后 AI 会生成定位初评 + 3 个痛点假设
5. 开始对话，沿五阶段推进，右栏画布会实时生成 PRD 内容

---

## 📁 项目结构

```
-AI-PRD-AI-/
├── src/
│   ├── components/
│   │   ├── Canvas/            # PRD 画布（右栏）
│   │   │   ├── ProductCanvas.tsx      # 画布容器 + 级联触发
│   │   │   ├── SectionCard.tsx        # 单个阶段卡片
│   │   │   └── SectionEditors.tsx     # 5 个按字段编辑器
│   │   ├── ChatPanel/         # 对话面板（左栏）
│   │   │   ├── ChatPanel.tsx          # 对话容器
│   │   │   ├── ChatInput.tsx          # 输入框 + 语言/模式切换
│   │   │   ├── ChatStageChecklist.tsx # 阶段进度清单
│   │   │   ├── MessageBubble.tsx      # 消息气泡（含卡片渲染）
│   │   │   ├── OnboardingCard.tsx     # 首次引导表单
│   │   │   └── StructuredCard.tsx     # AI 输出的结构化卡片
│   │   ├── Settings/          # 设置模态框
│   │   └── StageIndicator.tsx # 阶段指示条
│   ├── core/
│   │   ├── ai/
│   │   │   ├── ModelAdapter.ts        # IModelAdapter 接口
│   │   │   ├── index.ts               # 适配器工厂
│   │   │   └── adapters/              # 5 个提供商实现
│   │   ├── orchestrator/
│   │   │   ├── Orchestrator.ts        # 核心编排器（消息/卡片/级联重生）
│   │   │   ├── PromptBuilder.ts       # 提示词构建（含 3 轮收尾 prompt）
│   │   │   ├── Extractor.ts           # EXTRACT / CARD 标记解析
│   │   │   └── StageController.ts     # 阶段推进闸门
│   │   ├── store/
│   │   │   ├── useChatStore.ts        # 对话 + 引导卡片状态
│   │   │   ├── useConfigStore.ts      # 模型配置（语言/模式）
│   │   │   ├── usePRDStore.ts         # PRD 数据（含级联清空）
│   │   │   └── useStageStore.ts       # 阶段机 + 轮次计数
│   │   └── types/             # TypeScript 类型定义
│   ├── utils/export.ts        # PRD 下载 .md
│   └── main.tsx               # 入口
├── docs/                      # 设计文档与实施计划
├── vite.config.ts
└── package.json
```

---

## 🔄 数据流与标记方案

### 标记协议

| 标记 | 用途 | 示例 |
|------|------|------|
| `<!-- EXTRACT:type -->...<!-- /EXTRACT -->` | 提取结构化数据到 store | `<!-- EXTRACT:pain_point -->{...}<!-- /EXTRACT -->` |
| `<!-- CARD -->...<!-- /CARD -->` | 输出交互式表单卡片 | `<!-- CARD -->{"type":"dimension","fields":[...]}<!-- /CARD -->` |
| `<!-- STAGE_COMPLETE -->` | 标记当前阶段完成 | 由 `StageController` 判定后推进 |

### 级联重生依赖链

```
痛点发现 → 批判验证 → 用户群体 → 需求拆解 → PRD 生成
   ↓            ↓            ↓           ↓          ↓
  清空         清空         清空        清空       重生
```

修改任意 SectionCard → 确认后自动清空所有下游 → 逐个 `runSilent` 调用 LLM 重新推导 → 写回 store。

---

## 🌍 部署

### 本地构建

```bash
npm run build    # 产物输出到 dist/
npm run preview  # 本地预览构建产物
```

### 部署到 GitHub Pages

```bash
# 1. 修改 vite.config.ts 中的 base 为你的仓库名（已预设为 /-AI-PRD-AI-/）
# 2. 执行部署（自动 build + 推到 gh-pages 分支）
npm run deploy
```

部署后访问 `https://<username>.github.io/-AI-PRD-AI-/`。

### 部署到 Vercel

```bash
npm i -g vercel
vercel        # 按提示登录即可
```

---

## 🤝 参与贡献

欢迎通过 Issue 提出建议，或通过 PR 贡献代码。

### 开发流程

1. Fork 仓库并创建你的分支：`git checkout -b feature/my-feature`
2. 提交改动：`git commit -m "feat: add my feature"`
3. 推送：`git push origin feature/my-feature`
4. 提交 Pull Request

### 代码规范

- TypeScript 严格模式
- React 函数组件 + Hooks
- Tailwind utility-first 样式
- 组件名使用 PascalCase
- 所有 store 使用 Zustand persist 中间件

---

## 📄 License

[MIT](./LICENSE) - 自由使用、修改、商用。

---

## 📬 联系

如有问题或建议，欢迎 [提交 Issue](https://github.com/yuecangcanghai/-AI-PRD-AI-/issues)。

---

<p align="center">
  <b>ProductForge</b> · 让好想法不再停在脑子里
</p>
