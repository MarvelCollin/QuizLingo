import { useEffect } from 'react';

const BRAND = 'QuizLingo';

export const usePageMeta = (title: string, description?: string) => {
  useEffect(() => {
    document.title = `${title} | ${BRAND}`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
};
