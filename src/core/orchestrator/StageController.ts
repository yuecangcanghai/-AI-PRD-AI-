import { Stage, STAGE_ORDER } from '../types/stage';
import { PRDData } from '../types/prd';
import { useStageStore } from '../store/useStageStore';

export class StageController {
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

  tryAdvance(prd: PRDData, opts: { force?: boolean } = {}): boolean {
    const stageStore = useStageStore.getState();
    const currentStage = stageStore.currentStage;

    if (!opts.force && !this.canAdvance(currentStage, prd)) return false;

    stageStore.advanceStage();
    return true;
  }

  getProgress(prd: PRDData): number {
    const stageStore = useStageStore.getState();
    const currentStage = stageStore.currentStage;
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const baseProgress = (currentIndex / STAGE_ORDER.length) * 100;

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
      default:
        stageProgress = 0;
        break;
    }

    return Math.min(100, baseProgress + stageProgress);
  }
}
