import { useState, useEffect, useCallback } from 'react';
import type { IWord } from '../interfaces/IWord';
import type { IQuizOption } from '../interfaces/IQuizOption';
import type { IAnswer } from '../interfaces/IAnswer';
import type { HSKLevel } from '../interfaces/HSKLevel';

export const useQuiz = (level: HSKLevel) => {
  const [words, setWords] = useState<IWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<IAnswer[]>([]);
  const [options, setOptions] = useState<IQuizOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/${level}.min.json`);
        const data: IWord[] = await response.json();
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setWords(shuffled);
        setCurrentIndex(0);
        setAnswers([]);
      } catch (error) {
        console.error('Failed to load words:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWords();
  }, [level]);

  const generateOptions = useCallback((correctWord: IWord, allWords: IWord[]): IQuizOption[] => {
    const options: IQuizOption[] = [];
    const correctMeaning = correctWord.f[0]?.m[0] || '';
    
    options.push({
      text: correctMeaning,
      isCorrect: true,
    });

    const otherWords = allWords.filter(w => w.s !== correctWord.s);
    const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      const meaning = shuffled[i].f[0]?.m[0];
      if (meaning && meaning !== correctMeaning) {
        options.push({
          text: meaning,
          isCorrect: false,
        });
      }
    }

    return options.sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      const newOptions = generateOptions(words[currentIndex], words);
      setOptions(newOptions);
      setHasAnswered(false);
      setIsRevealed(false);
    }
  }, [words, currentIndex, generateOptions]);

  const currentQuestion = words.length > 0 ? {
    character: words[currentIndex].s,
    pinyin: words[currentIndex].f[0]?.i?.y || '',
    correctAnswer: words[currentIndex].f[0]?.m[0] || '',
  } : null;

  const submitAnswer = (selectedOption: string) => {
    if (hasAnswered || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const answer: IAnswer = {
      question: currentQuestion.character,
      userAnswer: selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
    };

    setAnswers([...answers, answer]);
    setHasAnswered(true);
  };

  const getCurrentAnswer = () => {
    return answers[currentIndex];
  };

  const goToNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setHasAnswered(false);
    setIsRevealed(false);
  };

  const revealAnswer = () => {
    setIsRevealed(true);
  };

  const score = {
    correct: answers.filter(a => a.isCorrect).length,
    total: answers.length,
    percentage: answers.length > 0 ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100) : 0,
  };

  return {
    currentQuestion,
    options,
    currentIndex,
    totalQuestions: words.length,
    answers,
    score,
    hasAnswered,
    isRevealed,
    isLoading,
    submitAnswer,
    goToNext,
    goToPrevious,
    resetQuiz,
    revealAnswer,
    getCurrentAnswer,
  };
};
