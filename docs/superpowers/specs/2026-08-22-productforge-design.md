# ProductForge — AI 产品开发顾问 设计文档

## 概述

ProductForge 是一个网页端的 AI 产品开发顾问工具。它帮助没有工程背景的用户，通过交互式对话将现实生活中的痛点转化为完整的产品方案，并生成可直接导入 Qoder 等 AI 开发工具的结构化 Markdown PRD 文档。

## 核心设计理念

- **实时画布式交互**：左侧对话 + 右侧 PRD 画布，PRD 随对话实时生长
- **严格顾问人格**：Agent 以资深产品顾问身份参与，主动质疑假设、温和验证痛点真实性
- **问题驱动流程**：从痛点出发，经历验证、用户分析、需求拆解，最终生成 PRD
- **多模型兼容**：支持 OpenAI、Claude、DeepSeek、通义千问、智谱 GLM 等国内外大模型

## 目标用户

没有工程背景但希望将想法变成产品的个人——创业者、产品经理、设计师、学生，或任何在日常生活中观察到痛点并希望探索解决方案的人。

---

## 架构设计

### 整体架构

纯前端 SPA（单页应用），无后端服务器。用户自带 API Key，前端直接调用大模型 API。

```
┌─────────────────────────────────────────────────┐
│                  React SPA                       │
│  ┌──────────────────┬──────────────────────────┐ │
│  │   ChatPanel      │    ProductCanvas          │ │
│  │                  │                           │ │
│  │  对话消息列表     │   实时 PRD 画布            │ │
│  │  + 结构化表单    │   (按章节分区渲染)          │ │
│  │  + 用户输入      │   + 进度指示器             │ │
│  │                  │   + 内联编辑               │ │
│  └───────┬──────────┴──────────┬────────────────┘ │
│          │                     │                   │
│  ┌───────▼─────────────────────▼────────────────┐ │
│  │          StateManager (Zustand)               │ │
│  │   对话状态 │ PRD结构化数据 │ 阶段状态 │ 配置  │ │
│  └───────┬───────────────────────────────────────┘ │
│          │                                         │
│  ┌───────▼───────────────────────────────────────┐ │
│  │       AI Orchestrator (对话编排器)              │ │
│  │   StageController │ PromptBuilder │ Extractor  │ │
│  └───────┬───────────────────────────────────────┘ │
│          │                                         │
│  ┌───────▼───────────────────────────────────────┐ │
│  │       Model Adapter (多模型适配层)              │ │
│  │   OpenAI │ Claude │ DeepSeek │ 通义 │ 智谱     │ │
│  └───────────────────────────────────────────────┘ │
│                                                    │
│  ┌───────────────────────────────────────────────┐ │
│  │       Persistence (localStorage)               │ │
│  │   会话恢复 │ PRD导出 │ 配置存储                 │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 核心模块

| 模块 | 职责 |
|------|------|
| **ChatPanel** | 对话 UI，包含消息流、结构化表单（信息采集卡片）、AI 流式响应展示 |
| **ProductCanvas** | 右侧 PRD 画布，按章节实时渲染，显示进度和完成度 |
| **StateManager (Zustand)** | 全局状态管理：对话历史、PRD 结构化数据（JSON）、当前阶段、用户配置 |
| **AI Orchestrator** | 对话编排核心——控制阶段流转、构建 prompt、从 AI 响应中提取结构化数据 |
| **StageController** | 管理 5 个阶段的有限状态机（FSM），判断阶段完成条件，触发阶段切换 |
| **PromptBuilder** | 根据当前阶段 + 对话历史 + PRD 已有内容，动态构建 system prompt |
| **Extractor** | 从对话中提取结构化信息（痛点描述、用户画像、功能列表等），写入 PRD 数据 |
| **Model Adapter** | 统一接口适配多家大模型 API，支持流式输出 |

---

## UI 设计

### 布局

- **深色主题**
- **顶部栏**：产品名称 + 项目名 + 保存状态 + 导出按钮 + 设置入口
- **阶段进度条**：5 个阶段的可视化进度，当前阶段高亮
- **主内容区**：左对话面板（flex:1）+ 右 PRD 画布（420px 固定宽度）
- **对话面板**：消息列表 + 结构化信息采集卡片 + 底部输入框
- **PRD 画布**：按章节分区渲染（痛点描述、验证、用户群体、需求拆解、完整 PRD），未解锁章节半透明

### 关键交互

1. **结构化节点**：对话中出现信息采集卡片，用户填写结构化数据（如痛点频率、影响人群），数据直接写入 PRD 对应章节
2. **实时同步**：每次 AI 回复后，Extractor 自动提取结构化信息，画布对应章节实时更新，有内容变化的章节短暂高亮
3. **阶段推进**：阶段完成时，画布章节变为"已完成"状态，进度条推进，顶部阶段指示器高亮下一个阶段
4. **内联编辑**：用户可点击画布中已生成的内容进行手动修改，修改同步回对话上下文

---

## 5 阶段工作流

### 阶段 1：痛点发现

- **触发**：用户进入产品后的第一个对话
- **Agent 行为**：引导用户描述观察到的痛点，追问关键细节（频率、严重度、影响范围）
- **结构化节点**：信息采集卡片——痛点频率 / 严重程度 / 现有解决方式 / 影响人群
- **完成条件**：用户完成信息采集 + Agent 确认痛点描述已足够清晰
- **画布输出**：「痛点描述」章节——每个痛点的一句话描述 + 标签 + 详细场景（支持多个痛点）

### 阶段 2：批判验证

- **触发**：阶段 1 完成
- **Agent 行为**：严格顾问模式——质疑痛点的真实性（"你确定这是普遍问题还是个人感受？"）、验证现有方案为什么不行、分析市场可行性
- **结构化节点**：验证清单——痛点是否普遍 / 现有方案缺陷 / 市场空白分析
- **完成条件**：Agent 和用户达成共识——痛点值得做成产品
- **画布输出**：「痛点验证」章节——每个痛点的验证结论 + 竞品简况 + 可行性评分

### 阶段 3：用户群体分析

- **触发**：阶段 2 完成
- **Agent 行为**：引导用户细化目标人群，创建用户画像（人口特征、行为习惯、付费意愿）
- **结构化节点**：用户画像卡片（可添加多个）——名称 / 年龄 / 职业 / 核心需求 / 使用场景
- **完成条件**：至少创建 1 个完整用户画像
- **画布输出**：「用户群体」章节——目标市场 + 用户画像 + 市场规模估算

### 阶段 4：需求拆解

- **触发**：阶段 3 完成
- **Agent 行为**：引导用户从痛点推导功能需求，区分核心功能 vs 锦上添花，定义 MVP
- **结构化节点**：功能列表表格——功能名 / 优先级（P0-P3）/ 解决的痛点 / 预估复杂度
- **完成条件**：功能列表至少包含 3 个 P0 功能 + 清晰的 MVP 范围
- **画布输出**：「需求拆解」章节——功能列表 + MVP 定义 + 用户故事

### 阶段 5：PRD 生成

- **触发**：阶段 4 完成
- **Agent 行为**：汇总前 4 个阶段的所有输出，生成完整 PRD，逐项与用户确认
- **结构化节点**：PRD 预览界面——用户可对每个章节做最后审查和修改
- **完成条件**：用户确认 PRD 内容无误
- **画布输出**：「完整 PRD」章节——最终 Markdown PRD + 导出按钮

### 阶段间流转规则

- 每个阶段完成后，Agent 做"阶段总结"，明确告知用户已完成内容和下一步
- 用户可在对话中回溯修改之前阶段的内容，Agent 自动更新画布对应章节
- 阶段状态保存在 localStorage，刷新页面后可恢复

---

## AI 编排设计

### 多模型适配层

统一接口，所有模型共用同一套调用方式：

```typescript
interface ModelAdapter {
  name: string;
  chat(messages: Message[], options: ChatOptions): AsyncIterable<string>;  // 流式输出
  validateKey(apiKey: string): Promise<boolean>;
}

interface ChatOptions {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}
```

| 模型 | API 端点 | 备注 |
|------|---------|------|
| OpenAI | api.openai.com | GPT-4o / GPT-4o-mini |
| Claude | api.anthropic.com | Claude 3.5 Sonnet / Haiku |
| DeepSeek | api.deepseek.com | 兼容 OpenAI 格式 |
| 通义千问 | dashscope.aliyuncs.com | 阿里大模型 |
| 智谱 GLM | open.bigmodel.cn | ChatGLM-4 |

配置流程：用户在设置页面选择模型提供商 → 输入 API Key → 选择具体模型 → 本地验证 Key 有效性 → 保存到 localStorage。

### PromptBuilder

- 每个阶段有专属的 prompt 模板，注入"严格顾问"人格指令
- 动态注入当前对话历史 + PRD 已有内容作为上下文
- prompt 中包含结构化输出指令，要求 AI 在回复中用特定标记包裹结构化数据

### Extractor

从 AI 的流式响应中实时解析结构化数据标记：

```
AI 的回复文本...

<!-- EXTRACT:pain_point -->
{"description": "快递柜高峰爆满", "frequency": "每日", "severity": "高"}
<!-- /EXTRACT -->

AI 继续回复...
```

- Extractor 监听流式输出，遇到标记时解析 JSON 并更新 Zustand store
- 标记不显示给用户，只有纯文本内容渲染在对话气泡中

---

## 数据模型

```typescript
interface PRDData {
  meta: {
    projectName: string;
    createdAt: string;
    updatedAt: string;
    model: string;
  };
  painPoints: Array<{
    description: string;
    frequency: string;
    severity: string;
    affectedPeople: string;
    currentSolutions: string[];
    scene: string;
  }>;
  validation: {
    conclusion: string;
    isUniversal: boolean;
    existingSolutions: Array<{name: string; weakness: string}>;
    marketGap: string;
    feasibilityScore: number;  // 1-10
  };
  userGroups: {
    targetMarket: string;
    personas: Array<{
      name: string;
      age: string;
      occupation: string;
      needs: string;
      scenario: string;
      willingnessToPay: string;
    }>;
    marketSizeEstimate: string;
  };
  requirements: {
    features: Array<{
      name: string;
      priority: 'P0' | 'P1' | 'P2' | 'P3';
      solvesPainPoint: string;
      complexity: '低' | '中' | '高';
      description: string;
    }>;
    mvpScope: string;
    userStories: string[];
  };
  finalPRD: string;  // 最终生成的完整 Markdown PRD
}
```

---

## 输出 PRD 格式

生成的 Markdown PRD 针对 AI 开发工具优化：

```markdown
# [产品名称] - 产品需求文档 (PRD)

## 1. 项目概述
- 一句话描述
- 解决的问题
- 目标用户

## 2. 痛点与背景
- 痛点详述
- 使用场景
- 现有方案的不足

## 3. 目标用户
- 用户画像（含详细特征）
- 市场规模估算

## 4. 功能需求
### 4.1 MVP 核心功能（P0）
### 4.2 重要功能（P1）
### 4.3 锦上添花（P2）

## 5. 非功能需求
## 6. 技术建议
## 7. 开发路线图
## 8. 风险与假设

---
> 由 ProductForge AI 产品顾问生成
> 生成时间：YYYY-MM-DD
> 使用模型：[model name]
```

导出方式：一键下载 `.md` 文件 + 复制到剪贴板。

---

## 技术选型

| 模块 | 选型 | 理由 |
|------|------|------|
| 框架 | React 18 + TypeScript | 成熟生态，类型安全 |
| 样式 | Tailwind CSS | 快速开发，深色主题易实现 |
| 状态管理 | Zustand | 轻量、TS 友好、支持 persist 中间件 |
| 消息渲染 | react-markdown | 支持 Markdown 渲染，可扩展自定义组件 |
| 流式输出 | fetch stream (ReadableStream) | 处理 SSE 流式响应 |
| 构建工具 | Vite | 快速 HMR，开发体验好 |
| 内联编辑 | contentEditable + 自定义组件 | 画布中的文本编辑 |
| 部署 | 静态托管（Vercel / GitHub Pages） | 纯前端，无需服务器 |

## 项目结构

```
src/
├── components/
│   ├── ChatPanel/
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── StructuredCard.tsx
│   │   └── ChatInput.tsx
│   ├── Canvas/
│   │   ├── ProductCanvas.tsx
│   │   ├── SectionCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── InlineEditor.tsx
│   ├── StageIndicator.tsx
│   ├── Settings/
│   │   └── ModelConfig.tsx
│   └── Layout.tsx
├── core/
│   ├── ai/
│   │   ├── ModelAdapter.ts
│   │   ├── adapters/
│   │   │   ├── openai.ts
│   │   │   ├── claude.ts
│   │   │   ├── deepseek.ts
│   │   │   ├── qwen.ts
│   │   │   └── zhipu.ts
│   │   └── index.ts
│   ├── orchestrator/
│   │   ├── StageController.ts
│   │   ├── PromptBuilder.ts
│   │   └── Extractor.ts
│   ├── store/
│   │   ├── useChatStore.ts
│   │   ├── usePRDStore.ts
│   │   └── useConfigStore.ts
│   └── types/
│       ├── prd.ts
│       ├── chat.ts
│       └── stage.ts
├── utils/
│   ├── markdown.ts
│   ├── storage.ts
│   └── export.ts
├── App.tsx
└── main.tsx
```
