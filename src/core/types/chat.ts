export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  structuredCard?: StructuredCard;
  isStreaming?: boolean;
}

export interface StructuredCard {
  type: string;
  title: string;
  fields: CardField[];
  submitted: boolean;
}

export interface CardField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  value: string;
  options?: string[];
  required?: boolean;
}
