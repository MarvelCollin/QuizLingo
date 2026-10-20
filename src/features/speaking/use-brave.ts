import { useEffect, useState } from 'react';
import { detectBrave } from './recognition';

export const useBrave = () => {
  const [isBrave, setIsBrave] = useState(false);
  useEffect(() => {
    let isCurrent = true;
    void detectBrave().then((found) => isCurrent && setIsBrave(found));
    return () => {
      isCurrent = false;
    };
  }, []);
  return isBrave;
};
