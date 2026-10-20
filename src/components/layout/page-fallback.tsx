import { Skeleton } from '../ui/skeleton';

export const PageFallback = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-48 w-full" />
  </div>
);
