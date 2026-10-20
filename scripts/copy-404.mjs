// Vercel serves dist/404.html with HTTP status 404 for any path no rewrite or file matches.
// It is the same app shell, so the router shows the custom not found page.
import { copyFileSync } from 'node:fs';

copyFileSync('dist/quizlingo/index.html', 'dist/404.html');
console.log('Copied dist/quizlingo/index.html to dist/404.html');
