import { useState } from 'react';
import { useChatStore } from '../../core/store/useChatStore';
import { orchestrator } from '../../core/orchestrator/Orchestrator';

// ── Question definitions ─────────────────────────────────────────────
interface GuideQuestion {
  question: string;
  hint: string;
  type: 'text' | 'options';
  options?: string[];
}

const QUESTIONS: GuideQuestion[] = [
  {
    question: '你想做一个什么东西？',
    hint: '用最简单的话描述一下就行，比如「一个能帮我记住每天该做什么事的工具」',
    type: 'text',
  },
  {
    question: '谁会最需要它？',
    hint: '想想身边谁经常为此发愁——是每天忙得团转的朋友，还是总忘事的家人？',
    type: 'options',
    options: ['学生', '上班族', '家长', '老板 / 创业者', '其他（可以补充）'],
  },
  {
    question: '他们通常在什么情况下最需要？',
    hint: '闭上眼睛想一个真实画面：上一次看到有人为此发愁是什么时候？在哪里？',
    type: 'options',
    options: ['上学 / 上班路上', '在办公室', '在家里', '逛街 / 出门时', '其他（可以补充）'],
  },
  {
    question: '现在他们是怎么解决这个问题的？',
    hint: '大多数人的真实状态：要么忍着，要么用土办法凑合——现在是什么情况？',
    type: 'options',
    options: ['忍着不管', '用手机备忘录 / 笔记', '找别人帮忙', '用 Excel / 表格', '其他（可以补充）'],
  },
  {
    question: '你觉得这是表层痛点还是深层痛点？',
    hint: '福特说“如果我问人们想要什么，他们会说一匹更快的马”——“快马”是表面症状，“想更快见到亲人”才是真正的需求',
    type: 'options',
    options: [
      '表层痛点（症状，比如“我想要更快的马”）',
      '深层痛点（根因，比如“我想更快到达”）',
      '不确定',
    ],
  },
];

// ── Shared styles ────────────────────────────────────────────────────
const optionBtnCls =
  'w-full text-left text-xs text-gray-200 bg-[#1a1a2e] border border-[#2d2d44] px-3 py-2.5 rounded-lg hover:border-[#4ecdc4] hover:bg-[#1a2e2e] transition-all cursor-pointer';
const inputCls =
  'w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-[#4ecdc4] transition-colors';

// ── Component ────────────────────────────────────────────────────────
export function NewbieGuideFlow() {
  const { newbieGuide, answerNewbieGuide, skipNewbieGuide, addMessage } = useChatStore();
  const [textValue, setTextValue] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const step = newbieGuide.step; // 1–5 = active, 6 = done
  const question = step >= 1 && step <= 5 ? QUESTIONS[step - 1] : null;
  const progress = Math.min(((step - 1) / 5) * 100, 100);

  // ── Handlers ───────────────────────────────────────────────────────
  // After each answer, insert a short reaction into the chat to create a
  // conversational feel — the guide becomes a dialogue, not a form.
  const FEEDBACK: Record<number, string> = {
    1: '好的，记住了 👍 接下来我想了解——谁最需要它？',
    2: '这个人群很有代表性 🎯 让我们想一个真实画面……',
    3: '很好的场景描述！那在现实中，他们是怎么解决这个问题的？',
    4: '现有方案往往就是产品灵感的起点 💡 最后一个问题——也是最关键的……',
  };

  const addFeedback = (step: number) => {
    const text = FEEDBACK[step];
    if (!text) return;
    addMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
    });
  };

  const handleTextSubmit = () => {
    const val = textValue.trim();
    if (!val) return;
    answerNewbieGuide(val);
    addFeedback(newbieGuide.step);
    setTextValue('');
  };

  const handleOptionClick = (option: string) => {
    if (option === '其他（可以补充）') {
      setShowCustom(true);
      return;
    }
    answerNewbieGuide(option);
    addFeedback(newbieGuide.step);
  };

  const handleCustomSubmit = () => {
    const val = customValue.trim();
    if (!val) return;
    answerNewbieGuide(val);
    addFeedback(newbieGuide.step);
    setCustomValue('');
    setShowCustom(false);
  };

  const handleSkip = () => {
    skipNewbieGuide();
    orchestrator.startOnboarding();
  };

  // Completion is handled by zustand subscribe in storeSubscribers.ts (not here).

  if (!question) return null; // step 0 or done

  return (
    <div className="mx-4 my-3 border border-[#4ecdc4]/30 bg-gradient-to-br from-[#101028] to-[#0a0a14] rounded-lg p-4 shadow-lg shadow-[#4ecdc4]/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-sm font-bold">💡 帮你理清思路</h3>
        <button
          onClick={handleSkip}
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          跳过 →
        </button>
      </div>
      <p className="text-gray-400 text-[11px] mb-3">
        不用想太多，像聊天一样回答几个简单问题就好。
      </p>

      {/* Progress bar */}
      <div className="h-1 bg-[#1a1a2e] rounded mb-3 overflow-hidden">
        <div
          className="h-full bg-[#4ecdc4] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-500 mb-3">
        第 {step} / 5 个问题
      </p>

      {/* Question */}
      <div className="mb-3">
        <p className="text-white text-sm font-bold mb-1">{question.question}</p>
        <p className="text-gray-500 text-[10px]">{question.hint}</p>
      </div>

      {/* Answer area */}
      {question.type === 'text' ? (
        <div className="flex gap-2">
          <textarea
            className={`${inputCls} resize-none flex-1`}
            rows={2}
            placeholder="随便写写你的想法……"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTextSubmit();
              }
            }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textValue.trim()}
            className={`self-end text-xs font-bold px-4 py-2 rounded-lg transition-colors
              ${textValue.trim()
                ? 'bg-[#4ecdc4] text-black hover:bg-[#3dbdb5]'
                : 'bg-[#2d2d44] text-gray-500 cursor-not-allowed'}`}
          >
            下一步 →
          </button>
        </div>
      ) : showCustom ? (
        <div className="flex gap-2">
          <input
            className={`${inputCls} flex-1`}
            placeholder="输入你的答案……"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomSubmit();
            }}
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customValue.trim()}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors
              ${customValue.trim()
                ? 'bg-[#4ecdc4] text-black hover:bg-[#3dbdb5]'
                : 'bg-[#2d2d44] text-gray-500 cursor-not-allowed'}`}
          >
            确定
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {question.options!.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionClick(opt)}
              className={optionBtnCls}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
