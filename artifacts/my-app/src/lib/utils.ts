// General utility functions
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge tailwind class names — used by all UI components */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function chance(probability: number): boolean {
  return Math.random() < probability;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatGp(gp: number): string {
  return formatNumber(gp) + ' GP';
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function mergeDeep<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const val = override[key];
    if (val !== undefined && val !== null) {
      result[key] = val as T[typeof key];
    }
  }
  return result;
}

/** Calculate XP/hr display string */
export function xpPerHour(xpPerAction: number, intervalMs: number): string {
  const perHour = Math.floor((xpPerAction / intervalMs) * 3_600_000);
  return formatNumber(perHour) + ' XP/hr';
}

/** Percent 0-100 → CSS width string */
export function pct(value: number): string {
  return `${clamp(value * 100, 0, 100).toFixed(2)}%`;
}

/** Pick a random element from an array */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Compress / decompress JSON saves using lz-string */
export async function compressJson(data: unknown): Promise<string> {
  const { compressToBase64 } = await import('lz-string');
  return compressToBase64(JSON.stringify(data));
}

export async function decompressJson<T>(str: string): Promise<T> {
  const { decompressFromBase64 } = await import('lz-string');
  const json = decompressFromBase64(str);
  if (!json) throw new Error('Failed to decompress save data');
  return JSON.parse(json) as T;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}


/** Компактный формат чисел: 4021 → "4 тыс", 4000000 → "4 млн" */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const fmt = (v: number) => {
    const x = Math.floor(v * 10) / 10;
    return x % 1 === 0 ? x.toFixed(0) : x.toFixed(1);
  };
  if (abs >= 1e12) return `${fmt(n / 1e12)} трлн`;
  if (abs >= 1e9)  return `${fmt(n / 1e9)} млрд`;
  if (abs >= 1e6)  return `${fmt(n / 1e6)} млн`;
  if (abs >= 1e3)  return `${fmt(n / 1e3)} тыс`;
  return Math.floor(n).toString();
}
