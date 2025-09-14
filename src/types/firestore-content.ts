// Centralized Firestore content types & helpers
import { z } from 'zod';

// Schemas (expand as needed)
export const courseSchema = z.object({
  title: z.string().optional().default('Untitled Course'),
  slug: z.string().optional(), // made optional; we will derive if missing
  description: z.string().default(''),
  difficulty: z.string().optional(),
  duration: z.string().optional(),
  heroImage: z.string().optional(), // relaxed: allow any string (no strict URL requirement)
  year: z.number().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  icon: z.string().optional(),
  // NEW: optional semesters/modules (lenient)
  semesters: z.array(z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    modules: z.array(z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      summary: z.string().optional(),
      resources: z.object({
        lesson: z.object({
          title: z.string().optional(),
          url: z.string().optional(),
          size: z.string().optional(),
        }).nullable().optional(),
        exercises: z.array(z.object({
          title: z.string().optional(),
          url: z.string().optional(),
        })).optional(),
        pastExams: z.array(z.object({
          title: z.string().optional(),
          url: z.string().optional(),
        })).optional(),
      }).optional(),
    })).optional(),
  })).optional(),
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
  logoUrl: z.string().optional(), // relaxed (remove .url())
  logoStoragePath: z.string().optional(),
  highlights: z.array(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  board: z.array(z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    avatar: z.string().optional(), // relaxed
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
    imagePath: z.string().optional(),
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
  imagePath: z.string().optional(),
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

// Helper slugify for lenient fallback when slug missing
export function slugify(title?: string, id?: string) {
  if (!title) return id || '';
  return title.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
}
