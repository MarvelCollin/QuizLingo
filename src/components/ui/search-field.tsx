import { Search } from 'lucide-react';
import { useId, useState } from 'react';
import { useDebouncedCallback } from '../../lib/use-debounced-callback';
import { cn } from '../../lib/utils';
import type { SearchFieldProps } from './ui.types';

export const SearchField = ({ label, value, onChange, placeholder, isLabelVisible = false, className }: SearchFieldProps) => {
  const id = useId();
  const [text, setText] = useState(value);
  const send = useDebouncedCallback(onChange);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={isLabelVisible ? 'text-sm font-semibold text-ink' : 'sr-only'}>
        {label}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          strokeWidth={1.75}
        />
        <input
          id={id}
          type="search"
          value={text}
          placeholder={placeholder}
          onChange={(event) => {
            setText(event.target.value);
            send(event.target.value);
          }}
          className="min-h-11 w-full rounded-md border border-line/70 bg-bg pr-3 pl-9 text-base text-ink placeholder:text-muted/80 hover:border-line [&::-webkit-search-cancel-button]:hidden"
        />
      </div>
    </div>
  );
};
