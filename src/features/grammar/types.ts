import type { HskLevel } from '../vocabulary/types';

export type GrammarExample = { zh: string; py: string; en: string };

export type GrammarPoint = {
  id: string;
  category: string;
  group: string;
  detail: string;
  point: string;
  title: string;
  explanation: string;
  pattern: string;
  examples: GrammarExample[];
  level: HskLevel;
};

export type GrammarRowProps = { point: GrammarPoint; isOpen: boolean; onToggle: () => void };
