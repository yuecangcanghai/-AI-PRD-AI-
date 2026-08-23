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
| 🎯 **七阶段状态机** | 痛点发现 → 批判验证 → 现场调研 → 用户群体 → 需求拆解 → 方案照妖镜 → PRD 生成，由 `StageController.canAdvance` 作为唯一推进闸门 |
| ⏱️ **轮次硬约束** | 每阶段最多 **3 轮交互**，第 3 轮强制收尾并推进，杜绝拖沓 |
| 💡 **新手五问引导** | 首次访问先进入 `NewbieGuideFlow`——5 个大白话问题（1 个自由输入 + 4 个选择题）帮你把模糊想法理清，可随时「跳过 →」 |
| 🧭 **交互式引导卡片** | 五问结束后弹出「🚀 产品设定」表单，6 字段（4 个 select = 67% 选择题）补全产品基础信息 |
| 📊 **进度清单** | 对话面板顶部实时显示当前阶段名、完成数/总进度%、✓/○ 清单项 |
| 🎨 **画布内联编辑** | PRD 画布的每个 SectionCard 支持按字段编辑，保存后**自动级联重生下游内容**（痛点→验证→调研→用户→需求→照妖镜→PRD） |
| 🌐 **三语支持** | 中文 / English / 日本語，即时切换，全流程（含 PRD 输出）遵循所选语言 |
| ⚡ **双模式提问** | 标准模式（每轮一问一答）/ 高效模式（结构化表单卡片，单次收集 4-7 字段） |
| 🤖 **多模型自由** | OpenAI / Claude / DeepSeek / Qwen / 智谱 GLM，外加 **✏️ 自定义（OpenAI 兼容）** 可接入任意第三方或本地模型，统一 `IModelAdapter` 接口 |
| 🔒 **数据本地** | Zustand + localStorage 持久化，对话历史与 PRD 留存本地，可一键下载 .md |

---

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | React 19 + TypeScript 5 |
| **构建** | Vite 8 |
| **样式** | Tailwind CSS v4（`@tailwindcss/vite` 插件方案） |
| **状态管理** | Zustand 5 + persist 中间件（localStorage，`productforge-*` 键前缀） |
| **多模型适配器** | 自定义 `IModelAdapter` 接口 + 6 个 Provider 适配器（5 个内置 + 1 个 OpenAI 兼容通用适配器） |
| **标记解析** | 自定义 `<!-- EXTRACT:type -->` 和 `<!-- CARD -->` 标记方案 |
| **Markdown** | react-markdown + remark-gfm |

---

## 🚀 快速开始

### 前置要求

- Node.js ≥ 18
- npm ≥ 9
- 任一 LLM 提供商的 API Key（OpenAI / Claude / DeepSeek / Qwen / 智谱），或任意 **OpenAI 兼容** 接口的地址（含本地 Ollama / vLLM / LM Studio）

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

1. 点击右上角 **⚙️ 设置**，选择模型提供商并输入 API Key（自定义提供商见下方 [自定义模型接入](#-自定义模型接入openai-兼容)）
2. 点击 **「验证 API Key」** 确认配置正常
3. 返回对话面板，回答 **「💡 帮你理清思路」** 的 5 个问题（不想回答可点「跳过 →」）
4. 五问完成后填写 **「🚀 产品设定」** 表单，提交后 AI 会生成定位初评 + 3 个痛点假设
5. 开始对话，沿七阶段推进，右栏画布会实时生成 PRD 内容

---

## 📁 项目结构

```
-AI-PRD-AI-/
├── src/
│   ├── components/
│   │   ├── Canvas/            # PRD 画布（右栏）
│   │   │   ├── ProductCanvas.tsx      # 画布容器 + 七阶段级联触发
│   │   │   ├── SectionCard.tsx        # 单个阶段卡片
│   │   │   └── SectionEditors.tsx     # 7 个按字段编辑器
│   │   ├── ChatPanel/         # 对话面板（左栏）
│   │   │   ├── ChatPanel.tsx          # 对话容器（等待 persist 水合后再启动引导）
│   │   │   ├── ChatInput.tsx          # 输入框 + 语言/模式切换
│   │   │   ├── ChatStageChecklist.tsx # 阶段进度清单
│   │   │   ├── MessageBubble.tsx      # 消息气泡（含卡片渲染）
│   │   │   ├── NewbieGuideFlow.tsx    # 新手五问引导（选择题为主，可跳过）
│   │   │   ├── OnboardingCard.tsx     # 产品设定表单
│   │   │   └── StructuredCard.tsx     # AI 输出的结构化卡片
│   │   ├── Settings/          # 设置模态框
│   │   │   ├── SettingsModal.tsx      # 模态框容器
│   │   │   └── ModelConfig.tsx        # 提供商/模型/自定义 Base URL 配置
│   │   └── StageIndicator.tsx # 阶段指示条
│   ├── core/
│   │   ├── ai/
│   │   │   ├── ModelAdapter.ts        # IModelAdapter 接口
│   │   │   ├── index.ts               # 适配器工厂
│   │   │   └── adapters/
│   │   │       ├── openai.ts          # OpenAI
│   │   │       ├── claude.ts          # Anthropic Claude
│   │   │       ├── deepseek.ts        # DeepSeek
│   │   │       ├── qwen.ts            # 通义千问
│   │   │       ├── zhipu.ts           # 智谱 GLM
│   │   │       └── custom.ts          # 任意 OpenAI 兼容接口（自定义 Base URL）
│   │   ├── orchestrator/
│   │   │   ├── Orchestrator.ts        # 核心编排器（消息/卡片/级联重生/引导收尾）
│   │   │   ├── PromptBuilder.ts       # 提示词构建（含 3 轮收尾 prompt）
│   │   │   ├── Extractor.ts           # EXTRACT / CARD 标记解析
│   │   │   └── StageController.ts     # 阶段推进闸门
│   │   ├── store/
│   │   │   ├── useChatStore.ts        # 对话 + 引导卡片 + 新手引导状态
│   │   │   ├── useConfigStore.ts      # 模型配置（语言/模式/自定义端点）
│   │   │   ├── usePRDStore.ts         # PRD 数据（含级联清空）
│   │   │   ├── useStageStore.ts       # 阶段机 + 轮次计数
│   │   │   └── storeSubscribers.ts    # store 订阅副作用（引导完成单次触发）
│   │   └── types/             # TypeScript 类型定义
│   │       ├── chat.ts
│   │       ├── config.ts          # ModelProvider / MODEL_OPTIONS 模型清单
│   │       ├── prd.ts
│   │       └── stage.ts           # Stage 枚举 / STAGE_ORDER / STAGE_LABELS
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

### 七阶段流水线

阶段顺序由 `src/core/types/stage.ts` 的 `STAGE_ORDER` 定义：

| # | Stage 枚举值 | 中文名 | 职责 |
|---|---|---|---|
| 1 | `PainPointDiscovery` | 痛点发现 | 从想法中提炼 3 个痛点假设 |
| 2 | `CriticalValidation` | 批判验证 | 质疑假设，区分表层症状与深层根因 |
| 3 | `FieldResearch` | 现场调研 | 还原真实使用场景与现有替代方案 |
| 4 | `UserGroupAnalysis` | 用户群体 | 构建 persona 与优先级 |
| 5 | `RequirementsDecomposition` | 需求拆解 | 拆出可开发的功能清单 |
| 6 | `SolutionMirror` | 方案照妖镜 | 反向审查方案的自洽性与风险 |
| 7 | `PRDGeneration` | PRD 生成 | 输出完整可交付的 PRD |

### 级联重生依赖链

```
痛点发现 → 批判验证 → 现场调研 → 用户群体 → 需求拆解 → 方案照妖镜 → PRD 生成
   ↓           ↓           ↓           ↓          ↓           ↓           ↓
  清空        清空        清空        清空       清空        清空        重生
```

修改任意 SectionCard → 确认后 `Orchestrator.regenerateDownstream(fromStage)` 自动清空所有下游 → 逐个 `runSilent` 调用 LLM 重新推导 → 写回 store。位于末端的 `PRDGeneration` 无下游，不触发级联。

---

## 💡 新手引导流程

首次访问（或 localStorage 中没有 `meta.oneLiner`）会先渲染 `NewbieGuideFlow`——一个不含任何专业术语的轻量引导。它**不是独立 Stage**，而是所有阶段启动前的前置环节，可随时点「跳过 →」直接进入产品设定。

| # | 问题 | 类型 | 选项 / 映射字段 |
|---|------|------|------|
| 1 | 你想做一个什么东西？ | 自由输入 | → `meta.oneLiner` |
| 2 | 谁会最需要它？ | 选择题 | 学生 / 上班族 / 家长 / 老板创业者 / 其他 → `meta.targetUser` |
| 3 | 他们通常在什么情况下最需要？ | 选择题 | 上学/上班路上 / 办公室 / 家里 / 逛街出门 / 其他 → `meta.initialScene` |
| 4 | 现在他们是怎么解决这个问题的？ | 选择题 | 忍着不管 / 备忘录笔记 / 找人帮忙 / Excel / 其他 → `meta.constraints`（作为痛点线索） |
| 5 | 这是表层痛点还是深层痛点？ | 选择题 | 表层（症状）/ 深层（根因）/ 不确定 → `meta.painDepthHint` |

每个选择题都带「其他（可以补充）」选项可自由输入；每答完一题会插入一句过渡反馈，让引导像对话而不是填表。五问的结果会预填进「🚀 产品设定」表单，再经 `submitOnboarding()` 统一写入 `prd.meta`。

### 引导收尾与防重入

五问完成后的收尾逻辑由 `storeSubscribers.ts` 订阅 `newbieGuide.done` 触发。由于 zustand 的 `subscribe` 是**同步回调**，而 `completeNewbieGuide()` 是 async 函数并会在内部多次 `addMessage()`，必须防止重入递归。当前采用三层防护：

1. **实例级标志** `Orchestrator._completingNewbieGuide`——同步互斥，阻止本页任何重入
2. **数据级守卫**——`meta.oneLiner` 在所有 `addMessage()` **之前**写入，作为跨刷新生效的重入标记
3. **模块级标志** `storeSubscribers._completionFired`——保证每个页面会话最多触发一次

另外，`ChatPanel` 会等 `useChatStore` 的 persist 水合完成（`rehydrated === true`）后再决定是否启动引导，避免刷新后重复提问；`submitOnboarding()` 开头会检查 API Key，缺失时给出友好提示而不是挂在失败的 fetch 上。

---

## 🤖 自定义模型接入（OpenAI 兼容）

除了 5 个内置提供商，提供商下拉菜单末尾还有一项 **✏️ 自定义（OpenAI 兼容）**。选中后会展开独立配置面板，只需两个字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| **API 地址（Base URL）** | 支持完整端点或 Base URL——若未以 `/chat/completions` 结尾会自动补全，末尾斜杠也会自动去除 | `http://localhost:11434/v1` |
| **模型名称** | 目标服务实际接受的 model 字符串 | `llama3.1`、`qwen2.5-72b`、`mistral-large` |

API Key 仍使用公共输入框，以 `Authorization: Bearer <key>` 发送；本地服务无鉴权时可填任意非空值。「验证 API Key」对自定义提供商同样生效。

### 常见地址参考

| 服务 | API 地址 |
|------|---------|
| Ollama（本地） | `http://localhost:11434/v1` |
| LM Studio（本地） | `http://localhost:1234/v1` |
| vLLM（自部署） | `http://<host>:8000/v1` |
| OpenRouter | `https://openrouter.ai/api/v1` |
| Groq | `https://api.groq.com/openai/v1` |
| 硅基流动 SiliconFlow | `https://api.siliconflow.cn/v1` |

> ⚠️ 本应用在浏览器中直连模型接口，自定义服务需允许跨域（CORS）。Ollama 可通过环境变量 `OLLAMA_ORIGINS=*` 开启。

内置提供商的模型清单统一维护在 `src/core/types/config.ts` 的 `MODEL_OPTIONS` 中；若 localStorage 里存有已下架的模型名，设置面板会自动回退到该提供商的首个可用模型。

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
