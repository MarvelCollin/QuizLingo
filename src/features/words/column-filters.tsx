import { ChecklistPopover } from '../../components/ui/checklist-popover';
import { SearchField } from '../../components/ui/search-field';
import { STATUS_LABELS } from '../progress/status';
import { STATUS_ORDER } from './constants';
import type { FilterProps } from './types';

export const WordFilter = ({ filters, onChange, resetKey, isLabelVisible = false }: FilterProps & { isLabelVisible?: boolean }) => (
  <SearchField
    key={`word-${resetKey}`}
    label="Filter by word"
    isLabelVisible={isLabelVisible}
    value={filters.word}
    placeholder="汉字"
    onChange={(word) => onChange({ word })}
  />
);

export const PinyinFilter = ({ filters, onChange, resetKey, isLabelVisible = false }: FilterProps & { isLabelVisible?: boolean }) => (
  <SearchField
    key={`pinyin-${resetKey}`}
    label="Filter by pinyin"
    isLabelVisible={isLabelVisible}
    value={filters.pinyin}
    placeholder="nihao"
    onChange={(pinyin) => onChange({ pinyin })}
  />
);

export const MeaningFilter = ({ filters, onChange, resetKey, isLabelVisible = false }: FilterProps & { isLabelVisible?: boolean }) => (
  <SearchField
    key={`meaning-${resetKey}`}
    label="Filter by meaning"
    isLabelVisible={isLabelVisible}
    value={filters.meaning}
    placeholder="contains"
    onChange={(meaning) => onChange({ meaning })}
  />
);

export const LevelFilter = ({ filters, onChange }: Omit<FilterProps, 'resetKey'>) => (
  <ChecklistPopover
    label="level"
    options={[1, 2, 3].map((level) => ({ value: level as 1 | 2 | 3, label: `HSK ${level}` }))}
    selected={filters.levels}
    onChange={(levels) => onChange({ levels })}
  />
);

export const StatusFilter = ({ filters, onChange }: Omit<FilterProps, 'resetKey'>) => (
  <ChecklistPopover
    label="status"
    options={STATUS_ORDER.map((status) => ({ value: status, label: STATUS_LABELS[status] }))}
    selected={filters.statuses}
    onChange={(statuses) => onChange({ statuses })}
  />
);
