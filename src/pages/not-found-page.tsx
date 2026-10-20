import { ButtonLink } from '../components/ui/button';
import { BrandMark } from '../components/layout/brand-mark';
import { usePageMeta } from '../lib/use-page-meta';

const NotFoundPage = () => {
  usePageMeta('Page not found');
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-8">
      <header>
        <BrandMark />
      </header>
      <main className="flex flex-1 flex-col justify-center gap-4 py-12">
        <p lang="zh-CN" className="font-hanzi text-6xl text-strong">
          迷路了
        </p>
        <p className="text-sm text-muted">mílù le, lost the way</p>
        <h1 className="text-2xl font-bold text-ink">This page does not exist</h1>
        <p className="text-base text-muted">The link may be old or mistyped. These pages are where you can go from here.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/">Home</ButtonLink>
          <ButtonLink to="/practice" variant="secondary">
            Practice
          </ButtonLink>
          <ButtonLink to="/words" variant="secondary">
            Words
          </ButtonLink>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
