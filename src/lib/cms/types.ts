/**
 * Central CMS domain types used by dashboard manager components.
 *
 * NOTE: We intentionally re-export the Firestore-facing parsed types from
 * `@/types/firestore-content` to avoid duplicating schema logic. Local UI
 * managers should depend on these interfaces instead of `any`.
 */

import type {
  ClubDoc as FirestoreClubDoc,
  NewsArticleDoc as FirestoreNewsArticleDoc,
  CourseDoc as FirestoreCourseDoc,
} from '@/types/firestore-content';

// Re-export Firestore derived document types (with id fields) for convenience.
export type ClubDoc = FirestoreClubDoc;
export type NewsArticleDoc = FirestoreNewsArticleDoc;
export type CourseDoc = FirestoreCourseDoc;

// --- Club related embedded shapes (mirrors loosened firestore schema) ---
export interface ClubHighlight { title?: string; description?: string; }
export interface ClubBoardMember { name?: string; role?: string; avatar?: string; avatarPath?: string; linkedin?: string; bio?: string; }
export interface ClubEvent { date?: string; title?: string; description?: string; status?: string; }
export interface ClubAchievement { title?: string; description?: string; image?: string; imagePath?: string; year?: number | string; highlight?: boolean; }
export interface ClubContact { email?: string; discord?: string; instagram?: string; website?: string; joinForm?: string; }

// --- Course related embedded shapes (more specific than zod relaxed versions) ---
export interface CourseResource { title: string; type: 'pdf'; url: string; size?: string; path?: string; }
export interface CourseModuleResources { lesson?: CourseResource | null; exercises?: CourseResource[]; pastExams?: CourseResource[]; }
export interface CourseModule { id: string; title: string; summary: string; status?: 'locked' | 'in-progress' | 'validated'; resources: CourseModuleResources; }
export interface CourseSemester { id: string; title: string; modules: CourseModule[]; }

// Utility narrowers (runtime guards) – kept lightweight to avoid extra deps.
export function isCourseSemester(value: unknown): value is CourseSemester {
  return !!value && typeof value === 'object' && 'id' in (value as any) && 'modules' in (value as any);
}

export function isCourseModule(value: unknown): value is CourseModule {
  return !!value && typeof value === 'object' && 'id' in (value as any) && 'resources' in (value as any);
}

// Generic list helpers (can be imported directly by managers)
export function updateArrayItem<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}
export function removeArrayItem<T>(list: T[], index: number): T[] { return list.filter((_, i) => i !== index); }

// Additional shared utilities (Phase 2 incremental extraction)
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/** Ensure slug uniqueness inside a collection; returns true if available. */
export async function ensureUniqueSlug(collectionName: string, slug: string, editingId?: string): Promise<boolean> {
  if (!slug) return false;
  const q = query(collection(db, collectionName), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return true;
  if (snap.docs.length === 1 && snap.docs[0].id === editingId) return true;
  return false;
}

/** Create a document with createdAt/updatedAt timestamps. Returns doc ref id. */
export async function createWithTimestamps<T extends Record<string, any>>(collectionName: string, data: T) {
  const base = { ...data, createdAt: new Date(), updatedAt: new Date() };
  const ref = await addDoc(collection(db, collectionName), base);
  return ref.id;
}

/** Update a document and patch updatedAt. */
export async function updateWithTimestamp<T extends Record<string, any>>(collectionName: string, id: string, data: Partial<T>) {
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: new Date() });
}

/** Simple wrapper standardizing delete confirmation (temporary: native confirm). */
export async function confirmDelete(message: string, action: () => Promise<void> | void) {
  if (typeof window === 'undefined') return;
  if (confirm(message)) await action();
}
