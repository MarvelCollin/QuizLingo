import { useState, useEffect } from 'react';
import type { IWord } from '../interfaces/IWord';
import type { IFlashcard } from '../interfaces/IFlashcard';
import type { HSKLevel } from '../interfaces/HSKLevel';

export const useFlashcard = (level: HSKLevel) => {
  const [words, setWords] = useState<IWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/${level}.min.json`);
        const data: IWord[] = await response.json();
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setWords(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
      } catch (error) {
        console.error('Failed to load words:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWords();
  }, [level]);

  const currentCard: IFlashcard | null = words.length > 0 ? {
    simplified: words[currentIndex].s,
    traditional: words[currentIndex].f[0]?.t || words[currentIndex].s,
    pinyin: words[currentIndex].f[0]?.i?.y || '',
    meanings: words[currentIndex].f[0]?.m || [],
    level,
  } : null;

  const goToNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return {
    currentCard,
    currentIndex,
    totalCards: words.length,
    isFlipped,
    isLoading,
    goToNext,
    goToPrevious,
    flipCard,
  };
};
