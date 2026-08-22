import { useState } from 'react';
import { usePRDStore } from '../../core/store/usePRDStore';
import { PainPoint, Persona, Feature, SceneSurvey, MirrorReview, MIRROR_VERDICT_OPTIONS } from '../../core/types/prd';

// Shared styles
const inputCls =
  'w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-xs px-2 py-1 rounded outline-none focus:border-[#4ecdc4]';
const labelCls = 'text-gray-500 text-[10px] block mb-0.5';

interface EditorProps {
  onCancel: () => void;
  onSaved: () => void;
}

function EditorActions({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={onSave}
        className="bg-[#4ecdc4] text-black text-[11px] font-bold px-3 py-1 rounded hover:bg-[#3dbdb5] transition-colors"
      >
        保存
      </button>
      <button
        onClick={onCancel}
        className="bg-[#2d2d44] text-gray-300 text-[11px] px-3 py-1 rounded hover:bg-[#3d3d54] transition-colors"
      >
        取消
      </button>
    </div>
  );
}

export function PainPointsEditor({ onCancel, onSaved }: EditorProps) {
  const { prd, updatePainPoint } = usePRDStore();
  const [draft, setDraft] = useState<PainPoint[]>(prd.painPoints.map((p) => ({ ...p })));

  const patch = (i: number, key: keyof PainPoint, value: string) =>
    setDraft((d) => d.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));

  const save = () => {
    draft.forEach((p, i) => updatePainPoint(i, p));
    onSaved();
  };

  return (
    <div className="flex flex-col gap-3">
      {draft.map((p, i) => (
        <div key={i} className="border border-[#2d2d44] rounded p-2 flex flex-col gap-1.5">
          <div>
            <label className={labelCls}>痛点描述</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={p.description} onChange={(e) => patch(i, 'description', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>频率</label>
            <input className={inputCls} value={p.frequency} onChange={(e) => patch(i, 'frequency', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>严重程度</label>
            <select className={inputCls} value={p.severity} onChange={(e) => patch(i, 'severity', e.target.value)}>
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>影响人群</label>
            <input className={inputCls} value={p.affectedPeople} onChange={(e) => patch(i, 'affectedPeople', e.target.value)} />
          </div>
        </div>
      ))}
      <EditorActions onCancel={onCancel} onSave={save} />
    </div>
  );
}

export function ValidationEditor({ onCancel, onSaved }: EditorProps) {
  const { prd, setValidation } = usePRDStore();
  const [conclusion, setConclusion] = useState(prd.validation.conclusion);
  const [marketGap, setMarketGap] = useState(prd.validation.marketGap);
  const [score, setScore] = useState(String(prd.validation.feasibilityScore));

  const save = () => {
    setValidation({ conclusion, marketGap, feasibilityScore: Number(score) || 0 });
    onSaved();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <label className={labelCls}>验证结论</label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={conclusion} onChange={(e) => setConclusion(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>市场空白分析</label>
        <textarea className={`${inputCls} resize-none`} rows={2} value={marketGap} onChange={(e) => setMarketGap(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>可行性评分 (1-10)</label>
        <input className={inputCls} type="number" min={0} max={10} value={score} onChange={(e) => setScore(e.target.value)} />
      </div>
      <EditorActions onCancel={onCancel} onSave={save} />
    </div>
  );
}

export function UserGroupsEditor({ onCancel, onSaved }: EditorProps) {
  const { prd, updatePersona, addTargetMarket } = usePRDStore();
  const [targetMarket, setTargetMarket] = useState(prd.userGroups.targetMarket);
  const [draft, setDraft] = useState<Persona[]>(prd.userGroups.personas.map((p) => ({ ...p })));

  const patch = (i: number, key: keyof Persona, value: string) =>
    setDraft((d) => d.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));

  const save = () => {
    addTargetMarket(targetMarket);
    draft.forEach((p, i) => updatePersona(i, p));
    onSaved();
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelCls}>目标市场</label>
        <textarea className={`${inputCls} resize-none`} rows={2} value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} />
      </div>
      {draft.map((p, i) => (
        <div key={i} className="border border-[#2d2d44] rounded p-2 flex flex-col gap-1.5">
          <div>
            <label className={labelCls}>画像名称</label>
            <input className={inputCls} value={p.name} onChange={(e) => patch(i, 'name', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>年龄段</label>
            <input className={inputCls} value={p.age} onChange={(e) => patch(i, 'age', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>职业</label>
            <input className={inputCls} value={p.occupation} onChange={(e) => patch(i, 'occupation', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>核心需求</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={p.needs} onChange={(e) => patch(i, 'needs', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>使用场景</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={p.scenario} onChange={(e) => patch(i, 'scenario', e.target.value)} />
          </div>
        </div>
      ))}
      <EditorActions onCancel={onCancel} onSave={save} />
    </div>
  );
}

export function RequirementsEditor({ onCancel, onSaved }: EditorProps) {
  const { prd, updateFeature, setMvpScope } = usePRDStore();
  const [draft, setDraft] = useState<Feature[]>(prd.requirements.features.map((f) => ({ ...f })));
  const [mvp, setMvp] = useState(prd.requirements.mvpScope);

  const patch = (i: number, key: keyof Feature, value: string) =>
    setDraft((d) => d.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));

  const save = () => {
    draft.forEach((f, i) => updateFeature(i, f));
    setMvpScope(mvp);
    onSaved();
  };

  return (
    <div className="flex flex-col gap-3">
      {draft.map((f, i) => (
        <div key={i} className="border border-[#2d2d44] rounded p-2 flex flex-col gap-1.5">
          <div>
            <label className={labelCls}>功能名</label>
            <input className={inputCls} value={f.name} onChange={(e) => patch(i, 'name', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>优先级</label>
              <select className={inputCls} value={f.priority} onChange={(e) => patch(i, 'priority', e.target.value)}>
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={labelCls}>复杂度</label>
              <select className={inputCls} value={f.complexity} onChange={(e) => patch(i, 'complexity', e.target.value)}>
                <option value="低">低</option>
                <option value="中">中</option>
                <option value="高">高</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>功能描述</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={f.description} onChange={(e) => patch(i, 'description', e.target.value)} />
          </div>
        </div>
      ))}
      <div>
        <label className={labelCls}>MVP 范围</label>
        <textarea className={`${inputCls} resize-none`} rows={2} value={mvp} onChange={(e) => setMvp(e.target.value)} />
      </div>
      <EditorActions onCancel={onCancel} onSave={save} />
    </div>
  );
}

export function FinalPRDEditor({ onCancel, onSaved }: EditorProps) {
  const { prd, setFinalPRD } = usePRDStore();
  const [text, setText] = useState(prd.finalPRD);

  const save = () => {
    setFinalPRD(text);
    onSaved();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        className={`${inputCls} resize-none font-mono`}
        rows={12}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <EditorActions onCancel={onCancel} onSave={save} />
    </div>
  );
}

export function SceneSurveyEditor({ onCancel, onSaved }: EditorProps) {
  const { prd, updateSceneSurvey } = usePRDStore();
  const [draft, setDraft] = useState<SceneSurvey[]>(prd.sceneSurveys.map((s) => ({ ...s })));

  const patch = (i: number, key: keyof SceneSurvey, value: string) =>
    setDraft((d) => d.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));

  const save = () => {
    draft.forEach((s, i) => updateSceneSurvey(i, s));
    onSaved();
  };

  return (
    <div className="flex flex-col gap-3">
      {draft.map((s, i) => (
        <div key={i} className="border border-[#2d2d44] rounded p-2 flex flex-col gap-1.5">
          <div>
            <label className={labelCls}>受访者</label>
            <input className={inputCls} value={s.interviewee} onChange={(e) => patch(i, 'interviewee', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>时间</label>
              <input className={inputCls} value={s.time} onChange={(e) => patch(i, 'time', e.target.value)} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>地点</label>
              <input className={inputCls} value={s.place} onChange={(e) => patch(i, 'place', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>观察到的行为</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={s.observedBehavior} onChange={(e) => patch(i, 'observedBehavior', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>卡点</label>
            <input className={inputCls} value={s.stuckPoint} onChange={(e) => patch(i, 'stuckPoint', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>应对策略</label>
            <input className={inputCls} value={s.copingStrategy} onChange={(e) => patch(i, 'copingStrategy', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>原话（可选）</label>
            <input className={inputCls} value={s.directQuote || ''} onChange={(e) => patch(i, 'directQuote', e.target.value)} />
          </div>
        </div>
      ))}
      <EditorActions onCancel={onCancel} onSave={save} />
    </div>
  );
}

export function MirrorReviewEditor({ onCancel, onSaved }: EditorProps) {
  const { prd, updateMirrorReview } = usePRDStore();
  const [draft, setDraft] = useState<MirrorReview[]>(prd.mirrorReview.map((m) => ({ ...m })));

  const patch = (i: number, key: keyof MirrorReview, value: string) =>
    setDraft((d) => d.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));

  const save = () => {
    draft.forEach((m, i) => updateMirrorReview(i, m));
    onSaved();
  };

  return (
    <div className="flex flex-col gap-3">
      {draft.map((m, i) => (
        <div key={i} className="border border-[#2d2d44] rounded p-2 flex flex-col gap-1.5">
          <div>
            <label className={labelCls}>功能名</label>
            <input className={inputCls} value={m.featureName} onChange={(e) => patch(i, 'featureName', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>用户嘴上说的（更快的马）</label>
            <input className={inputCls} value={m.userSaid} onChange={(e) => patch(i, 'userSaid', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>真正目标</label>
            <input className={inputCls} value={m.realGoal} onChange={(e) => patch(i, 'realGoal', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>更简路径</label>
            <input className={inputCls} value={m.simplerPath} onChange={(e) => patch(i, 'simplerPath', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>裁决</label>
            <select className={inputCls} value={m.verdict} onChange={(e) => patch(i, 'verdict', e.target.value)}>
              {MIRROR_VERDICT_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>理由</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={m.rationale} onChange={(e) => patch(i, 'rationale', e.target.value)} />
          </div>
        </div>
      ))}
      <EditorActions onCancel={onCancel} onSave={save} />
    </div>
  );
}
