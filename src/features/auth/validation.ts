import type { Credentials, FieldErrors, Registration } from './types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCredentials = ({ email, password }: Credentials): FieldErrors<Credentials> => ({
  ...(!EMAIL.test(email.trim()) && { email: 'Enter an email address like name@example.com.' }),
  ...(password.length === 0 && { password: 'Enter your password.' }),
});

export const validateRegistration = ({ name, email, password }: Registration): FieldErrors<Registration> => ({
  ...(name.trim().length === 0 && { name: 'Enter the name you want to see on your dashboard.' }),
  ...(name.trim().length > 60 && { name: 'Use 60 characters or fewer.' }),
  ...(!EMAIL.test(email.trim()) && { email: 'Enter an email address like name@example.com.' }),
  ...(password.length < 8 && { password: 'Use at least 8 characters.' }),
});
