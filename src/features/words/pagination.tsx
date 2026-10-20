import { Button } from '../../components/ui/button';
import type { PaginationProps } from './types';

export const Pagination = ({ page, pageSize, total, onPage }: PaginationProps) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages === 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <nav aria-label="Pages" className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted">
        {from.toLocaleString('en-US')} to {to.toLocaleString('en-US')} of {total.toLocaleString('en-US')}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
};
