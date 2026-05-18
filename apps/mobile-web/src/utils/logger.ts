/**
 * Logger - silent in production, verbose in dev.
 */
const isDev = import.meta.env.DEV;

export const logger = {
  log:   (...args: unknown[]) => { if (isDev) console.log(...args); },
  warn:  (...args: unknown[]) => { if (isDev) console.warn(...args); },
  info:  (...args: unknown[]) => { if (isDev) console.info(...args); },
  error: (...args: unknown[]) => { if (isDev) console.error(...args); },
};
