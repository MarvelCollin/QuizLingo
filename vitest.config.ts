import react from '@vitejs/plugin-react';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

const database = `file:${join(tmpdir(), `quizlingo-test-${process.pid}.db`).replace(/\\/g, '/')}`;

const logicTests = [
  'tests/web/basics.test.ts',
  'tests/web/pinyin.test.ts',
  'tests/web/sounds.test.ts',
  'tests/web/weak-spots.test.ts',
];

export default defineConfig({
  base: '/quizlingo/',
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'web',
          environment: 'jsdom',
          include: ['tests/web/**/*.test.{ts,tsx}'],
          exclude: logicTests,
          setupFiles: ['tests/setup-web.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'logic',
          environment: 'node',
          include: logicTests,
        },
      },
      {
        extends: true,
        test: {
          name: 'api',
          environment: 'node',
          include: ['tests/api/**/*.test.ts'],
          env: { TURSO_DATABASE_URL: database },
          fileParallelism: false,
        },
      },
      {
        extends: true,
        test: {
          name: 'data',
          environment: 'node',
          include: ['tests/data/**/*.test.ts'],
          testTimeout: 60000,
        },
      },
    ],
  },
});
