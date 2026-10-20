import { useEffect } from 'react';

const BRAND = 'QuizLingo';

// Sets the tab title and meta description for the current screen
export const usePageMeta = (title: string, description?: string) => {
  useEffect(() => {
    document.title = `${title} | ${BRAND}`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
};
