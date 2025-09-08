"use client";
/**
 * @deprecated The monolithic dashboard CMS component was refactored into modular manager
 * components located under `./managers/*` (Sept 2025). This barrel remains ONLY for backward
 * compatibility with existing imports: `import { AdminClubManager } from './cms'`.
 *
 * It will be removed after the deprecation window (target: Q1 2026). Migrate imports to:
 *   import { AdminClubManager } from './managers';
 * or direct paths:
 *   import { AdminClubManager } from './managers/clubs-admin';
 */
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn('[cms.tsx deprecated] Use `./managers` barrel instead. This file will be removed in Q1 2026.');
}
// Temporary compatibility barrel for previously monolithic cms.tsx
// All manager components have been extracted into dedicated files under ./managers
// Importing from './cms' will continue to work until we remove this file.
export * from './managers/clubs-admin';
export * from './managers/clubs-rep';
export * from './managers/news-admin';
export * from './managers/news-rep';
export * from './managers/courses-admin';
export * from './managers/courses-rep';
export * from './managers/board-admin';