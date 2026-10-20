import { BrandMark } from '../../components/layout/brand-mark';
import type { AuthLayoutProps } from './types';
import { useWarmApp } from './use-warm-app';

// Sign in and sign up share one quiet, centered layout with the study promise beside the form on wide screens
export const AuthLayout = ({ title, intro, children, footer }: AuthLayoutProps) => {
  useWarmApp();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="hidden flex-col justify-between bg-surface px-12 py-10 lg:flex">
        <BrandMark />
        <div className="max-w-md">
          <p lang="zh-CN" className="font-hanzi text-[6rem] leading-none text-strong">
            学习
          </p>
          <p className="mt-2 text-lg text-muted">xuéxí, to study</p>
          <p className="mt-8 text-xl leading-snug font-semibold text-ink">
            All 1,000 words of HSK 3.0 levels 1 to 3, with a review schedule that brings back each word right before you
            forget it.
          </p>
        </div>
        <p className="text-sm text-muted">Word list from the HSK exam syllabus published in November 2025.</p>
      </aside>
      <main className="flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <BrandMark />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-2 text-base text-muted">{intro}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-base text-muted">{footer}</div>
        </div>
      </main>
    </div>
  );
};
