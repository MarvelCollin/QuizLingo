import { House, Layers } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/practice', label: 'Practice', icon: Layers, end: false },
] as const;
