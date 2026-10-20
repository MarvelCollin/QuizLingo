import { useSearchParams } from 'react-router';
import { EMPTY_FILTERS } from './constants';
import { filtersFromParams, filtersToParams } from './filter-words';
import type { WordFilters } from './types';

// Table filters live in the URL: shareable, and they survive reload and Back
export const useWordFilters = () => {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);

  const update = (change: Partial<WordFilters>) =>
    setParams(filtersToParams({ ...filters, page: 1, ...change }), { replace: true, preventScrollReset: true });

  const clearAll = () => setParams(filtersToParams({ ...EMPTY_FILTERS, sort: filters.sort, dir: filters.dir }), { replace: true });

  return { filters, update, clearAll };
};
