import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else files.push(path);
  }
};
walk(DIST);

const secrets = Object.entries(process.env)
  .filter(([key, value]) => /TURSO|SECRET|TOKEN|PASSWORD|DATABASE_URL/i.test(key) && value && value.length >= 8)
  .map(([key, value]) => ({ key, value }));

const patterns = [
  { name: 'libsql database URL', regex: /libsql:\/\/[\w.-]+/ },
  { name: 'JWT style token', regex: /eyJ[\w-]{10,}\.eyJ[\w-]{10,}\.[\w-]{10,}/ },
  { name: 'TURSO_ variable name', regex: /TURSO_[A-Z_]+/ },
];

const problems = [];
for (const file of files) {
  if (/\.(png|jpe?g|webp|avif|ico|woff2?)$/.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const { key, value } of secrets) {
    if (text.includes(value)) problems.push(`${file}: contains the value of ${key}`);
  }
  for (const { name, regex } of patterns) {
    if (regex.test(text)) problems.push(`${file}: contains a ${name}`);
  }
}

if (problems.length > 0) {
  console.error('Secret check failed. These files would be public:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`Secret check passed: ${files.length} files in ${DIST}/ hold no secrets.`);
