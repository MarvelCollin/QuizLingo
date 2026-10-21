import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { setGuestMode } from '../../lib/http';
import { fetchMe, login, logout, register } from './api';
import type { User } from './types';

export const sessionKey = ['session'] as const;

const loadSession = async () => {
  const user = await fetchMe();
  setGuestMode(user === null);
  return user;
};

const signedIn = (client: QueryClient, user: User) => {
  setGuestMode(false);
  client.removeQueries({ predicate: (query) => query.queryKey[0] !== sessionKey[0] });
  client.setQueryData(sessionKey, user);
};

export const useSession = () => useQuery({ queryKey: sessionKey, queryFn: loadSession, staleTime: 5 * 60 * 1000 });

export const useIsGuest = () => useSession().data === null;

export const useLogin = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: login, onSuccess: (user) => signedIn(client, user) });
};

export const useRegister = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: register, onSuccess: (user) => signedIn(client, user) });
};

export const useLogout = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setGuestMode(true);
      client.clear();
      client.setQueryData(sessionKey, null);
    },
  });
};
