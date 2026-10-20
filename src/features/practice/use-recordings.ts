import { useEffect } from 'react';
import { useAudioIndex } from '../study/use-study-data';
import { registerRecordings } from './speech';

export const useRecordings = () => {
  const index = useAudioIndex();
  useEffect(() => {
    if (index.data) registerRecordings(index.data);
  }, [index.data]);
};
