// Only same-site paths are allowed after sign in, so ?next= cannot send people to another site
export const safeNext = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
