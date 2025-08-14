/* eslint-disable @typescript-eslint/no-explicit-any */
export function getEnv(key: string, fallback?: string): string {
  try {
    if (typeof process !== 'undefined' && process.env) {
      const v = process.env[`VITE_${key}`] ?? process.env[key];
      if (v !== undefined) return String(v);
    }
  } catch {
    // ignore
  }

  const metaEnv = (() => {
    try {
      return Function('return (typeof import.meta !== "undefined" ? import.meta.env : undefined)')();
    } catch {
      return undefined;
    }
  })();

  const fromMeta = metaEnv ? (metaEnv[`VITE_${key}`] ?? metaEnv[key]) : undefined;
  if (fromMeta !== undefined) return String(fromMeta);

  return fallback ?? '';
}

export default getEnv;