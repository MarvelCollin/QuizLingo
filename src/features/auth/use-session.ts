import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, login, logout, register } from './api';

export const sessionKey = ['session'] as const;

export const useSession = () => useQuery({ queryKey: sessionKey, queryFn: fetchMe, staleTime: 5 * 60 * 1000 });

export const useLogin = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: login, onSuccess: (user) => client.setQueryData(sessionKey, user) });
};

export const useRegister = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: register, onSuccess: (user) => client.setQueryData(sessionKey, user) });
};

export const useLogout = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      client.clear();
      client.setQueryData(sessionKey, null);
    },
  });
};
