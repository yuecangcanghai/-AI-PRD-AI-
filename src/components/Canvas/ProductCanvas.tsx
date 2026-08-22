import { useState } from 'react';
import { usePRDStore } from '../../core/store/usePRDStore';
import { useStageStore } from '../../core/store/useStageStore';
import { Stage } from '../../core/types/stage';
import { SectionCard } from './SectionCard';
import { orchestrator } from '../../core/orchestrator/Orchestrator';
import {
  PainPointsEditor,
  ValidationEditor,
  UserGroupsEditor,
  RequirementsEditor,
  FinalPRDEditor,
} from './SectionEditors';

export function ProductCanvas() {
  const { prd } = usePRDStore();
  const { currentStage } = useStageStore();
  const progress = orchestrator.getProgress();
  const [editing, setEditing] = useState<Stage | null>(null);

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

  // After a section is saved, offer to auto-cascade regeneration of downstream sections.
  const handleSaved = (fromStage: Stage) => {
    setEditing(null);
    if (fromStage === Stage.PRDGeneration) return; // no downstream
    const ok = window.confirm(
      '已保存。是否根据本次修改自动重新生成下游内容？\n\n注意：这会覆盖已有的下游数据并消耗 API 额度。',
    );
    if (ok) {
      orchestrator.regenerateDownstream(fromStage);
    }
  };

  return (
    <div className="w-[420px] flex flex-col bg-[#0a0a14] border-l border-[#2d2d44]">
      <div className="p-3 px-4 border-b border-[#2d2d44] flex items-center justify-between">
        <span className="text-white font-bold text-sm">📄 产品方案</span>
        <span className="text-[#4ecdc4] text-xs">完成度 {Math.round(progress)}%</span>
      </div>

      <div className="h-1 bg-[#1a1a2e]">
        <div
          className="h-full bg-[#4ecdc4] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <SectionCard
          title="1. 痛点描述"
          status={getSectionStatus(Stage.PainPointDiscovery)}
          editing={editing === Stage.PainPointDiscovery}
          onEdit={prd.painPoints.length > 0 ? () => setEditing(Stage.PainPointDiscovery) : undefined}
        >
          {editing === Stage.PainPointDiscovery ? (
            <PainPointsEditor onCancel={() => setEditing(null)} onSaved={() => handleSaved(Stage.PainPointDiscovery)} />
          ) : (
            prd.painPoints.map((pp, i) => (
              <div key={i} className="text-gray-300 text-xs leading-relaxed mb-2">
                <p>{pp.description}</p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className="bg-[#1a2e2e] text-[#4ecdc4] text-[10px] px-2 py-0.5 rounded">{pp.frequency}</span>
                  <span className="bg-[#1a2e2e] text-[#4ecdc4] text-[10px] px-2 py-0.5 rounded">{pp.severity}</span>
                  <span className="bg-[#1a2e2e] text-[#4ecdc4] text-[10px] px-2 py-0.5 rounded">{pp.affectedPeople}</span>
                </div>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard
          title="2. 痛点验证"
          status={getSectionStatus(Stage.CriticalValidation)}
          editing={editing === Stage.CriticalValidation}
          onEdit={prd.validation.conclusion ? () => setEditing(Stage.CriticalValidation) : undefined}
        >
          {editing === Stage.CriticalValidation ? (
            <ValidationEditor onCancel={() => setEditing(null)} onSaved={() => handleSaved(Stage.CriticalValidation)} />
          ) : (
            prd.validation.conclusion && (
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
            )
          )}
        </SectionCard>

        <SectionCard
          title="3. 用户群体"
          status={getSectionStatus(Stage.UserGroupAnalysis)}
          editing={editing === Stage.UserGroupAnalysis}
          onEdit={prd.userGroups.personas.length > 0 ? () => setEditing(Stage.UserGroupAnalysis) : undefined}
        >
          {editing === Stage.UserGroupAnalysis ? (
            <UserGroupsEditor onCancel={() => setEditing(null)} onSaved={() => handleSaved(Stage.UserGroupAnalysis)} />
          ) : (
            <>
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
            </>
          )}
        </SectionCard>

        <SectionCard
          title="4. 需求拆解"
          status={getSectionStatus(Stage.RequirementsDecomposition)}
          editing={editing === Stage.RequirementsDecomposition}
          onEdit={prd.requirements.features.length > 0 ? () => setEditing(Stage.RequirementsDecomposition) : undefined}
        >
          {editing === Stage.RequirementsDecomposition ? (
            <RequirementsEditor onCancel={() => setEditing(null)} onSaved={() => handleSaved(Stage.RequirementsDecomposition)} />
          ) : (
            <>
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
            </>
          )}
        </SectionCard>

        <SectionCard
          title="5. 完整 PRD"
          status={getSectionStatus(Stage.PRDGeneration)}
          editing={editing === Stage.PRDGeneration}
          onEdit={prd.finalPRD ? () => setEditing(Stage.PRDGeneration) : undefined}
        >
          {editing === Stage.PRDGeneration ? (
            <FinalPRDEditor onCancel={() => setEditing(null)} onSaved={() => handleSaved(Stage.PRDGeneration)} />
          ) : (
            prd.finalPRD && (
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
            )
          )}
        </SectionCard>
      </div>
    </div>
  );
}
