import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveRound } from './api';
import { statsKey } from './use-stats';

export const useSaveRound = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveRound,
    retry: 2,
    onSuccess: () => client.invalidateQueries({ queryKey: statsKey }),
  });
};
