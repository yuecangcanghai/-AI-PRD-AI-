export enum Stage {
  PainPointDiscovery = 'pain_point_discovery',
  CriticalValidation = 'critical_validation',
  FieldResearch = 'field_research',
  UserGroupAnalysis = 'user_group_analysis',
  RequirementsDecomposition = 'requirements_decomposition',
  SolutionMirror = 'solution_mirror',
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
  Stage.FieldResearch,
  Stage.UserGroupAnalysis,
  Stage.RequirementsDecomposition,
  Stage.SolutionMirror,
  Stage.PRDGeneration,
];

export const STAGE_LABELS: Record<Stage, string> = {
  [Stage.PainPointDiscovery]: '痛点发现',
  [Stage.CriticalValidation]: '批判验证',
  [Stage.FieldResearch]: '现场调研',
  [Stage.UserGroupAnalysis]: '用户群体',
  [Stage.RequirementsDecomposition]: '需求拆解',
  [Stage.SolutionMirror]: '方案照妖镜',
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
