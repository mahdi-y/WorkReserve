/* eslint-disable @typescript-eslint/no-explicit-any */
export function getEnv(key: string, fallback?: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as any).import &&
    (globalThis as any).import.meta &&
    (globalThis as any).import.meta.env &&
    (globalThis as any).import.meta.env[key]
  ) {
    return (globalThis as any).import.meta.env[key];
  }
  return fallback ?? '';
}