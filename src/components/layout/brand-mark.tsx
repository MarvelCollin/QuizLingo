import { Link } from 'react-router';

export const BrandMark = () => (
  <Link to="/" className="inline-flex min-h-11 items-center gap-2.5 rounded-sm text-ink" aria-label="QuizLingo home">
    <img src="/favicon.svg" alt="" width={30} height={30} className="size-7.5" />
    <span className="text-lg font-bold tracking-tight">QuizLingo</span>
  </Link>
);
