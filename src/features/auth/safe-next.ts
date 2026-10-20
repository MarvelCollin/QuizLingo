export const safeNext = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
