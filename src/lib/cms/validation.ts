// Central zod schemas and validation helpers for dashboard writes.
import { z } from 'zod';

// Basic shared constraints (can be extended)
export const slugSchema = z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only');

export const clubHighlightSchema = z.object({ title: z.string().optional(), description: z.string().optional() });
export const clubEventSchema = z.object({ date: z.string().optional(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional() });
export const clubAchievementSchema = z.object({ title: z.string().optional(), description: z.string().optional(), image: z.string().optional(), year: z.union([z.number(), z.string()]).optional(), highlight: z.boolean().optional() });
export const clubContactSchema = z.object({ email: z.string().email().optional(), discord: z.string().url().optional(), instagram: z.string().url().optional(), website: z.string().url().optional(), joinForm: z.string().url().optional() });

export const clubSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema,
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  members: z.number().nonnegative().optional(),
  category: z.string().optional(),
  gradient: z.string().optional(),
  logoUrl: z.string().url().optional(),
  logoStoragePath: z.string().optional(),
  highlights: z.array(clubHighlightSchema).optional(),
  board: z.array(z.any()).optional(), // board has its own manager & schema
  events: z.array(clubEventSchema).optional(),
  achievements: z.array(clubAchievementSchema).optional(),
  contact: clubContactSchema.optional(),
});

export const courseResourceSchema = z.object({ title: z.string(), type: z.literal('pdf'), url: z.string().url(), size: z.string().optional(), path: z.string().optional() });
export const courseModuleSchema = z.object({ id: z.string(), title: z.string(), summary: z.string(), status: z.string().optional(), resources: z.object({ lesson: courseResourceSchema.nullable().optional(), exercises: z.array(courseResourceSchema).optional(), pastExams: z.array(courseResourceSchema).optional() }) });
export const courseSemesterSchema = z.object({ id: z.string(), title: z.string(), modules: z.array(courseModuleSchema) });
export const courseSchema = z.object({ title: z.string(), slug: slugSchema, description: z.string().optional(), difficulty: z.string().optional(), duration: z.string().optional(), year: z.number().optional(), heroImage: z.string().url().optional(), heroImageStoragePath: z.string().optional(), semesters: z.array(courseSemesterSchema).optional() });

export type ClubInput = z.infer<typeof clubSchema>;
export type CourseInput = z.infer<typeof courseSchema>;

export function validateOrThrow<T extends z.ZodTypeAny>(schema:T, data:unknown, context='payload') {
  const res = schema.safeParse(data);
  if (!res.success) {
    const msg = res.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Validation failed (${context}): ${msg}`);
  }
  return res.data as z.infer<T>;
}
