import { ReactNode } from 'react';

interface Props {
  title: string;
  status: 'locked' | 'active' | 'completed';
  children?: ReactNode;
  onEdit?: () => void;
  editing?: boolean;
}

export function SectionCard({ title, status, children, onEdit, editing }: Props) {
  return (
    <div
      className={`
        rounded-lg p-3 mb-3 transition-all
        ${status === 'active' ? 'border border-[#4ecdc4] bg-[#0f1a1a]' : ''}
        ${status === 'completed' ? 'border border-[#2d6b6b] bg-[#0f1a1a]' : ''}
        ${status === 'locked' ? 'border border-[#2d2d44] opacity-40' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-bold
            ${status === 'active' ? 'text-[#4ecdc4]' : ''}
            ${status === 'completed' ? 'text-[#4ecdc4]' : ''}
            ${status === 'locked' ? 'text-gray-500' : ''}
          `}
        >
          {title}
        </span>
        {status === 'active' && (
          <span className="bg-[#4ecdc4] text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
            进行中
          </span>
        )}
        {status === 'completed' && (
          <span className="text-[#4ecdc4] text-[10px]">✓ 已完成</span>
        )}
        {onEdit && status !== 'locked' && !editing && (
          <button
            onClick={onEdit}
            className="ml-2 text-gray-500 hover:text-[#4ecdc4] text-xs transition-colors"
            title="编辑此区块"
          >
            ✏️
          </button>
        )}
      </div>
      {status !== 'locked' && children}
      {status === 'locked' && (
        <p className="text-gray-600 text-xs">等待上一阶段完成...</p>
      )}
    </div>
  );
}
