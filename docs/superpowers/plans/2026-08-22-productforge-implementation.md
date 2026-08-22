# ProductForge — AI 产品开发顾问 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个网页端 AI 产品开发顾问，通过交互式对话将用户的现实痛点转化为结构化 PRD 文档。

**Architecture:** 纯前端 React SPA，左侧对话面板 + 右侧实时 PRD 画布双栏布局。用户自带 API Key，前端直连多模型大模型 API。核心由 Zustand 状态管理 + AI Orchestrator（阶段控制器/Prompt 构建器/数据提取器）驱动 5 阶段工作流。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, react-markdown

**Spec:** `docs/superpowers/specs/2026-08-22-productforge-design.md`

---

### Task 1: 项目脚手架与基础配置

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `tailwind.config.js`, `postcss.config.js`
- Create: `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `.gitignore`

- [ ] **Step 1: 初始化 Vite + React + TypeScript 项目**

```bash
npm create vite@latest . -- --template react-ts
```

Expected: 生成基础项目结构，选择 "React" + "TypeScript"。

- [ ] **Step 2: 安装依赖**

```bash
npm install zustand react-markdown remark-gfm
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: 配置 Tailwind CSS**

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 4: 配置基础应用入口**

`src/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

`src/App.tsx`:
```tsx
function App() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      <h1 className="text-2xl font-bold p-8">ProductForge</h1>
      <p className="px-8 text-gray-400">AI 产品开发顾问</p>
    </div>
  )
}

export default App
```

- [ ] **Step 5: 配置 .gitignore**

`.gitignore`:
```
node_modules
dist
.superpowers
.env
```

- [ ] **Step 6: 验证开发服务器**

```bash
npm run dev
```

Expected: 浏览器显示深色背景页面，标题 "ProductForge" 和副标题 "AI 产品开发顾问"。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: initialize project with Vite, React, TypeScript, Tailwind CSS"
```

---

### Task 2: TypeScript 类型定义

**Files:**
- Create: `src/core/types/chat.ts`
- Create: `src/core/types/prd.ts`
- Create: `src/core/types/stage.ts`
- Create: `src/core/types/config.ts`

- [ ] **Step 1: 定义聊天相关类型**

`src/core/types/chat.ts`:
```typescript
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  structuredCard?: StructuredCard;
  isStreaming?: boolean;
}

export interface StructuredCard {
  type: 'pain_point_info' | 'validation_checklist' | 'persona_form' | 'feature_table' | 'prd_preview';
  title: string;
  fields: CardField[];
  submitted: boolean;
}

export interface CardField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  value: string;
  options?: string[];
  required?: boolean;
}
```

- [ ] **Step 2: 定义 PRD 数据相关类型**

`src/core/types/prd.ts`:
```typescript
export interface PainPoint {
  description: string;
  frequency: string;
  severity: string;
  affectedPeople: string;
  currentSolutions: string[];
  scene: string;
}

export interface ExistingSolution {
  name: string;
  weakness: string;
}

export interface Persona {
  name: string;
  age: string;
  occupation: string;
  needs: string;
  scenario: string;
  willingnessToPay: string;
}

export interface Feature {
  name: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  solvesPainPoint: string;
  complexity: '低' | '中' | '高';
  description: string;
}

export interface PRDData {
  meta: {
    projectName: string;
    createdAt: string;
    updatedAt: string;
    model: string;
  };
  painPoints: PainPoint[];
  validation: {
    conclusion: string;
    isUniversal: boolean;
    existingSolutions: ExistingSolution[];
    marketGap: string;
    feasibilityScore: number;
  };
  userGroups: {
    targetMarket: string;
    personas: Persona[];
    marketSizeEstimate: string;
  };
  requirements: {
    features: Feature[];
    mvpScope: string;
    userStories: string[];
  };
  finalPRD: string;
}

export function createEmptyPRD(): PRDData {
  return {
    meta: {
      projectName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: '',
    },
    painPoints: [],
    validation: {
      conclusion: '',
      isUniversal: false,
      existingSolutions: [],
      marketGap: '',
      feasibilityScore: 0,
    },
    userGroups: {
      targetMarket: '',
      personas: [],
      marketSizeEstimate: '',
    },
    requirements: {
      features: [],
      mvpScope: '',
      userStories: [],
    },
    finalPRD: '',
  };
}
```

- [ ] **Step 3: 定义阶段状态类型**

`src/core/types/stage.ts`:
```typescript
export enum Stage {
  PainPointDiscovery = 'pain_point_discovery',
  CriticalValidation = 'critical_validation',
  UserGroupAnalysis = 'user_group_analysis',
  RequirementsDecomposition = 'requirements_decomposition',
  PRDGeneration = 'prd_generation',
}

export interface StageInfo {
  id: Stage;
  name: string;
  description: string;
  status: 'locked' | 'active' | 'completed';
}

export const STAGE_ORDER: Stage[] = [
  Stage.PainPointDiscovery,
  Stage.CriticalValidation,
  Stage.UserGroupAnalysis,
  Stage.RequirementsDecomposition,
  Stage.PRDGeneration,
];

export const STAGE_LABELS: Record<Stage, string> = {
  [Stage.PainPointDiscovery]: '痛点发现',
  [Stage.CriticalValidation]: '批判验证',
  [Stage.UserGroupAnalysis]: '用户群体',
  [Stage.RequirementsDecomposition]: '需求拆解',
  [Stage.PRDGeneration]: 'PRD 生成',
};

export function getInitialStages(): StageInfo[] {
  return STAGE_ORDER.map((id, index) => ({
    id,
    name: STAGE_LABELS[id],
    description: '',
    status: index === 0 ? 'active' : 'locked',
  }));
}
```

- [ ] **Step 4: 定义配置类型**

`src/core/types/config.ts`:
```typescript
export type ModelProvider = 'openai' | 'claude' | 'deepseek' | 'qwen' | 'zhipu';

export interface ModelConfig {
  provider: ModelProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const MODEL_OPTIONS: Record<ModelProvider, { label: string; models: string[]; endpoint: string }> = {
  openai: {
    label: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  claude: {
    label: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    endpoint: 'https://api.anthropic.com/v1/messages',
  },
  deepseek: {
    label: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-coder'],
    endpoint: 'https://api.deepseek.com/chat/completions',
  },
  qwen: {
    label: '通义千问',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  },
  zhipu: {
    label: '智谱 GLM',
    models: ['glm-4-flash', 'glm-4'],
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  },
};
```

- [ ] **Step 5: 验证 TypeScript 编译无错误**

```bash
npx tsc --noEmit
```

Expected: 无错误输出。

- [ ] **Step 6: Commit**

```bash
git add src/core/types/
git commit -m "feat: add core type definitions for chat, PRD, stages, and config"
```

---

### Task 3: Zustand 状态管理

**Files:**
- Create: `src/core/store/useChatStore.ts`
- Create: `src/core/store/usePRDStore.ts`
- Create: `src/core/store/useConfigStore.ts`
- Create: `src/core/store/useStageStore.ts`

- [ ] **Step 1: 创建对话状态 Store**

`src/core/store/useChatStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from '../types/chat';

interface ChatState {
  messages: Message[];
  isGenerating: boolean;
  addMessage: (message: Message) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isGenerating: false,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateLastAssistantMessage: (content) =>
        set((state) => {
          const msgs = [...state.messages];
          const lastIdx = msgs.findLastIndex((m) => m.role === 'assistant');
          if (lastIdx >= 0) {
            msgs[lastIdx] = { ...msgs[lastIdx], content, isStreaming: false };
          }
          return { messages: msgs };
        }),
      setStreaming: (streaming) => set({ isGenerating: streaming }),
      clearMessages: () => set({ messages: [], isGenerating: false }),
    }),
    { name: 'productforge-chat' },
  ),
);
```

- [ ] **Step 2: 创建 PRD 数据 Store**

`src/core/store/usePRDStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRDData, createEmptyPRD, PainPoint, Persona, Feature, ExistingSolution } from '../types/prd';

interface PRDState {
  prd: PRDData;
  updateMeta: (meta: Partial<PRDData['meta']>) => void;
  addPainPoint: (pp: PainPoint) => void;
  setValidation: (v: Partial<PRDData['validation']>) => void;
  addTargetMarket: (market: string) => void;
  addPersona: (p: Persona) => void;
  addFeature: (f: Feature) => void;
  setMvpScope: (scope: string) => void;
  addUserStory: (story: string) => void;
  setFinalPRD: (prd: string) => void;
  resetPRD: () => void;
  updatePRD: (updater: (prd: PRDData) => PRDData) => void;
}

export const usePRDStore = create<PRDState>()(
  persist(
    (set) => ({
      prd: createEmptyPRD(),
      updateMeta: (meta) =>
        set((state) => ({
          prd: { ...state.prd, meta: { ...state.prd.meta, ...meta, updatedAt: new Date().toISOString() } },
        })),
      addPainPoint: (pp) =>
        set((state) => ({
          prd: { ...state.prd, painPoints: [...state.prd.painPoints, pp], meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      setValidation: (v) =>
        set((state) => ({
          prd: { ...state.prd, validation: { ...state.prd.validation, ...v }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addTargetMarket: (market) =>
        set((state) => ({
          prd: { ...state.prd, userGroups: { ...state.prd.userGroups, targetMarket: market }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addPersona: (p) =>
        set((state) => ({
          prd: { ...state.prd, userGroups: { ...state.prd.userGroups, personas: [...state.prd.userGroups.personas, p] }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addFeature: (f) =>
        set((state) => ({
          prd: { ...state.prd, requirements: { ...state.prd.requirements, features: [...state.prd.requirements.features, f] }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      setMvpScope: (scope) =>
        set((state) => ({
          prd: { ...state.prd, requirements: { ...state.prd.requirements, mvpScope: scope }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addUserStory: (story) =>
        set((state) => ({
          prd: { ...state.prd, requirements: { ...state.prd.requirements, userStories: [...state.prd.requirements.userStories, story] }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      setFinalPRD: (prd) =>
        set((state) => ({
          prd: { ...state.prd, finalPRD: prd, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      resetPRD: () => set({ prd: createEmptyPRD() }),
      updatePRD: (updater) => set((state) => ({ prd: updater(state.prd) })),
    }),
    { name: 'productforge-prd' },
  ),
);
```

- [ ] **Step 3: 创建配置 Store**

`src/core/store/useConfigStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelConfig, ModelProvider } from '../types/config';

interface ConfigState {
  modelConfig: ModelConfig;
  setModelConfig: (config: Partial<ModelConfig>) => void;
  setProvider: (provider: ModelProvider) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      modelConfig: {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4096,
      },
      setModelConfig: (config) =>
        set((state) => ({ modelConfig: { ...state.modelConfig, ...config } })),
      setProvider: (provider) =>
        set({ modelConfig: { provider, apiKey: '', model: '', temperature: 0.7, maxTokens: 4096 } }),
    }),
    { name: 'productforge-config' },
  ),
);
```

- [ ] **Step 4: 创建阶段状态 Store**

`src/core/store/useStageStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Stage, StageInfo, getInitialStages, STAGE_ORDER } from '../types/stage';

interface StageState {
  stages: StageInfo[];
  currentStage: Stage;
  advanceStage: () => void;
  setCurrentStage: (stage: Stage) => void;
  completeCurrentStage: () => void;
  resetStages: () => void;
}

export const useStageStore = create<StageState>()(
  persist(
    (set, get) => ({
      stages: getInitialStages(),
      currentStage: Stage.PainPointDiscovery,
      advanceStage: () => {
        const { currentStage } = get();
        const currentIndex = STAGE_ORDER.indexOf(currentStage);
        if (currentIndex >= STAGE_ORDER.length - 1) return;

        const nextStage = STAGE_ORDER[currentIndex + 1];
        set((state) => ({
          currentStage: nextStage,
          stages: state.stages.map((s) => {
            if (s.id === currentStage) return { ...s, status: 'completed' as const };
            if (s.id === nextStage) return { ...s, status: 'active' as const };
            return s;
          }),
        }));
      },
      setCurrentStage: (stage) => set({ currentStage: stage }),
      completeCurrentStage: () => {
        const { currentStage } = get();
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === currentStage ? { ...s, status: 'completed' as const } : s,
          ),
        }));
      },
      resetStages: () => set({ stages: getInitialStages(), currentStage: Stage.PainPointDiscovery }),
    }),
    { name: 'productforge-stages' },
  ),
);
```

- [ ] **Step 5: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 6: Commit**

```bash
git add src/core/store/
git commit -m "feat: add Zustand stores for chat, PRD data, config, and stages"
```

---

### Task 4: 多模型适配层

**Files:**
- Create: `src/core/ai/ModelAdapter.ts`
- Create: `src/core/ai/adapters/openai.ts`
- Create: `src/core/ai/adapters/claude.ts`
- Create: `src/core/ai/adapters/deepseek.ts`
- Create: `src/core/ai/adapters/qwen.ts`
- Create: `src/core/ai/adapters/zhipu.ts`
- Create: `src/core/ai/index.ts`

- [ ] **Step 1: 定义统一适配接口**

`src/core/ai/ModelAdapter.ts`:
```typescript
import { ModelConfig } from '../types/config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOptions {
  messages: ChatMessage[];
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export interface IModelAdapter {
  name: string;
  chat(options: StreamOptions): AbortController;
  validateKey(apiKey: string, model: string): Promise<boolean>;
}
```

- [ ] **Step 2: 实现 OpenAI 适配器**

`src/core/ai/adapters/openai.ts`:
```typescript
import { IModelAdapter, StreamOptions } from '../ModelAdapter';
import { MODEL_OPTIONS } from '../../types/config';

export class OpenAIAdapter implements IModelAdapter {
  name = 'openai';

  chat(options: StreamOptions): AbortController {
    const controller = new AbortController();
    const { messages, systemPrompt, model, temperature, maxTokens, apiKey, onChunk, onDone, onError } = options;

    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages,
    ];

    fetch(MODEL_OPTIONS.openai.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: allMessages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onChunk(content);
            } catch {
              // skip malformed chunks
            }
          }
        }
        onDone();
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError(err);
      });

    return controller;
  }

  async validateKey(apiKey: string, model: string): Promise<boolean> {
    try {
      const res = await fetch(MODEL_OPTIONS.openai.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 3: 实现 Claude 适配器**

`src/core/ai/adapters/claude.ts`:
```typescript
import { IModelAdapter, StreamOptions } from '../ModelAdapter';
import { MODEL_OPTIONS } from '../../types/config';

export class ClaudeAdapter implements IModelAdapter {
  name = 'claude';

  chat(options: StreamOptions): AbortController {
    const controller = new AbortController();
    const { messages, systemPrompt, model, temperature, maxTokens, apiKey, onChunk, onDone, onError } = options;

    fetch(MODEL_OPTIONS.claude.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text;
                if (text) onChunk(text);
              } else if (parsed.type === 'message_stop') {
                onDone();
                return;
              }
            } catch {
              // skip
            }
          }
        }
        onDone();
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError(err);
      });

    return controller;
  }

  async validateKey(apiKey: string, model: string): Promise<boolean> {
    try {
      const res = await fetch(MODEL_OPTIONS.claude.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 4: 实现 DeepSeek 适配器**

DeepSeek 兼容 OpenAI 格式，复用逻辑：

`src/core/ai/adapters/deepseek.ts`:
```typescript
import { IModelAdapter, StreamOptions } from '../ModelAdapter';
import { MODEL_OPTIONS } from '../../types/config';

export class DeepSeekAdapter implements IModelAdapter {
  name = 'deepseek';

  chat(options: StreamOptions): AbortController {
    const controller = new AbortController();
    const { messages, systemPrompt, model, temperature, maxTokens, apiKey, onChunk, onDone, onError } = options;

    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages,
    ];

    fetch(MODEL_OPTIONS.deepseek.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: allMessages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') { onDone(); return; }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onChunk(content);
            } catch {}
          }
        }
        onDone();
      })
      .catch((err) => { if (err.name !== 'AbortError') onError(err); });

    return controller;
  }

  async validateKey(apiKey: string, model: string): Promise<boolean> {
    try {
      const res = await fetch(MODEL_OPTIONS.deepseek.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 }),
      });
      return res.ok;
    } catch { return false; }
  }
}
```

- [ ] **Step 5: 实现通义千问和智谱适配器**

两者均兼容 OpenAI 格式。

`src/core/ai/adapters/qwen.ts`:
```typescript
import { IModelAdapter, StreamOptions } from '../ModelAdapter';
import { MODEL_OPTIONS } from '../../types/config';

export class QwenAdapter implements IModelAdapter {
  name = 'qwen';

  chat(options: StreamOptions): AbortController {
    const controller = new AbortController();
    const { messages, systemPrompt, model, temperature, maxTokens, apiKey, onChunk, onDone, onError } = options;
    const allMessages = [{ role: 'system' as const, content: systemPrompt }, ...messages];

    fetch(MODEL_OPTIONS.qwen.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: allMessages, temperature, max_tokens: maxTokens, stream: true }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Qwen API error: ${response.status}`);
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') { onDone(); return; }
            try { const p = JSON.parse(data); const c = p.choices?.[0]?.delta?.content; if (c) onChunk(c); } catch {}
          }
        }
        onDone();
      })
      .catch((err) => { if (err.name !== 'AbortError') onError(err); });
    return controller;
  }

  async validateKey(apiKey: string, model: string): Promise<boolean> {
    try {
      const res = await fetch(MODEL_OPTIONS.qwen.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 }),
      });
      return res.ok;
    } catch { return false; }
  }
}
```

`src/core/ai/adapters/zhipu.ts`:
```typescript
import { IModelAdapter, StreamOptions } from '../ModelAdapter';
import { MODEL_OPTIONS } from '../../types/config';

export class ZhipuAdapter implements IModelAdapter {
  name = 'zhipu';

  chat(options: StreamOptions): AbortController {
    const controller = new AbortController();
    const { messages, systemPrompt, model, temperature, maxTokens, apiKey, onChunk, onDone, onError } = options;
    const allMessages = [{ role: 'system' as const, content: systemPrompt }, ...messages];

    fetch(MODEL_OPTIONS.zhipu.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: allMessages, temperature, max_tokens: maxTokens, stream: true }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Zhipu API error: ${response.status}`);
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') { onDone(); return; }
            try { const p = JSON.parse(data); const c = p.choices?.[0]?.delta?.content; if (c) onChunk(c); } catch {}
          }
        }
        onDone();
      })
      .catch((err) => { if (err.name !== 'AbortError') onError(err); });
    return controller;
  }

  async validateKey(apiKey: string, model: string): Promise<boolean> {
    try {
      const res = await fetch(MODEL_OPTIONS.zhipu.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 }),
      });
      return res.ok;
    } catch { return false; }
  }
}
```

- [ ] **Step 6: 创建适配器工厂**

`src/core/ai/index.ts`:
```typescript
import { ModelProvider } from '../types/config';
import { IModelAdapter } from './ModelAdapter';
import { OpenAIAdapter } from './adapters/openai';
import { ClaudeAdapter } from './adapters/claude';
import { DeepSeekAdapter } from './adapters/deepseek';
import { QwenAdapter } from './adapters/qwen';
import { ZhipuAdapter } from './adapters/zhipu';

const adapters: Record<ModelProvider, IModelAdapter> = {
  openai: new OpenAIAdapter(),
  claude: new ClaudeAdapter(),
  deepseek: new DeepSeekAdapter(),
  qwen: new QwenAdapter(),
  zhipu: new ZhipuAdapter(),
};

export function getAdapter(provider: ModelProvider): IModelAdapter {
  return adapters[provider];
}

export type { IModelAdapter, ChatMessage, StreamOptions } from './ModelAdapter';
```

- [ ] **Step 7: 验证编译**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 8: Commit**

```bash
git add src/core/ai/
git commit -m "feat: add multi-model adapter layer (OpenAI, Claude, DeepSeek, Qwen, Zhipu)"
```

---

### Task 5: PromptBuilder — 各阶段 Prompt 模板

**Files:**
- Create: `src/core/orchestrator/PromptBuilder.ts`

- [ ] **Step 1: 实现 PromptBuilder**

`src/core/orchestrator/PromptBuilder.ts`:
```typescript
import { Stage } from '../types/stage';
import { PRDData } from '../types/prd';

const BASE_PERSONA = `你是 ProductForge，一位资深产品顾问。你拥有 15 年的产品设计和创业咨询经验。

你的风格是严格但温和的顾问型：
- 你会主动质疑用户的假设，用专业经验帮助他们思考盲点
- 你不会无条件肯定每个想法，但也不会粗暴否定
- 你会用提问引导思考，而不是直接给答案
- 你用简洁清晰的中文交流，避免行业黑话

重要规则：
- 每次回复中如果需要提取结构化数据，用以下格式包裹（不要展示给用户）：
  <!-- EXTRACT:类型 -->
  {"key": "value"}
  <!-- /EXTRACT -->
  其中"类型"根据当前阶段决定（见下方阶段指令）
- 不要一次问太多问题，每次最多 2-3 个
- 如果用户的回答不够清晰，继续追问`;

export class PromptBuilder {
  build(stage: Stage, prd: PRDData): string {
    const stagePrompt = this.getStagePrompt(stage);
    const contextPrompt = this.buildContext(prd, stage);
    return `${BASE_PERSONA}\n\n---\n\n${stagePrompt}\n\n---\n\n${contextPrompt}`;
  }

  private getStagePrompt(stage: Stage): string {
    switch (stage) {
      case Stage.PainPointDiscovery:
        return `【当前阶段：痛点发现】

你的任务是帮助用户识别和描述他们观察到的痛点。

引导步骤：
1. 让用户描述痛点（如果还没描述的话）
2. 追问关键细节：
   - 这个痛点发生的频率？
   - 严重程度如何？对生活/工作有多大影响？
   - 目前人们怎么解决？现有方式有什么不好？
   - 哪些人最受影响？
3. 当信息足够时，用 EXTRACT 提取痛点数据：

<!-- EXTRACT:pain_point -->
{"description": "一句话描述", "frequency": "频率", "severity": "高/中/低", "affectedPeople": "影响人群", "currentSolutions": ["方案1", "方案2"], "scene": "具体场景描述"}
<!-- /EXTRACT -->

当用户完成描述且你确认信息足够清晰时，在回复末尾添加：
<!-- STAGE_COMPLETE -->`;

      case Stage.CriticalValidation:
        return `【当前阶段：批判验证】

你的任务是严格验证用户提出的痛点是否真实、是否值得做成产品。

你必须挑战用户的假设：
- "你确定这是普遍问题还是个人感受？有什么证据？"
- "现有方案真的不行吗？还是只是不够方便？"
- "如果这个问题这么严重，为什么还没有好的解决方案？"
- "做这个产品的市场空间有多大？"

用 EXTRACT 提取验证结论：
<!-- EXTRACT:validation -->
{"conclusion": "验证结论", "isUniversal": true/false, "existingSolutions": [{"name": "方案名", "weakness": "缺陷"}], "marketGap": "市场空白分析", "feasibilityScore": 7}
<!-- /EXTRACT -->

feasibilityScore 范围 1-10，基于你对可行性的判断。

当验证充分时，在回复末尾添加：
<!-- STAGE_COMPLETE -->`;

      case Stage.UserGroupAnalysis:
        return `【当前阶段：用户群体分析】

你的任务是帮助用户明确目标用户群体，创建用户画像。

引导步骤：
1. 引导用户思考：谁会最先使用这个产品？
2. 帮用户细化人群特征：年龄、职业、收入水平、行为习惯
3. 引导创建 1-3 个具体的用户画像
4. 讨论市场规模估算

用 EXTRACT 提取每个画像：
<!-- EXTRACT:persona -->
{"name": "画像名称", "age": "年龄段", "occupation": "职业", "needs": "核心需求", "scenario": "使用场景", "willingnessToPay": "付费意愿"}
<!-- /EXTRACT -->

用 EXTRACT 提取目标市场：
<!-- EXTRACT:target_market -->
{"targetMarket": "目标市场描述", "marketSizeEstimate": "规模估算"}
<!-- /EXTRACT -->

至少创建 1 个完整画像后，在回复末尾添加：
<!-- STAGE_COMPLETE -->`;

      case Stage.RequirementsDecomposition:
        return `【当前阶段：需求拆解】

你的任务是引导用户从痛点推导出具体的功能需求。

引导步骤：
1. 基于痛点和用户画像，引导用户思考解决方案的核心功能
2. 区分优先级：P0（必须有）、P1（重要）、P2（锦上添花）、P3（未来考虑）
3. 定义 MVP 范围——最小可用版本需要什么
4. 编写关键用户故事

用 EXTRACT 提取每个功能：
<!-- EXTRACT:feature -->
{"name": "功能名", "priority": "P0", "solvesPainPoint": "解决的痛点", "complexity": "中", "description": "功能描述"}
<!-- /EXTRACT -->

用 EXTRACT 提取 MVP 范围：
<!-- EXTRACT:mvp_scope -->
{"mvpScope": "MVP 范围描述"}
<!-- /EXTRACT -->

用 EXTRACT 提取用户故事：
<!-- EXTRACT:user_story -->
{"story": "作为[角色]，我希望[功能]，以便[价值]"}
<!-- /EXTRACT -->

至少 3 个 P0 功能 + MVP 定义后，在回复末尾添加：
<!-- STAGE_COMPLETE -->`;

      case Stage.PRDGeneration:
        return `【当前阶段：PRD 生成】

你的任务是根据前面所有阶段收集的信息，生成一份完整的产品需求文档（PRD）。

请按照以下结构生成 PRD：

# [产品名称] - 产品需求文档 (PRD)

## 1. 项目概述
## 2. 痛点与背景
## 3. 目标用户
## 4. 功能需求
### 4.1 MVP 核心功能（P0）
### 4.2 重要功能（P1）
### 4.3 锦上添花（P2）
## 5. 非功能需求
## 6. 技术建议
## 7. 开发路线图
## 8. 风险与假设

用 EXTRACT 提取最终 PRD：
<!-- EXTRACT:final_prd -->
{"finalPRD": "完整的 Markdown PRD 内容"}
<!-- /EXTRACT -->

生成后请逐项与用户确认每个章节。当用户确认无误时，在回复末尾添加：
<!-- STAGE_COMPLETE -->`;
    }
  }

  private buildContext(prd: PRDData, stage: Stage): string {
    const parts: string[] = ['【已有信息上下文】'];

    if (prd.meta.projectName) {
      parts.push(`项目名称：${prd.meta.projectName}`);
    }

    if (prd.painPoints.length > 0) {
      parts.push(`\n痛点列表：`);
      prd.painPoints.forEach((pp, i) => {
        parts.push(`${i + 1}. ${pp.description}（频率：${pp.frequency}，严重度：${pp.severity}）`);
      });
    }

    if (prd.validation.conclusion) {
      parts.push(`\n验证结论：${prd.validation.conclusion}`);
      parts.push(`可行性评分：${prd.validation.feasibilityScore}/10`);
    }

    if (prd.userGroups.personas.length > 0) {
      parts.push(`\n用户画像：`);
      prd.userGroups.personas.forEach((p, i) => {
        parts.push(`${i + 1}. ${p.name}（${p.age}，${p.occupation}）`);
      });
    }

    if (prd.requirements.features.length > 0) {
      parts.push(`\n功能列表：`);
      prd.requirements.features.forEach((f) => {
        parts.push(`- [${f.priority}] ${f.name}：${f.description}`);
      });
    }

    if (parts.length === 1) {
      parts.push('（暂无已收集的信息，这是对话的开始）');
    }

    return parts.join('\n');
  }
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add src/core/orchestrator/PromptBuilder.ts
git commit -m "feat: add PromptBuilder with stage-specific prompt templates"
```

---

### Task 6: Extractor — 结构化数据提取

**Files:**
- Create: `src/core/orchestrator/Extractor.ts`

- [ ] **Step 1: 实现 Extractor**

`src/core/orchestrator/Extractor.ts`:
```typescript
import { usePRDStore } from '../store/usePRDStore';

interface ExtractedData {
  type: string;
  data: Record<string, unknown>;
}

export class Extractor {
  /**
   * 从 AI 回复文本中提取结构化数据标记，返回纯文本（去除标记）
   */
  extract(fullText: string): { cleanText: string; extracted: ExtractedData[] } {
    const extracted: ExtractedData[] = [];
    const regex = /<!-- EXTRACT:(\w+) -->\s*([\s\S]*?)\s*<!-- \/EXTRACT -->/g;

    let cleanText = fullText;
    let match;

    while ((match = regex.exec(fullText)) !== null) {
      const type = match[1];
      const jsonStr = match[2].trim();
      try {
        const data = JSON.parse(jsonStr);
        extracted.push({ type, data });
      } catch {
        // skip malformed extractions
      }
    }

    // Remove all extraction markers from the displayed text
    cleanText = fullText.replace(regex, '').trim();
    // Also remove stage complete marker
    cleanText = cleanText.replace(/<!-- STAGE_COMPLETE -->/g, '').trim();

    return { cleanText, extracted };
  }

  /**
   * 检查是否包含阶段完成标记
   */
  isStageComplete(text: string): boolean {
    return text.includes('<!-- STAGE_COMPLETE -->');
  }

  /**
   * 将提取的数据写入 PRD Store
   */
  applyToStore(extracted: ExtractedData[]): void {
    const prdStore = usePRDStore.getState();

    for (const item of extracted) {
      switch (item.type) {
        case 'pain_point':
          prdStore.addPainPoint({
            description: String(item.data.description || ''),
            frequency: String(item.data.frequency || ''),
            severity: String(item.data.severity || ''),
            affectedPeople: String(item.data.affectedPeople || ''),
            currentSolutions: (item.data.currentSolutions as string[]) || [],
            scene: String(item.data.scene || ''),
          });
          break;

        case 'validation':
          prdStore.setValidation({
            conclusion: String(item.data.conclusion || ''),
            isUniversal: Boolean(item.data.isUniversal),
            existingSolutions: (item.data.existingSolutions as Array<{ name: string; weakness: string }>) || [],
            marketGap: String(item.data.marketGap || ''),
            feasibilityScore: Number(item.data.feasibilityScore || 0),
          });
          break;

        case 'persona':
          prdStore.addPersona({
            name: String(item.data.name || ''),
            age: String(item.data.age || ''),
            occupation: String(item.data.occupation || ''),
            needs: String(item.data.needs || ''),
            scenario: String(item.data.scenario || ''),
            willingnessToPay: String(item.data.willingnessToPay || ''),
          });
          break;

        case 'target_market':
          prdStore.addTargetMarket(String(item.data.targetMarket || ''));
          break;

        case 'feature':
          prdStore.addFeature({
            name: String(item.data.name || ''),
            priority: (item.data.priority as 'P0' | 'P1' | 'P2' | 'P3') || 'P1',
            solvesPainPoint: String(item.data.solvesPainPoint || ''),
            complexity: (item.data.complexity as '低' | '中' | '高') || '中',
            description: String(item.data.description || ''),
          });
          break;

        case 'mvp_scope':
          prdStore.setMvpScope(String(item.data.mvpScope || ''));
          break;

        case 'user_story':
          prdStore.addUserStory(String(item.data.story || ''));
          break;

        case 'final_prd':
          prdStore.setFinalPRD(String(item.data.finalPRD || ''));
          break;
      }
    }
  }
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add src/core/orchestrator/Extractor.ts
git commit -m "feat: add Extractor for parsing structured data from AI responses"
```

---

### Task 7: StageController — 阶段状态机

**Files:**
- Create: `src/core/orchestrator/StageController.ts`

- [ ] **Step 1: 实现 StageController**

`src/core/orchestrator/StageController.ts`:
```typescript
import { Stage, STAGE_ORDER } from '../types/stage';
import { PRDData } from '../types/prd';
import { useStageStore } from '../store/useStageStore';

export class StageController {
  /**
   * 检查当前阶段是否可以推进
   */
  canAdvance(stage: Stage, prd: PRDData): boolean {
    switch (stage) {
      case Stage.PainPointDiscovery:
        return prd.painPoints.length > 0 && prd.painPoints.every(
          (pp) => pp.description && pp.frequency && pp.severity
        );

      case Stage.CriticalValidation:
        return Boolean(prd.validation.conclusion) && prd.validation.feasibilityScore > 0;

      case Stage.UserGroupAnalysis:
        return prd.userGroups.personas.length > 0;

      case Stage.RequirementsDecomposition:
        return (
          prd.requirements.features.filter((f) => f.priority === 'P0').length >= 3 &&
          Boolean(prd.requirements.mvpScope)
        );

      case Stage.PRDGeneration:
        return Boolean(prd.finalPRD);

      default:
        return false;
    }
  }

  /**
   * 尝试推进到下一阶段
   */
  tryAdvance(prd: PRDData): boolean {
    const stageStore = useStageStore.getState();
    const currentStage = stageStore.currentStage;

    if (!this.canAdvance(currentStage, prd)) return false;

    stageStore.advanceStage();
    return true;
  }

  /**
   * 获取阶段进度百分比
   */
  getProgress(prd: PRDData): number {
    const stageStore = useStageStore.getState();
    const currentStage = stageStore.currentStage;
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const baseProgress = (currentIndex / STAGE_ORDER.length) * 100;

    // Add partial progress for current stage
    let stageProgress = 0;
    switch (currentStage) {
      case Stage.PainPointDiscovery:
        stageProgress = prd.painPoints.length > 0 ? 10 : 0;
        break;
      case Stage.CriticalValidation:
        stageProgress = prd.validation.conclusion ? 10 : 0;
        break;
      case Stage.UserGroupAnalysis:
        stageProgress = prd.userGroups.personas.length > 0 ? 10 : 0;
        break;
      case Stage.RequirementsDecomposition:
        stageProgress = prd.requirements.features.length > 0 ? 10 : 0;
        break;
      case Stage.PRDGeneration:
        stageProgress = prd.finalPRD ? 20 : 0;
        break;
    }

    return Math.min(100, baseProgress + stageProgress);
  }
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add src/core/orchestrator/StageController.ts
git commit -m "feat: add StageController with completion conditions and progress tracking"
```

---

### Task 8: AI Orchestrator — 对话编排核心

**Files:**
- Create: `src/core/orchestrator/Orchestrator.ts`

- [ ] **Step 1: 实现 Orchestrator，整合 PromptBuilder + Extractor + StageController**

`src/core/orchestrator/Orchestrator.ts`:
```typescript
import { PromptBuilder } from './PromptBuilder';
import { Extractor } from './Extractor';
import { StageController } from './StageController';
import { getAdapter } from '../ai';
import { useChatStore } from '../store/useChatStore';
import { usePRDStore } from '../store/usePRDStore';
import { useConfigStore } from '../store/useConfigStore';
import { useStageStore } from '../store/useStageStore';
import { ChatMessage } from '../ai/ModelAdapter';
import { Message } from '../types/chat';

export class Orchestrator {
  private promptBuilder = new PromptBuilder();
  private extractor = new Extractor();
  private stageController = new StageController();
  private abortController: AbortController | null = null;

  /**
   * 发送用户消息并获取 AI 回复
   */
  async sendMessage(userContent: string): Promise<void> {
    const chatStore = useChatStore.getState();
    const configStore = useConfigStore.getState();
    const stageStore = useStageStore.getState();
    const prdStore = usePRDStore.getState();

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
    };
    chatStore.addMessage(userMessage);

    // Build system prompt
    const systemPrompt = this.promptBuilder.build(stageStore.currentStage, prdStore.prd);

    // Prepare chat messages (exclude system prompt, it's in the system prompt)
    const messages: ChatMessage[] = chatStore.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    // Add placeholder assistant message
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    chatStore.addMessage(assistantMessage);
    chatStore.setStreaming(true);

    let fullResponse = '';

    // Call AI model
    this.abortController = getAdapter(configStore.modelConfig.provider).chat({
      messages,
      systemPrompt,
      model: configStore.modelConfig.model,
      temperature: configStore.modelConfig.temperature,
      maxTokens: configStore.modelConfig.maxTokens,
      apiKey: configStore.modelConfig.apiKey,
      onChunk: (chunk: string) => {
        fullResponse += chunk;
        // Extract and update display in real-time
        const { cleanText } = this.extractor.extract(fullResponse);
        chatStore.updateLastAssistantMessage(cleanText);
      },
      onDone: () => {
        chatStore.setStreaming(false);
        // Final extraction and apply to PRD store
        const { cleanText, extracted } = this.extractor.extract(fullResponse);
        chatStore.updateLastAssistantMessage(cleanText);

        if (extracted.length > 0) {
          this.extractor.applyToStore(extracted);
        }

        // Check stage completion
        if (this.extractor.isStageComplete(fullResponse)) {
          this.stageController.tryAdvance(usePRDStore.getState().prd);
        }

        this.abortController = null;
      },
      onError: (error: Error) => {
        chatStore.setStreaming(false);
        chatStore.updateLastAssistantMessage(`⚠️ 出错了：${error.message}。请检查你的 API Key 和网络连接。`);
        this.abortController = null;
      },
    });
  }

  /**
   * 中止当前生成
   */
  abort(): void {
    this.abortController?.abort();
    this.abortController = null;
    useChatStore.getState().setStreaming(false);
  }

  /**
   * 获取当前进度百分比
   */
  getProgress(): number {
    return this.stageController.getProgress(usePRDStore.getState().prd);
  }
}

// Singleton instance
export const orchestrator = new Orchestrator();
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add src/core/orchestrator/Orchestrator.ts
git commit -m "feat: add Orchestrator integrating PromptBuilder, Extractor, and StageController"
```

---

### Task 9: UI — 阶段进度指示器

**Files:**
- Create: `src/components/StageIndicator.tsx`

- [ ] **Step 1: 实现阶段进度条组件**

`src/components/StageIndicator.tsx`:
```tsx
import { useStageStore } from '../core/store/useStageStore';
import { STAGE_LABELS, STAGE_ORDER } from '../core/types/stage';

export function StageIndicator() {
  const { stages, currentStage } = useStageStore();

  return (
    <div className="flex items-center gap-1.5 px-5 py-2 bg-[#16213e] overflow-x-auto">
      {stages.map((stage, index) => {
        const isActive = stage.id === currentStage;
        const isCompleted = stage.status === 'completed';

        return (
          <div key={stage.id} className="flex items-center gap-1.5">
            <div
              className={`
                px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all
                ${isActive ? 'bg-[#4ecdc4] text-black font-bold' : ''}
                ${isCompleted ? 'bg-[#2d6b6b] text-[#4ecdc4]' : ''}
                ${!isActive && !isCompleted ? 'bg-[#2d2d44] text-gray-500' : ''}
              `}
            >
              {isCompleted && '✓ '}{index + 1}. {STAGE_LABELS[stage.id]}
            </div>
            {index < STAGE_ORDER.length - 1 && (
              <span className={`text-xs ${isCompleted ? 'text-[#4ecdc4]' : 'text-gray-600'}`}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 在 App.tsx 中引入验证渲染**

更新 `src/App.tsx`：
```tsx
import { StageIndicator } from './components/StageIndicator';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-[#1a1a2e] border-b border-[#2d2d44]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">⚡ ProductForge</span>
          <span className="text-gray-500 text-xs">|</span>
          <span className="text-gray-400 text-xs">AI 产品开发顾问</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#4ecdc4] text-xs">● 已保存</span>
        </div>
      </header>

      {/* Stage Progress */}
      <StageIndicator />

      {/* Main Content Area (placeholder) */}
      <main className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center text-gray-500">
          对话面板（待实现）
        </div>
        <div className="w-[420px] border-l border-[#2d2d44] flex items-center justify-center text-gray-500">
          PRD 画布（待实现）
        </div>
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: 验证页面渲染**

```bash
npm run dev
```

Expected: 页面顶部显示深色导航栏、阶段进度条（第一阶段高亮为绿色），主内容区显示两个占位区域。

- [ ] **Step 4: Commit**

```bash
git add src/components/StageIndicator.tsx src/App.tsx
git commit -m "feat: add StageIndicator component and update App layout"
```

---

### Task 10: UI — 对话面板

**Files:**
- Create: `src/components/ChatPanel/MessageBubble.tsx`
- Create: `src/components/ChatPanel/StructuredCard.tsx`
- Create: `src/components/ChatPanel/ChatInput.tsx`
- Create: `src/components/ChatPanel/ChatPanel.tsx`

- [ ] **Step 1: 实现消息气泡组件**

`src/components/ChatPanel/MessageBubble.tsx`:
```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../core/types/chat';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`mb-4 ${isUser ? 'flex flex-col items-end' : ''}`}>
      {/* Avatar + Name */}
      <div className={`flex items-center gap-2 mb-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
        <span
          className={`
            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${isUser ? 'bg-[#667] text-white' : 'bg-[#4ecdc4] text-black'}
          `}
        >
          {isUser ? 'U' : 'AI'}
        </span>
        <span className="text-gray-400 text-xs">{isUser ? '你' : '产品顾问'}</span>
      </div>

      {/* Message Content */}
      <div
        className={`
          max-w-[85%] px-3 py-2.5 text-sm leading-relaxed
          ${isUser
            ? 'bg-[#2563eb] text-white rounded-xl rounded-tl-none'
            : 'bg-[#1a1a2e] text-gray-200 rounded-xl rounded-tl-none'
          }
        `}
      >
        {message.isStreaming && !message.content ? (
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#4ecdc4] rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-[#4ecdc4] rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-[#4ecdc4] rounded-full animate-bounce [animation-delay:0.4s]" />
          </span>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 实现结构化信息卡片组件**

`src/components/ChatPanel/StructuredCard.tsx`:
```tsx
import { useState } from 'react';
import { StructuredCard as StructuredCardType } from '../../core/types/chat';

interface Props {
  card: StructuredCardType;
  onSubmit: (values: Record<string, string>) => void;
}

export function StructuredCard({ card, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(card.fields.map((f) => [f.key, f.value || '']))
  );

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <div className="bg-[#16213e] border border-[#2d2d44] rounded-lg mt-2 p-3.5 max-w-[85%]">
      <div className="text-[#4ecdc4] text-xs font-bold mb-2.5">📋 {card.title}</div>
      <div className="flex flex-col gap-2">
        {card.fields.map((field) => (
          <div key={field.key}>
            <label className="text-gray-400 text-xs block mb-0.5">{field.label}</label>
            {field.type === 'select' ? (
              <select
                className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-xs px-2.5 py-1.5 rounded"
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                disabled={card.submitted}
              >
                <option value="">请选择</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-xs px-2.5 py-1.5 rounded resize-none"
                rows={2}
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                disabled={card.submitted}
              />
            ) : (
              <input
                type={field.type}
                className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-xs px-2.5 py-1.5 rounded"
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                disabled={card.submitted}
              />
            )}
          </div>
        ))}
      </div>
      {!card.submitted && (
        <button
          onClick={handleSubmit}
          className="mt-2.5 bg-[#4ecdc4] text-black text-xs font-bold px-4 py-1.5 rounded hover:bg-[#3dbdb5] transition-colors"
        >
          提交
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 实现输入框组件**

`src/components/ChatPanel/ChatInput.tsx`:
```tsx
import { useState, KeyboardEvent } from 'react';
import { useChatStore } from '../../core/store/useChatStore';

interface Props {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: Props) {
  const [input, setInput] = useState('');
  const { isGenerating } = useChatStore();

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-[#2d2d44] bg-[#0f0f1a]">
      <div className="flex gap-2">
        <input
          className="flex-1 bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3.5 py-2.5 rounded-lg outline-none focus:border-[#4ecdc4] transition-colors"
          placeholder="描述你的想法或回答问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
        />
        <button
          onClick={handleSend}
          disabled={isGenerating || !input.trim()}
          className="bg-[#4ecdc4] text-black px-4.5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#3dbdb5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 实现 ChatPanel 容器**

`src/components/ChatPanel/ChatPanel.tsx`:
```tsx
import { useEffect, useRef } from 'react';
import { useChatStore } from '../../core/store/useChatStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { orchestrator } from '../../core/orchestrator/Orchestrator';

export function ChatPanel() {
  const { messages } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content: string) => {
    orchestrator.sendMessage(content);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1a]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg mb-2">⚡ 开始你的产品之旅</p>
            <p className="text-sm">描述你在生活中观察到的痛点，让我帮你把它变成产品方案</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
```

- [ ] **Step 5: 验证编译和页面渲染**

```bash
npm run dev
```

Expected: 左侧对话面板正常显示，可以输入文字，发送消息后看到 AI 回复（需先配置 API Key）。

- [ ] **Step 6: Commit**

```bash
git add src/components/ChatPanel/
git commit -m "feat: add ChatPanel with message bubbles, structured cards, and input"
```

---

### Task 11: UI — PRD 画布

**Files:**
- Create: `src/components/Canvas/SectionCard.tsx`
- Create: `src/components/Canvas/ProductCanvas.tsx`

- [ ] **Step 1: 实现 PRD 章节卡片组件**

`src/components/Canvas/SectionCard.tsx`:
```tsx
import { ReactNode } from 'react';

interface Props {
  title: string;
  status: 'locked' | 'active' | 'completed';
  children?: ReactNode;
}

export function SectionCard({ title, status, children }: Props) {
  return (
    <div
      className={`
        rounded-lg p-3 mb-3 transition-all
        ${status === 'active' ? 'border border-[#4ecdc4] bg-[#0f1a1a]' : ''}
        ${status === 'completed' ? 'border border-[#2d6b6b] bg-[#0f1a1a]' : ''}
        ${status === 'locked' ? 'border border-[#2d2d44] opacity-40' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-bold
            ${status === 'active' ? 'text-[#4ecdc4]' : ''}
            ${status === 'completed' ? 'text-[#4ecdc4]' : ''}
            ${status === 'locked' ? 'text-gray-500' : ''}
          `}
        >
          {title}
        </span>
        {status === 'active' && (
          <span className="bg-[#4ecdc4] text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
            进行中
          </span>
        )}
        {status === 'completed' && (
          <span className="text-[#4ecdc4] text-[10px]">✓ 已完成</span>
        )}
      </div>
      {status !== 'locked' && children}
      {status === 'locked' && (
        <p className="text-gray-600 text-xs">等待上一阶段完成...</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 实现 PRD 画布容器**

`src/components/Canvas/ProductCanvas.tsx`:
```tsx
import { usePRDStore } from '../../core/store/usePRDStore';
import { useStageStore } from '../../core/store/useStageStore';
import { Stage } from '../../core/types/stage';
import { SectionCard } from './SectionCard';
import { orchestrator } from '../../core/orchestrator/Orchestrator';

export function ProductCanvas() {
  const { prd } = usePRDStore();
  const { currentStage } = useStageStore();
  const progress = orchestrator.getProgress();

  const getSectionStatus = (stage: Stage): 'locked' | 'active' | 'completed' => {
    if (stage === currentStage) return 'active';
    const stageOrder = [
      Stage.PainPointDiscovery,
      Stage.CriticalValidation,
      Stage.UserGroupAnalysis,
      Stage.RequirementsDecomposition,
      Stage.PRDGeneration,
    ];
    const currentIdx = stageOrder.indexOf(currentStage);
    const stageIdx = stageOrder.indexOf(stage);
    return stageIdx < currentIdx ? 'completed' : 'locked';
  };

  return (
    <div className="w-[420px] flex flex-col bg-[#0a0a14] border-l border-[#2d2d44]">
      {/* Header */}
      <div className="p-3 px-4 border-b border-[#2d2d44] flex items-center justify-between">
        <span className="text-white font-bold text-sm">📄 产品方案</span>
        <span className="text-[#4ecdc4] text-xs">完成度 {Math.round(progress)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[#1a1a2e]">
        <div
          className="h-full bg-[#4ecdc4] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Section 1: Pain Points */}
        <SectionCard title="1. 痛点描述" status={getSectionStatus(Stage.PainPointDiscovery)}>
          {prd.painPoints.map((pp, i) => (
            <div key={i} className="text-gray-300 text-xs leading-relaxed mb-2">
              <p>{pp.description}</p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <span className="bg-[#1a2e2e] text-[#4ecdc4] text-[10px] px-2 py-0.5 rounded">{pp.frequency}</span>
                <span className="bg-[#1a2e2e] text-[#4ecdc4] text-[10px] px-2 py-0.5 rounded">{pp.severity}</span>
                <span className="bg-[#1a2e2e] text-[#4ecdc4] text-[10px] px-2 py-0.5 rounded">{pp.affectedPeople}</span>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Section 2: Validation */}
        <SectionCard title="2. 痛点验证" status={getSectionStatus(Stage.CriticalValidation)}>
          {prd.validation.conclusion && (
            <div className="text-gray-300 text-xs leading-relaxed">
              <p className="mb-1">{prd.validation.conclusion}</p>
              <p className="text-[#4ecdc4]">可行性评分：{prd.validation.feasibilityScore}/10</p>
              {prd.validation.existingSolutions.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400 mb-1">竞品分析：</p>
                  {prd.validation.existingSolutions.map((s, i) => (
                    <p key={i} className="text-gray-400 text-[10px] ml-2">• {s.name}：{s.weakness}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Section 3: User Groups */}
        <SectionCard title="3. 用户群体" status={getSectionStatus(Stage.UserGroupAnalysis)}>
          {prd.userGroups.targetMarket && (
            <p className="text-gray-300 text-xs mb-2">目标市场：{prd.userGroups.targetMarket}</p>
          )}
          {prd.userGroups.personas.map((p, i) => (
            <div key={i} className="bg-[#16213e] rounded p-2 mb-2">
              <p className="text-[#4ecdc4] text-xs font-bold">{p.name}</p>
              <p className="text-gray-400 text-[10px]">{p.age} · {p.occupation}</p>
              <p className="text-gray-300 text-[10px] mt-1">需求：{p.needs}</p>
              <p className="text-gray-300 text-[10px]">场景：{p.scenario}</p>
            </div>
          ))}
        </SectionCard>

        {/* Section 4: Requirements */}
        <SectionCard title="4. 需求拆解" status={getSectionStatus(Stage.RequirementsDecomposition)}>
          {prd.requirements.features.length > 0 && (
            <div className="mb-2">
              {prd.requirements.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs mb-1">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                      ${f.priority === 'P0' ? 'bg-red-900 text-red-300' : ''}
                      ${f.priority === 'P1' ? 'bg-orange-900 text-orange-300' : ''}
                      ${f.priority === 'P2' ? 'bg-blue-900 text-blue-300' : ''}
                      ${f.priority === 'P3' ? 'bg-gray-800 text-gray-400' : ''}
                    `}
                  >
                    {f.priority}
                  </span>
                  <span className="text-gray-300">{f.name}</span>
                  <span className="text-gray-500 text-[10px]">{f.complexity}</span>
                </div>
              ))}
            </div>
          )}
          {prd.requirements.mvpScope && (
            <p className="text-gray-300 text-xs">MVP：{prd.requirements.mvpScope}</p>
          )}
        </SectionCard>

        {/* Section 5: Final PRD */}
        <SectionCard title="5. 完整 PRD" status={getSectionStatus(Stage.PRDGeneration)}>
          {prd.finalPRD && (
            <div>
              <div className="text-gray-300 text-xs max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                {prd.finalPRD.slice(0, 500)}
                {prd.finalPRD.length > 500 && '...'}
              </div>
              <button
                onClick={() => {
                  const blob = new Blob([prd.finalPRD], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${prd.meta.projectName || 'product'}-prd.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="mt-2 bg-[#4ecdc4] text-black text-xs font-bold px-4 py-1.5 rounded hover:bg-[#3dbdb5] transition-colors"
              >
                下载 PRD (.md)
              </button>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 验证编译和渲染**

```bash
npm run dev
```

Expected: 右侧画布显示 5 个章节卡片，第一阶段高亮为"进行中"，其余为"等待"状态。

- [ ] **Step 4: Commit**

```bash
git add src/components/Canvas/
git commit -m "feat: add ProductCanvas with real-time PRD section rendering"
```

---

### Task 12: UI — 设置页面与主布局整合

**Files:**
- Create: `src/components/Settings/ModelConfig.tsx`
- Create: `src/components/Settings/SettingsModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 实现模型配置组件**

`src/components/Settings/ModelConfig.tsx`:
```tsx
import { useState } from 'react';
import { useConfigStore } from '../../core/store/useConfigStore';
import { ModelProvider, MODEL_OPTIONS } from '../../core/types/config';

export function ModelConfig() {
  const { modelConfig, setModelConfig, setProvider } = useConfigStore();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { getAdapter } = await import('../../core/ai');
      const adapter = getAdapter(modelConfig.provider);
      const valid = await adapter.validateKey(modelConfig.apiKey, modelConfig.model);
      setTestResult(valid ? 'success' : 'error');
    } catch {
      setTestResult('error');
    }
    setTesting(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Provider Selection */}
      <div>
        <label className="text-gray-400 text-xs block mb-1">模型提供商</label>
        <select
          className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3 py-2 rounded"
          value={modelConfig.provider}
          onChange={(e) => setProvider(e.target.value as ModelProvider)}
        >
          {(Object.entries(MODEL_OPTIONS) as [ModelProvider, typeof MODEL_OPTIONS[ModelProvider]][]).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div>
        <label className="text-gray-400 text-xs block mb-1">API Key</label>
        <input
          type="password"
          className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3 py-2 rounded"
          placeholder="输入你的 API Key"
          value={modelConfig.apiKey}
          onChange={(e) => setModelConfig({ apiKey: e.target.value })}
        />
      </div>

      {/* Model Selection */}
      <div>
        <label className="text-gray-400 text-xs block mb-1">模型</label>
        <select
          className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3 py-2 rounded"
          value={modelConfig.model}
          onChange={(e) => setModelConfig({ model: e.target.value })}
        >
          {MODEL_OPTIONS[modelConfig.provider].models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Test Button */}
      <button
        onClick={handleTestKey}
        disabled={testing || !modelConfig.apiKey}
        className="bg-[#2d2d44] text-gray-200 text-sm px-4 py-2 rounded hover:bg-[#3d3d54] transition-colors disabled:opacity-40"
      >
        {testing ? '验证中...' : '验证 API Key'}
      </button>
      {testResult === 'success' && <p className="text-green-400 text-xs">✓ Key 验证成功</p>}
      {testResult === 'error' && <p className="text-red-400 text-xs">✗ Key 验证失败，请检查</p>}
    </div>
  );
}
```

- [ ] **Step 2: 实现设置模态框**

`src/components/Settings/SettingsModal.tsx`:
```tsx
import { ModelConfig } from './ModelConfig';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto border border-[#2d2d44]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-lg font-bold">⚙ 设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
        </div>
        <ModelConfig />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 整合所有组件到 App.tsx**

`src/App.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { StageIndicator } from './components/StageIndicator';
import { ChatPanel } from './components/ChatPanel/ChatPanel';
import { ProductCanvas } from './components/Canvas/ProductCanvas';
import { SettingsModal } from './components/Settings/SettingsModal';
import { useConfigStore } from './core/store/useConfigStore';
import { useChatStore } from './core/store/useChatStore';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { modelConfig } = useConfigStore();
  const { messages } = useChatStore();

  // Show settings modal on first visit if no API key configured
  useEffect(() => {
    if (!modelConfig.apiKey && messages.length === 0) {
      setSettingsOpen(true);
    }
  }, []);

  return (
    <div className="h-screen bg-[#0a0a14] text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-[#1a1a2e] border-b border-[#2d2d44] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">⚡ ProductForge</span>
          <span className="text-gray-500 text-xs">|</span>
          <span className="text-gray-400 text-xs">AI 产品开发顾问</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#4ecdc4] text-xs">● 已保存</span>
          <button
            className="bg-[#2d2d44] text-gray-200 text-xs px-3 py-1.5 rounded hover:bg-[#3d3d54] transition-colors"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙ 设置
          </button>
        </div>
      </header>

      {/* Stage Progress */}
      <StageIndicator />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <ChatPanel />
        <ProductCanvas />
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
```

- [ ] **Step 4: 验证完整功能**

```bash
npm run dev
```

Expected:
1. 首次打开自动弹出设置页面，配置 API Key
2. 关闭设置后看到完整的双栏布局
3. 输入消息后能看到 AI 流式回复
4. 右侧画布随对话更新

- [ ] **Step 5: Commit**

```bash
git add src/components/Settings/ src/App.tsx
git commit -m "feat: add settings modal, model config, and integrate all components"
```

---

### Task 13: 欢迎消息与 PRD 导出工具

**Files:**
- Create: `src/utils/export.ts`
- Modify: `src/App.tsx`（添加欢迎消息逻辑和导出按钮）

- [ ] **Step 1: 实现 PRD 导出工具**

`src/utils/export.ts`:
```typescript
import { PRDData } from '../core/types/prd';

export function exportPRD(prd: PRDData): void {
  const content = prd.finalPRD || generateMarkdownPRD(prd);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${prd.meta.projectName || 'product'}-prd.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyPRDToClipboard(prd: PRDData): void {
  const content = prd.finalPRD || generateMarkdownPRD(prd);
  navigator.clipboard.writeText(content);
}

function generateMarkdownPRD(prd: PRDData): string {
  const lines: string[] = [];

  lines.push(`# ${prd.meta.projectName || '未命名产品'} - 产品需求文档 (PRD)\n`);
  lines.push(`> 生成时间：${new Date(prd.meta.updatedAt).toLocaleDateString()}`);
  lines.push(`> 使用模型：${prd.meta.model || 'N/A'}\n`);

  // Section 1: Overview
  lines.push('## 1. 项目概述\n');
  if (prd.painPoints.length > 0) {
    lines.push(`**解决的问题：** ${prd.painPoints[0].description}\n`);
  }

  // Section 2: Pain Points
  lines.push('## 2. 痛点与背景\n');
  prd.painPoints.forEach((pp, i) => {
    lines.push(`### 痛点 ${i + 1}`);
    lines.push(`- **描述：** ${pp.description}`);
    lines.push(`- **频率：** ${pp.frequency}`);
    lines.push(`- **严重度：** ${pp.severity}`);
    lines.push(`- **影响人群：** ${pp.affectedPeople}`);
    lines.push(`- **场景：** ${pp.scene}`);
    if (pp.currentSolutions.length > 0) {
      lines.push(`- **现有方案：** ${pp.currentSolutions.join('、')}`);
    }
    lines.push('');
  });

  // Section 3: Validation
  lines.push('## 3. 痛点验证\n');
  if (prd.validation.conclusion) {
    lines.push(`**结论：** ${prd.validation.conclusion}\n`);
    lines.push(`**可行性评分：** ${prd.validation.feasibilityScore}/10\n`);
    if (prd.validation.existingSolutions.length > 0) {
      lines.push('**竞品分析：**\n');
      lines.push('| 方案 | 缺陷 |');
      lines.push('|------|------|');
      prd.validation.existingSolutions.forEach((s) => {
        lines.push(`| ${s.name} | ${s.weakness} |`);
      });
      lines.push('');
    }
    lines.push(`**市场空白：** ${prd.validation.marketGap}\n`);
  }

  // Section 4: User Groups
  lines.push('## 4. 目标用户\n');
  if (prd.userGroups.targetMarket) {
    lines.push(`**目标市场：** ${prd.userGroups.targetMarket}\n`);
  }
  prd.userGroups.personas.forEach((p, i) => {
    lines.push(`### 用户画像 ${i + 1}：${p.name}`);
    lines.push(`- **年龄：** ${p.age}`);
    lines.push(`- **职业：** ${p.occupation}`);
    lines.push(`- **核心需求：** ${p.needs}`);
    lines.push(`- **使用场景：** ${p.scenario}`);
    lines.push(`- **付费意愿：** ${p.willingnessToPay}`);
    lines.push('');
  });

  // Section 5: Requirements
  lines.push('## 5. 功能需求\n');
  const priorityGroups = ['P0', 'P1', 'P2', 'P3'] as const;
  const priorityLabels: Record<string, string> = { P0: 'MVP 核心功能', P1: '重要功能', P2: '锦上添花', P3: '未来考虑' };
  priorityGroups.forEach((p) => {
    const features = prd.requirements.features.filter((f) => f.priority === p);
    if (features.length > 0) {
      lines.push(`### ${p} - ${priorityLabels[p]}\n`);
      features.forEach((f) => {
        lines.push(`- **${f.name}**（复杂度：${f.complexity}）：${f.description}`);
        lines.push(`  - 解决痛点：${f.solvesPainPoint}`);
      });
      lines.push('');
    }
  });

  if (prd.requirements.mvpScope) {
    lines.push(`### MVP 范围\n`);
    lines.push(`${prd.requirements.mvpScope}\n`);
  }

  if (prd.requirements.userStories.length > 0) {
    lines.push('### 用户故事\n');
    prd.requirements.userStories.forEach((s) => lines.push(`- ${s}`));
    lines.push('');
  }

  lines.push('---\n');
  lines.push(`> 由 ProductForge AI 产品顾问生成`);
  lines.push(`> 生成时间：${new Date().toISOString().split('T')[0]}`);
  lines.push(`> 使用模型：${prd.meta.model || 'N/A'}`);

  return lines.join('\n');
}
```

- [ ] **Step 2: 在 App.tsx 添加导出按钮和欢迎消息**

在 App.tsx 的 header 中添加导出按钮，并在 ChatPanel 中注入初始欢迎消息：

更新 `src/components/ChatPanel/ChatPanel.tsx`，在组件挂载时检查是否有消息，若无则注入欢迎消息：

```tsx
import { useEffect, useRef } from 'react';
import { useChatStore } from '../../core/store/useChatStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { orchestrator } from '../../core/orchestrator/Orchestrator';
import { Message } from '../../core/types/chat';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `你好！我是你的产品顾问。

请告诉我你在日常生活中观察到了什么让你觉得不方便、不合理、或者"为什么没人解决这个问题"的事情？

不需要是成熟的想法，一个模糊的感受就可以。我们一起来看看它值不值得做成产品。`,
  timestamp: Date.now(),
};

export function ChatPanel() {
  const { messages, addMessage } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      addMessage(WELCOME_MESSAGE);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content: string) => {
    orchestrator.sendMessage(content);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1a]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
```

更新 `src/App.tsx`，在顶部 import 中添加 `usePRDStore` 和 `exportPRD`，在 header 区域添加导出按钮：

```tsx
import { useState, useEffect } from 'react';
import { StageIndicator } from './components/StageIndicator';
import { ChatPanel } from './components/ChatPanel/ChatPanel';
import { ProductCanvas } from './components/Canvas/ProductCanvas';
import { SettingsModal } from './components/Settings/SettingsModal';
import { useConfigStore } from './core/store/useConfigStore';
import { usePRDStore } from './core/store/usePRDStore';
import { exportPRD } from './utils/export';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { modelConfig } = useConfigStore();
  const { messages } = useChatStore();

  useEffect(() => {
    if (!modelConfig.apiKey && messages.length === 0) {
      setSettingsOpen(true);
    }
  }, []);

  return (
    <div className="h-screen bg-[#0a0a14] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-5 py-2.5 bg-[#1a1a2e] border-b border-[#2d2d44] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">⚡ ProductForge</span>
          <span className="text-gray-500 text-xs">|</span>
          <span className="text-gray-400 text-xs">AI 产品开发顾问</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#4ecdc4] text-xs">● 已保存</span>
          <button
            className="bg-[#2d2d44] text-gray-200 text-xs px-3 py-1.5 rounded hover:bg-[#3d3d54] transition-colors"
            onClick={() => exportPRD(usePRDStore.getState().prd)}
          >
            导出 PRD
          </button>
          <button
            className="bg-[#2d2d44] text-gray-200 text-xs px-3 py-1.5 rounded hover:bg-[#3d3d54] transition-colors"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙ 设置
          </button>
        </div>
      </header>

      <StageIndicator />

      <main className="flex-1 flex overflow-hidden">
        <ChatPanel />
        <ProductCanvas />
      </main>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
```

- [ ] **Step 3: 验证编译和功能**

```bash
npm run dev
```

Expected:
1. 打开页面自动显示欢迎消息
2. 点击"导出 PRD"按钮可下载 Markdown 文件

- [ ] **Step 4: Commit**

```bash
git add src/utils/export.ts src/components/ChatPanel/ChatPanel.tsx src/App.tsx
git commit -m "feat: add welcome message, PRD export to Markdown, and export button"
```

---

### Task 14: 最终集成测试与收尾

- [ ] **Step 1: 完整 TypeScript 编译检查**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 2: 构建生产版本**

```bash
npm run build
```

Expected: 构建成功，无错误。

- [ ] **Step 3: 端到端手动测试**

启动开发服务器，按以下流程测试：

1. 打开页面 → 自动弹出设置（如未配置 Key）
2. 选择模型、输入 API Key、验证
3. 看到欢迎消息
4. 输入一个痛点（如"小区快递柜经常爆满"）
5. 观察 AI 回复 + 结构化信息采集卡片
6. 填写并提交信息采集
7. 继续对话，观察阶段推进
8. 右侧画布实时更新
9. 完成所有 5 个阶段
10. 导出 PRD 文件

- [ ] **Step 4: 修复发现的问题并提交**

```bash
git add -A
git commit -m "fix: resolve integration issues from end-to-end testing"
```

- [ ] **Step 5: 最终 Commit**

```bash
git add -A
git commit -m "feat: ProductForge MVP complete - AI product development advisor"
```
