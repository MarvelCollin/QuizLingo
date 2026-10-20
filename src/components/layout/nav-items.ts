import { BookOpen, ClipboardCheck, House, Layers, Route } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: House, end: true, match: [] },
  { to: '/basics', label: 'Basics', icon: Route, end: false, match: ['/basics'] },
  { to: '/practice', label: 'Practice', icon: Layers, end: false, match: ['/practice'] },
  { to: '/tests', label: 'Tests', icon: ClipboardCheck, end: false, match: ['/tests'] },
  { to: '/words', label: 'Library', icon: BookOpen, end: false, match: ['/words', '/characters', '/grammar'] },
] as const;

export const isNavActive = (item: (typeof NAV_ITEMS)[number], pathname: string) =>
  item.end ? pathname === item.to : item.match.some((path) => pathname === path || pathname.startsWith(`${path}/`));
