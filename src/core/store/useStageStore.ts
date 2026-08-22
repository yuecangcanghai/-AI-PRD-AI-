import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Stage, StageInfo, getInitialStages, STAGE_ORDER } from '../types/stage';

// Hard ceiling on assistant turns within a single stage.
// Raised to 5 to allow deeper 5-Why probing and real-scene survey (see PromptBuilder).
export const MAX_TURNS_PER_STAGE = 5;

interface StageState {
  stages: StageInfo[];
  currentStage: Stage;
  turnsAtStage: number;
  advanceStage: () => void;
  forceAdvance: () => void; // advance regardless of canAdvance; used at turn ceiling
  setCurrentStage: (stage: Stage) => void;
  completeCurrentStage: () => void;
  incrementTurn: () => void;
  resetTurnsAtStage: () => void;
  resetStages: () => void;
}

export const useStageStore = create<StageState>()(
  persist(
    (set, get) => ({
      stages: getInitialStages(),
      currentStage: Stage.PainPointDiscovery,
      turnsAtStage: 0,
      advanceStage: () => {
        const { currentStage } = get();
        const currentIndex = STAGE_ORDER.indexOf(currentStage);
        if (currentIndex >= STAGE_ORDER.length - 1) return;

        const nextStage = STAGE_ORDER[currentIndex + 1];
        set((state) => ({
          currentStage: nextStage,
          turnsAtStage: 0,
          stages: state.stages.map((s) => {
            if (s.id === currentStage) return { ...s, status: 'completed' as const };
            if (s.id === nextStage) return { ...s, status: 'active' as const };
            return s;
          }),
        }));
      },
      forceAdvance: () => {
        // Identical to advanceStage but explicit in name; kept separate so callers
        // signal they are bypassing the canAdvance gate at the turn ceiling.
        get().advanceStage();
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
      incrementTurn: () => set((s) => ({ turnsAtStage: s.turnsAtStage + 1 })),
      resetTurnsAtStage: () => set({ turnsAtStage: 0 }),
      resetStages: () =>
        set({ stages: getInitialStages(), currentStage: Stage.PainPointDiscovery, turnsAtStage: 0 }),
    }),
    { name: 'productforge-stages' },
  ),
);
