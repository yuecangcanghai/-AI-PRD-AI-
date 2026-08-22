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
