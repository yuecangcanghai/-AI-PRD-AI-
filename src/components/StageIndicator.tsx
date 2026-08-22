import { useStageStore } from '../core/store/useStageStore';
import { STAGE_LABELS, STAGE_ORDER } from '../core/types/stage';

export function StageIndicator() {
  const { stages } = useStageStore();

  return (
    <div className="flex items-center gap-1.5 px-5 py-2 bg-[#16213e] overflow-x-auto">
      {stages.map((stage, index) => {
        const isActive = stage.status === 'active';
        const isCompleted = stage.status === 'completed';

        return (
          <div key={stage.id} className="flex items-center gap-1.5">
            <div
              className={`
                px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all
                ${isActive ? 'bg-[#4ecdc4] text-black font-bold' : ''}
                ${isCompleted ? 'bg-[#2d6b6b] text-[#4ecdc4]' : ''}
                ${!isActive && !isCompleted ? 'bg-[#2d2d44] text-gray-500' : ''}
              `}
            >
              {isCompleted && '✓ '}{index + 1}. {STAGE_LABELS[stage.id]}
            </div>
            {index < STAGE_ORDER.length - 1 && (
              <span className={`text-xs ${isCompleted ? 'text-[#4ecdc4]' : 'text-gray-600'}`}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
