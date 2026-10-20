import type { ReactNode } from 'react';
export type User = { id: string; email: string; name: string };

export type Credentials = { email: string; password: string };

export type Registration = Credentials & { name: string };

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type GuardProps = { children: ReactNode };

export type AuthLayoutProps = { title: string; intro: string; children: ReactNode; footer: ReactNode };
