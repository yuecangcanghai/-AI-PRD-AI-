import { useState } from 'react';
import { StructuredCard as StructuredCardType } from '../../core/types/chat';

interface Props {
  card: StructuredCardType;
  onSubmit: (values: Record<string, string>) => void;
}

export function StructuredCard({ card, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(card.fields.map((f) => [f.key, f.value || '']))
  );

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <div className="bg-[#16213e] border border-[#2d2d44] rounded-lg mt-2 p-3.5 max-w-[85%]">
      <div className="text-[#4ecdc4] text-xs font-bold mb-2.5">📋 {card.title}</div>
      <div className="flex flex-col gap-2">
        {card.fields.map((field) => (
          <div key={field.key}>
            <label className="text-gray-400 text-xs block mb-0.5">{field.label}</label>
            {field.type === 'select' ? (
              <select
                className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-xs px-2.5 py-1.5 rounded"
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                disabled={card.submitted}
              >
                <option value="">请选择</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-xs px-2.5 py-1.5 rounded resize-none"
                rows={2}
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                disabled={card.submitted}
              />
            ) : (
              <input
                type={field.type}
                className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-xs px-2.5 py-1.5 rounded"
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                disabled={card.submitted}
              />
            )}
          </div>
        ))}
      </div>
      {!card.submitted && (
        <button
          onClick={handleSubmit}
          className="mt-2.5 bg-[#4ecdc4] text-black text-xs font-bold px-4 py-1.5 rounded hover:bg-[#3dbdb5] transition-colors"
        >
          提交
        </button>
      )}
    </div>
  );
}
