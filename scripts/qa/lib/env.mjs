import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const qaDir = join(here, '..');

/** Подхватывает scripts/qa/.env.local, не перетирая уже заданные переменные. */
export function loadQaEnv() {
  const file = join(qaDir, '.env.local');
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function qaConfig() {
  loadQaEnv();
  return {
    baseUrl: (process.env.QA_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, ''),
    browserDir: process.env.QA_BROWSER_DIR || '/home/user/ui_shot',
    email: process.env.QA_EMAIL || '',
    password: process.env.QA_PASSWORD || '',
    outDir: process.env.QA_OUT || '/tmp/aethelia-qa-out',
  };
}
