import { usePRDStore } from '../../core/store/usePRDStore';
import { useChatStore } from '../../core/store/useChatStore';
import { useStageStore, MAX_TURNS_PER_STAGE } from '../../core/store/useStageStore';
import { Stage, STAGE_LABELS } from '../../core/types/stage';
import { PRDData } from '../../core/types/prd';
import { orchestrator } from '../../core/orchestrator/Orchestrator';

interface ChecklistItem {
  label: string;
  done: boolean;
}

// Checklist items mirror StageController.canAdvance() conditions — the single source of truth
// for when a stage is complete.
function getChecklist(stage: Stage, prd: PRDData): ChecklistItem[] {
  switch (stage) {
    case Stage.PainPointDiscovery:
      return [
        { label: '已描述至少一个痛点', done: prd.painPoints.length > 0 },
        {
          label: '每个痛点含频率与严重度',
          done: prd.painPoints.length > 0 && prd.painPoints.every((p) => p.description && p.frequency && p.severity),
        },
      ];
    case Stage.CriticalValidation:
      return [
        { label: '已得出验证结论', done: Boolean(prd.validation.conclusion) },
        { label: '已给出可行性评分', done: prd.validation.feasibilityScore > 0 },
      ];
    case Stage.FieldResearch:
      return [
        { label: '已完成至少一份现场调研', done: prd.sceneSurveys.length > 0 },
        {
          label: '每份调研含受访者、行为、卡点',
          done: prd.sceneSurveys.length > 0 && prd.sceneSurveys.every((s) => s.interviewee && s.observedBehavior && s.stuckPoint),
        },
      ];
    case Stage.UserGroupAnalysis:
      return [
        { label: '已创建至少一个用户画像', done: prd.userGroups.personas.length > 0 },
        { label: '已明确目标市场', done: Boolean(prd.userGroups.targetMarket) },
      ];
    case Stage.RequirementsDecomposition:
      return [
        { label: '至少 3 个 P0 核心功能', done: prd.requirements.features.filter((f) => f.priority === 'P0').length >= 3 },
        { label: '已定义 MVP 范围', done: Boolean(prd.requirements.mvpScope) },
      ];
    case Stage.SolutionMirror:
      return [
        { label: '已审查至少一个功能', done: prd.mirrorReview.length > 0 },
        {
          label: '所有 P0 功能均已审查',
          done: prd.mirrorReview.length > 0 &&
            prd.requirements.features
              .filter((f) => f.priority === 'P0')
              .every((f) => prd.mirrorReview.some((m) => m.featureName === f.name)),
        },
      ];
    case Stage.PRDGeneration:
      return [{ label: '已生成完整 PRD', done: Boolean(prd.finalPRD) }];
    default:
      return [];
  }
}

export function ChatStageChecklist() {
  const { prd } = usePRDStore();
  const { currentStage, turnsAtStage } = useStageStore();
  const { newbieGuide } = useChatStore();
  const progress = orchestrator.getProgress();
  const items = getChecklist(currentStage, prd);
  const doneCount = items.filter((i) => i.done).length;

  // Newbie guide: shown before the first professional stage.
  const guideDone = newbieGuide.done;
  const guideActive = !guideDone && newbieGuide.step >= 1;
  const guideLabel = guideDone
    ? (newbieGuide.skipped ? '已跳过' : '已完成')
    : guideActive
      ? `进行中 (${newbieGuide.step - 1}/5)`
      : '未开始';

  return (
    <div className="px-4 py-2.5 border-b border-[#2d2d44] bg-[#0d0d18]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-gray-300 text-xs font-bold">
          当前阶段：{STAGE_LABELS[currentStage]}
        </span>
        <span className="text-[#4ecdc4] text-[11px]">
          第 {turnsAtStage}/{MAX_TURNS_PER_STAGE} 轮 · {doneCount}/{items.length} · 总进度 {Math.round(progress)}%
        </span>
      </div>

      <div className="h-1 bg-[#1a1a2e] rounded mb-2 overflow-hidden">
        <div className="h-full bg-[#4ecdc4] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex flex-col gap-1">
        {/* Newbie guide entry */}
        <div className="flex items-center gap-1.5 text-[11px] mb-0.5">
          <span className={guideDone ? 'text-[#4ecdc4]' : guideActive ? 'text-yellow-400' : 'text-gray-600'}>
            {guideDone ? '✓' : guideActive ? '●' : '○'}
          </span>
          <span className={guideDone ? 'text-gray-400' : guideActive ? 'text-gray-200 font-bold' : 'text-gray-500'}>
            新手引导：{guideLabel}
          </span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]">
            <span className={item.done ? 'text-[#4ecdc4]' : 'text-gray-600'}>
              {item.done ? '✓' : '○'}
            </span>
            <span className={item.done ? 'text-gray-300' : 'text-gray-500'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
