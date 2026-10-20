import type { HskLevel } from '../vocabulary/types';
import type { MockFormat } from './mock-types';

export const MOCK_FORMATS: Record<HskLevel, MockFormat> = {
  1: {
    sections: [
      { key: 'listening', label: 'Listening', count: 20, minutes: 12 },
      { key: 'reading', label: 'Reading', count: 20, minutes: 20 },
    ],
    total: 200,
    pass: 120,
    plays: 2,
    isScoringEstimated: false,
  },
  2: {
    sections: [
      { key: 'listening', label: 'Listening', count: 25, minutes: 17 },
      { key: 'reading', label: 'Reading', count: 25, minutes: 25 },
      { key: 'writing', label: 'Writing', count: 10, minutes: 10 },
    ],
    total: 300,
    pass: 180,
    plays: 2,
    isScoringEstimated: false,
  },
  3: {
    sections: [
      { key: 'listening', label: 'Listening', count: 30, minutes: 23 },
      { key: 'reading', label: 'Reading', count: 30, minutes: 30 },
      { key: 'writing', label: 'Writing', count: 10, minutes: 20 },
    ],
    total: 300,
    pass: 180,
    plays: 2,
    isScoringEstimated: false,
  },
  4: {
    sections: [
      { key: 'listening', label: 'Listening', count: 32, minutes: 20 },
      { key: 'reading', label: 'Reading', count: 32, minutes: 30 },
      { key: 'writing', label: 'Writing', count: 6, minutes: 25 },
    ],
    total: 300,
    pass: 180,
    plays: 1,
    isScoringEstimated: true,
  },
  5: {
    sections: [
      { key: 'listening', label: 'Listening', count: 35, minutes: 25 },
      { key: 'reading', label: 'Reading', count: 35, minutes: 35 },
      { key: 'writing', label: 'Writing', count: 2, minutes: 40 },
    ],
    total: 300,
    pass: 180,
    plays: 1,
    isScoringEstimated: true,
  },
  6: {
    sections: [
      { key: 'listening', label: 'Listening', count: 40, minutes: 30 },
      { key: 'reading', label: 'Reading', count: 40, minutes: 40 },
      { key: 'writing', label: 'Writing', count: 2, minutes: 45 },
    ],
    total: 300,
    pass: 180,
    plays: 1,
    isScoringEstimated: true,
  },
  7: {
    sections: [
      { key: 'listening', label: 'Listening', count: 40, minutes: 30 },
      { key: 'reading', label: 'Reading', count: 47, minutes: 60 },
      { key: 'writing', label: 'Writing', count: 2, minutes: 55 },
    ],
    total: 300,
    pass: 180,
    plays: 1,
    isScoringEstimated: true,
  },
};
