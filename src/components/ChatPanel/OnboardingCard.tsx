import { useState } from 'react';
import { orchestrator } from '../../core/orchestrator/Orchestrator';
import {
  ONBOARDING_TARGET_MARKETS,
  ONBOARDING_PRODUCT_FORMS,
  ONBOARDING_CORE_PROBLEMS,
  ONBOARDING_CONSTRAINTS,
} from '../../core/types/prd';

const inputCls =
  'w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-xs px-2.5 py-1.5 rounded outline-none focus:border-[#4ecdc4] transition-colors';
const labelCls = 'text-gray-400 text-[11px] block mb-1 font-medium';
const selectBadgeCls =
  'inline-block text-[9px] uppercase tracking-wider text-[#4ecdc4] bg-[#1a2e2e] px-1.5 py-0.5 rounded ml-1.5 font-bold';

export function OnboardingCard() {
  const [projectName, setProjectName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [productForm, setProductForm] = useState('');
  const [coreProblem, setCoreProblem] = useState('');
  const [constraints, setConstraints] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = projectName.trim().length > 0 && oneLiner.trim().length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await orchestrator.submitOnboarding({
        projectName,
        oneLiner,
        targetMarket,
        productForm,
        coreProblem,
        constraints,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-4 my-3 border border-[#4ecdc4]/40 bg-gradient-to-br from-[#101028] to-[#0a0a14] rounded-lg p-4 shadow-lg shadow-[#4ecdc4]/5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white text-sm font-bold">🚀 产品设定</h3>
        <span className="text-[10px] text-gray-500">完成设定后自动进入痛点挖掘</span>
      </div>
      <p className="text-gray-400 text-[11px] mb-3">
        先告诉我你要做什么，我会基于这些信息为你生成定位初评与 3 个值得验证的痛点假设。
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls}>
            产品名称 <span className="text-[#4ecdc4]">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="例：ProductForge"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>
            一句话定位 <span className="text-[#4ecdc4]">*</span>
          </label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            placeholder="例：面向独立开发者的 AI 产品顾问，帮助从 0 到 1 输出 PRD"
            value={oneLiner}
            onChange={(e) => setOneLiner(e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>
            目标市场 <span className={selectBadgeCls}>选择</span>
          </label>
          <select className={inputCls} value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)}>
            <option value="">请选择（可留空，稍后讨论）</option>
            {ONBOARDING_TARGET_MARKETS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>
            产品形态 <span className={selectBadgeCls}>选择</span>
          </label>
          <select className={inputCls} value={productForm} onChange={(e) => setProductForm(e.target.value)}>
            <option value="">请选择（可留空，稍后讨论）</option>
            {ONBOARDING_PRODUCT_FORMS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>
            核心问题类型 <span className={selectBadgeCls}>选择</span>
          </label>
          <select className={inputCls} value={coreProblem} onChange={(e) => setCoreProblem(e.target.value)}>
            <option value="">请选择（可留空，稍后讨论）</option>
            {ONBOARDING_CORE_PROBLEMS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>
            主要约束 <span className={selectBadgeCls}>选择</span>
          </label>
          <select className={inputCls} value={constraints} onChange={(e) => setConstraints(e.target.value)}>
            <option value="">请选择（可留空，稍后讨论）</option>
            {ONBOARDING_CONSTRAINTS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-gray-500 text-[10px]">
          {!canSubmit && !submitting && '请填写产品名称与一句话定位'}
          {submitting && '正在生成定位初评…'}
        </p>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className={`text-xs font-bold px-4 py-1.5 rounded transition-colors
            ${canSubmit
              ? 'bg-[#4ecdc4] text-black hover:bg-[#3dbdb5]'
              : 'bg-[#2d2d44] text-gray-500 cursor-not-allowed'}`}
        >
          {submitting ? '生成中…' : '提交并生成定位初评 →'}
        </button>
      </div>
    </div>
  );
}
