// Centralized Firestore content types & helpers
import { z } from 'zod';

// Schemas (expand as needed)
export const courseSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().default(''),
  difficulty: z.string().optional(),
  duration: z.string().optional(),
  heroImage: z.string().url().optional(),
  year: z.number().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  icon: z.string().optional(),
});
export type CourseDoc = z.infer<typeof courseSchema> & { id: string };

export const clubSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  members: z.number().optional(),
  category: z.string().optional(),
  gradient: z.string().optional(),
  logoUrl: z.string().url().optional(),
  logoStoragePath: z.string().optional(),
  highlights: z.array(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  board: z.array(z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    avatar: z.string().url().optional(),
    avatarPath: z.string().optional(),
  })).optional(),
  events: z.array(z.object({
    date: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
  })).optional(),
  achievements: z.array(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    year: z.union([z.number(), z.string()]).optional(),
    highlight: z.boolean().optional(),
  })).optional(),
  contact: z.object({
    email: z.string().optional(),
    discord: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().optional(),
    joinForm: z.string().optional(),
  }).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  icon: z.string().optional(),
});
export type ClubDoc = z.infer<typeof clubSchema> & { id: string };

export const newsArticleSchema = z.object({
  headline: z.string(),
  summary: z.string().optional(),
  category: z.string().optional(),
  image: z.string().url().optional(),
  hint: z.string().optional(),
  readTime: z.string().optional(),
  trending: z.boolean().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  publishedAt: z.any().optional(), // Firestore Timestamp or Date
  content: z.string().optional(), // full article body (markdown / rich text serialized)
  clubId: z.string().optional(),
});
export type NewsArticleDoc = z.infer<typeof newsArticleSchema> & { id: string };

// Simple Firestore error translator for user-facing messages
export function translateFirestoreError(code?: string, offline = false): string {
  if (offline) return 'You appear offline. Reconnect and retry.';
  switch (code) {
    case 'permission-denied': return 'Permission denied. Please check your access.';
    case 'unavailable': return 'Service temporarily unavailable. Retrying...';
    case 'deadline-exceeded': return 'Network timeout. Retrying...';
    case 'failed-precondition': return 'Missing index or precondition failed.';
    case 'not-found': return 'Content not found.';
    default: return 'Failed to load data.';
  }
}

export function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
