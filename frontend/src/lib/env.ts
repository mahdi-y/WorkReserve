/* eslint-disable @typescript-eslint/no-explicit-any */
export const getEnv = (key: string): string | undefined => {
  const metaEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined) as Record<string, any> | undefined;
  const val = metaEnv?.[key] ?? (process?.env as any)?.[key];
  if (val === undefined || val === null) return undefined;
  return String(val);
};