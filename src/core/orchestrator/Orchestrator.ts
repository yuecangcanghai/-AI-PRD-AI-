import { PromptBuilder } from './PromptBuilder';
import { Extractor } from './Extractor';
import { StageController } from './StageController';
import { getAdapter } from '../ai';
import { useChatStore } from '../store/useChatStore';
import { usePRDStore } from '../store/usePRDStore';
import { useConfigStore } from '../store/useConfigStore';
import { useStageStore, MAX_TURNS_PER_STAGE } from '../store/useStageStore';
import { ChatMessage } from '../ai/ModelAdapter';
import { Message, StructuredCard } from '../types/chat';
import { Stage, STAGE_ORDER } from '../types/stage';
import { PRDData } from '../types/prd';

export class Orchestrator {
  private promptBuilder = new PromptBuilder();
  private extractor = new Extractor();
  private stageController = new StageController();
  private abortController: AbortController | null = null;

  // Resolves the effective model name and endpoint for the current provider.
  // For 'custom' provider, uses customModel/customEndpoint; for others, uses the standard config.
  private resolveModel(): { model: string; endpoint?: string } {
    const cfg = useConfigStore.getState().modelConfig;
    if (cfg.provider === 'custom') {
      return { model: cfg.customModel || cfg.model, endpoint: cfg.customEndpoint || undefined };
    }
    return { model: cfg.model };
  }

  // Sends a user message and requests an assistant reply. `isCardSubmission` distinguishes
  // card-answer messages (which continue the current turn) from fresh user turns.
  async sendMessage(userContent: string, isCardSubmission = false): Promise<void> {
    const chatStore = useChatStore.getState();
    const configStore = useConfigStore.getState();
    const prdStore = usePRDStore.getState();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
    };
    chatStore.addMessage(userMessage);

    const stageState = useStageStore.getState();
    // Fresh user input starts a new turn; card answers continue the same turn.
    const upcomingTurn = stageState.turnsAtStage + (isCardSubmission ? 0 : 1);
    const isLastAllowedTurn = upcomingTurn >= MAX_TURNS_PER_STAGE;
    const systemPrompt = isLastAllowedTurn
      ? this.promptBuilder.buildTurnLimitNudge(stageState.currentStage, prdStore.prd, {
          language: configStore.modelConfig.language,
          askMode: configStore.modelConfig.askMode,
        })
      : this.promptBuilder.build(stageState.currentStage, prdStore.prd, {
          language: configStore.modelConfig.language,
          askMode: configStore.modelConfig.askMode,
        });

    // Read the history from the LIVE store, not from the `chatStore` snapshot captured
    // above. zustand's set() replaces the state object, so the snapshot still holds the
    // pre-addMessage array — using it would silently drop the user's newest message from
    // the request, and the model would repeat the question it just asked.
    const messages: ChatMessage[] = useChatStore
      .getState()
      .messages.filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

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
    const { model: effectiveModel, endpoint: effectiveEndpoint } = this.resolveModel();

    this.abortController = getAdapter(configStore.modelConfig.provider).chat({
      messages,
      systemPrompt,
      model: effectiveModel,
      temperature: configStore.modelConfig.temperature,
      maxTokens: configStore.modelConfig.maxTokens,
      apiKey: configStore.modelConfig.apiKey,
      endpoint: effectiveEndpoint,
      onChunk: (chunk: string) => {
        fullResponse += chunk;
        const { cleanText } = this.extractor.extract(fullResponse);
        chatStore.updateLastAssistantMessage(cleanText);
      },
      onDone: () => {
        chatStore.setStreaming(false);
        const { cleanText, extracted } = this.extractor.extract(fullResponse);
        chatStore.updateLastAssistantMessage(cleanText);

        const card = this.extractor.extractCard(fullResponse);
        if (card) {
          chatStore.setLastAssistantCard(card);
        }

        if (extracted.length > 0) {
          this.extractor.applyToStore(extracted);
        }

        // Count this assistant response as one turn, but only for fresh user inputs
        // (card submissions continue the current turn and do not consume a new slot).
        const latestPrd = usePRDStore.getState().prd;
        if (!isCardSubmission) {
          useStageStore.getState().incrementTurn();
        }
        const newTurnCount = useStageStore.getState().turnsAtStage;

        // Try natural advance first; if it fails AND we have hit the turn ceiling,
        // force advance so we never stall on a single stage for more than MAX_TURNS.
        const advanced = this.stageController.tryAdvance(latestPrd);
        if (!advanced && newTurnCount >= MAX_TURNS_PER_STAGE) {
          this.stageController.tryAdvance(latestPrd, { force: true });
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

  abort(): void {
    this.abortController?.abort();
    this.abortController = null;
    useChatStore.getState().setStreaming(false);
  }

  // Called when the user submits an interactive form card (efficient mode).
  // Combines all field answers into a single formatted user message.
  submitCard(messageId: string, card: StructuredCard, values: Record<string, string>): void {
    useChatStore.getState().markCardSubmitted(messageId);
    const lines = card.fields.map((f) => `- ${f.label}：${values[f.key]?.trim() || '（未填写）'}`);
    const content = `【${card.title}】\n${lines.join('\n')}`;
    this.sendMessage(content, /* isCardSubmission */ true);
  }

  // Starts the lightweight newbie guide flow: adds a friendly welcome message and
  // sets the guide to step 1. Idempotent (safe to call multiple times).
  startNewbieGuide(): void {
    const chatStore = useChatStore.getState();
    if (chatStore.newbieGuide.step > 0) return; // already started or done
    if (chatStore.messages.length === 0) {
      const welcome: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          '👋 嗨！别紧张，我们来随便聊聊。\n\n' +
          '我会问你几个简单的问题，帮你把脑子里那个模糊的想法理清楚。' +
          '不需要任何产品经验，像聊天一样就行。',
        timestamp: Date.now(),
      };
      chatStore.addMessage(welcome);
    }
    chatStore.startNewbieGuide();
  }

  // Triggers the product-brief onboarding flow: shows the brief card and inserts a
  // short welcome message so the user knows what to do. Idempotent.
  startOnboarding(): void {
    const chatStore = useChatStore.getState();
    if (useChatStore.getState().onboardingCard) return;
    if (chatStore.messages.length === 0) {
      const welcome: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '👋 欢迎！在开始产品设计前，请先填写下方「产品设定」表单，我会基于这些信息帮你快速启动。',
        timestamp: Date.now(),
      };
      chatStore.addMessage(welcome);
    }
    chatStore.showOnboardingCard();
  }

  private _completingNewbieGuide = false;

  // Called when the newbie guide flow finishes: maps answers to onboarding fields
  // and auto-submits the product brief (skipping the manual onboarding card).
  // Triple-guard against re-entry: instance flag + oneLiner check + try-catch.
  async completeNewbieGuide(): Promise<void> {
    // Guard 1: Instance-level flag — prevents ANY re-entry within this page session.
    if (this._completingNewbieGuide) {
      console.log('[completeNewbieGuide] Already running, skipping re-entry');
      return;
    }
    this._completingNewbieGuide = true;

    console.log('[completeNewbieGuide] Start');
    const chatStore = useChatStore.getState();
    const prdStore = usePRDStore.getState();
    const a = chatStore.newbieGuide.answers;

    // Guard 2: If oneLiner already set (e.g. page refresh re-triggered subscribe), skip.
    if (prdStore.prd.meta.oneLiner) {
      console.log('[completeNewbieGuide] Already processed (oneLiner exists), skipping');
      return;
    }

    // CRITICAL: Set oneLiner IMMEDIATELY as a re-entry marker. This must happen
    // BEFORE any addMessage() calls, because each addMessage triggers the zustand
    // subscriber which could otherwise re-enter this function.
    prdStore.updateMeta({
      oneLiner: (a.whatToBuild || '').trim(),
      projectName: '新产品',
      painDepthHint: a.painDepth || '',
    });

    try {
      // Map guide answers → onboarding fields.
      const values: Record<string, string> = {
        projectName: '新产品',
        oneLiner: a.whatToBuild || '',
        targetUser: a.whoNeedsIt || '',
        initialScene: a.whatSituation || '',
        targetMarket: '',
        productForm: '',
        coreProblem: '',
        constraints: a.currentSolution || '',
      };

      // Add a personalized transition message summarizing what the user told us.
      const summaryLines: string[] = [];
      if (a.whatToBuild) summaryLines.push(`💡 你想做：**${a.whatToBuild}**`);
      if (a.whoNeedsIt) summaryLines.push(`👤 最需要的人：**${a.whoNeedsIt}**`);
      if (a.whatSituation) summaryLines.push(`🎬 典型场景：**${a.whatSituation}**`);
      if (a.painDepth) summaryLines.push(`🔍 痛点判断：**${a.painDepth}**`);

      const summary = summaryLines.length > 0
        ? `\n\n你的想法概览：\n${summaryLines.join('\n')}`
        : '';

      chatStore.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `🎉 很好！你的想法已经有了初步轮廓。${summary}\n\n接下来我会基于这些信息，帮你深入挖掘真正的痛点。`,
        timestamp: Date.now(),
      });

      // Reuse the existing submitOnboarding flow (writes meta, streams AI review).
      console.log('[completeNewbieGuide] Calling submitOnboarding');
      await this.submitOnboarding(values);
      console.log('[completeNewbieGuide] Done');
    } catch (err) {
      // Graceful degradation: never let an unhandled rejection crash the app.
      console.error('[completeNewbieGuide] Unexpected error:', err);
      chatStore.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ 处理你的回答时出了点小问题，但你的答案已经保存了。请检查一下 API Key 设置，然后刷新页面试试。',
        timestamp: Date.now(),
      });
    }
  }

  // Submits the product-brief onboarding card: writes values into prd.meta, hides the
  // card, then asks the LLM for a one-shot positioning review + 3 pain-point hypotheses.
  async submitOnboarding(values: Record<string, string>): Promise<void> {
    const chatStore = useChatStore.getState();
    const configStore = useConfigStore.getState();
    const prdStore = usePRDStore.getState();

    // 1. Persist the brief into prd.meta.
    prdStore.updateMeta({
      projectName: (values.projectName || '').trim(),
      oneLiner: (values.oneLiner || '').trim(),
      targetMarket: (values.targetMarket || '') as PRDData['meta']['targetMarket'],
      productForm: (values.productForm || '') as PRDData['meta']['productForm'],
      coreProblem: (values.coreProblem || '') as PRDData['meta']['coreProblem'],
      constraints: (values.constraints || '') as PRDData['meta']['constraints'],
      // V-model required: "whose problem, in what scene"
      targetUser: (values.targetUser || '').trim(),
      initialScene: (values.initialScene || '').trim(),
    });

    // 2. Dismiss the onboarding card UI.
    chatStore.dismissOnboardingCard();

    // 3. Add a user message echoing the submitted brief (so the conversation is self-contained).
    const briefLines = [
      `【产品设定】`,
      `- 产品名称：${values.projectName || '（未填写）'}`,
      `- 一句话定位：${values.oneLiner || '（未填写）'}`,
      `- 为谁解决：${values.targetUser || '（未填写）'}`,
      `- 发生在什么场景：${values.initialScene || '（未填写）'}`,
      `- 目标市场：${values.targetMarket || '（未填写）'}`,
      `- 产品形态：${values.productForm || '（未填写）'}`,
      `- 核心问题类型：${values.coreProblem || '（未填写）'}`,
      `- 主要约束：${values.constraints || '（未填写）'}`,
    ].join('\n');
    chatStore.addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: briefLines,
      timestamp: Date.now(),
    });

    // 4. API Key guard: if missing, show a friendly prompt instead of hanging on a failed fetch.
    if (!configStore.modelConfig.apiKey) {
      console.log('[submitOnboarding] No API key, showing prompt');
      chatStore.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ 你的想法已经保存好了！不过我需要一个 API Key 才能帮你深入分析。请点击右上角 ⚙️ 设置，填入你的 API Key 后刷新页面即可继续。',
        timestamp: Date.now(),
      });
      return;
    }

    // 5. Prepare assistant placeholder and stream the positioning review.
    console.log('[submitOnboarding] Starting API stream');
    chatStore.addMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    });
    chatStore.setStreaming(true);

    const latestPrd = usePRDStore.getState().prd;
    const systemPrompt = this.promptBuilder.buildBriefingReview(
      latestPrd,
      configStore.modelConfig.language,
    );
    // Live read, for the same reason as in sendMessage: the snapshot above predates the
    // 【产品设定】message, which is exactly the content this request is supposed to review.
    const messages: ChatMessage[] = useChatStore
      .getState()
      .messages.filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    let fullResponse = '';
    const { model: effModel, endpoint: effEndpoint } = this.resolveModel();
    this.abortController = getAdapter(configStore.modelConfig.provider).chat({
      messages,
      systemPrompt,
      model: effModel,
      temperature: configStore.modelConfig.temperature,
      maxTokens: configStore.modelConfig.maxTokens,
      apiKey: configStore.modelConfig.apiKey,
      endpoint: effEndpoint,
      onChunk: (chunk: string) => {
        fullResponse += chunk;
        const { cleanText } = this.extractor.extract(fullResponse);
        chatStore.updateLastAssistantMessage(cleanText);
      },
      onDone: () => {
        chatStore.setStreaming(false);
        const { cleanText } = this.extractor.extract(fullResponse);
        chatStore.updateLastAssistantMessage(cleanText);
        this.abortController = null;
      },
      onError: (error: Error) => {
        chatStore.setStreaming(false);
        chatStore.updateLastAssistantMessage(
          `⚠️ 出错了：${error.message}。请检查你的 API Key 和网络连接。`,
        );
        this.abortController = null;
      },
    });
  }

  // Auto-cascade regeneration: after an upstream section is edited, sequentially
  // clear and regenerate every downstream stage's structured data via silent AI calls.
  async regenerateDownstream(fromStage: Stage): Promise<void> {
    const chatStore = useChatStore.getState();
    const configStore = useConfigStore.getState();
    const fromIdx = STAGE_ORDER.indexOf(fromStage);
    if (fromIdx < 0) return;
    const downstream = STAGE_ORDER.slice(fromIdx + 1);
    if (downstream.length === 0) return;

    const note: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '⚙️ 检测到上游内容被修改，正在重新生成下游内容……',
      timestamp: Date.now(),
    };
    chatStore.addMessage(note);
    chatStore.setStreaming(true);

    try {
      for (const stage of downstream) {
        this.clearStageData(stage);
        const latestPrd = usePRDStore.getState().prd;
        const systemPrompt = this.promptBuilder.buildRegeneration(
          stage,
          latestPrd,
          configStore.modelConfig.language,
        );
        const full = await this.runSilent(systemPrompt, [
          { role: 'user', content: '请基于最新上下文重新生成本阶段的结构化结论。' },
        ]);
        const { extracted } = this.extractor.extract(full);
        if (extracted.length > 0) {
          this.extractor.applyToStore(extracted);
        }
      }
      chatStore.updateLastAssistantMessage('✅ 下游内容已根据修改重新生成完成。');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      chatStore.updateLastAssistantMessage(`⚠️ 重新生成中断或出错：${msg}`);
    } finally {
      chatStore.setStreaming(false);
      this.abortController = null;
    }
  }

  private clearStageData(stage: Stage): void {
    const prdStore = usePRDStore.getState();
    switch (stage) {
      case Stage.CriticalValidation:
        prdStore.clearValidation();
        break;
      case Stage.FieldResearch:
        prdStore.clearSceneSurveys();
        break;
      case Stage.UserGroupAnalysis:
        prdStore.clearUserGroups();
        break;
      case Stage.RequirementsDecomposition:
        prdStore.clearRequirements();
        break;
      case Stage.SolutionMirror:
        prdStore.clearMirrorReview();
        break;
      case Stage.PRDGeneration:
        prdStore.clearFinalPRD();
        break;
      default:
        break;
    }
  }

  private runSilent(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
    const configStore = useConfigStore.getState();
    const { model: silentModel, endpoint: silentEndpoint } = this.resolveModel();
    return new Promise((resolve, reject) => {
      let full = '';
      this.abortController = getAdapter(configStore.modelConfig.provider).chat({
        messages,
        systemPrompt,
        model: silentModel,
        temperature: configStore.modelConfig.temperature,
        maxTokens: configStore.modelConfig.maxTokens,
        apiKey: configStore.modelConfig.apiKey,
        endpoint: silentEndpoint,
        onChunk: (chunk: string) => {
          full += chunk;
        },
        onDone: () => resolve(full),
        onError: (error: Error) => reject(error),
      });
    });
  }

  getProgress(): number {
    return this.stageController.getProgress(usePRDStore.getState().prd);
  }
}

export const orchestrator = new Orchestrator();
