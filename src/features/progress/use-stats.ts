import { useQuery } from '@tanstack/react-query';
import { fetchStats } from './api';

export const statsKey = ['stats'] as const;

export const useStats = () => useQuery({ queryKey: statsKey, queryFn: fetchStats });
