export const percent = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count.toLocaleString()} ${count === 1 ? one : many}`;

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export const timeAgo = (time: number, now = Date.now()) => {
  const minutes = Math.round((time - now) / 60000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour');
  return relative.format(Math.round(hours / 24), 'day');
};
