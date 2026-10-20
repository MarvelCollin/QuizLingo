import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../lib/http';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: (count, error) => count < 2 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
    },
  },
});
