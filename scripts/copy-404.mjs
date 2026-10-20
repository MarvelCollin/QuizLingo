import { copyFileSync } from 'node:fs';

copyFileSync('dist/quizlingo/index.html', 'dist/404.html');
console.log('Copied dist/quizlingo/index.html to dist/404.html');
