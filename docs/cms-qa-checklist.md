# CMS Modularization QA Checklist
Date: 2025-09-06 (updated)
Scope: Admin & Club Representative dashboard managers

## 1. General
- [ ] Console shows single deprecation warning (non-prod) when importing from `./cms`.
- [ ] No TypeScript build errors (excluding known dynamic route issues pre-existing).
- [ ] All manager components render without runtime errors.

## 2. Clubs (Admin)
Create:
- [ ] Create club with required fields (name, slug, description) succeeds.
- [ ] Duplicate slug blocked with user toast.
Edit:
- [ ] Editing updates fields and persists (refresh shows changes).
- [ ] Advanced fields: add/remove highlights, events, achievements, board members.
- [ ] Board member avatar upload (crop + progress) updates image and deletes old path.
Delete:
- [ ] Deleting a club prompts confirmation and removes from list.
Images:
- [ ] Logo upload crop dialog appears; saving updates preview.
- [ ] Removing logo clears preview & stored path (manual verify in storage console optional).
Validation:
- [ ] Members field accepts number or blank, persists correctly.

## 3. Clubs (Rep)
- [ ] Club loads by ID and populates fields.
- [ ] Edit mode toggles and updates allowed fields.
- [ ] Logo upload & crop works; highlights / events modifications persist.
- [ ] Cannot modify slug (not present) – expected.

## 4. News (Admin)
Create/Edit:
- [ ] Create article with headline; summary optional.
- [ ] Edit article updates headline/summary.
Flags:
- [ ] Published toggle updates state.
- [ ] Featured toggle adds badge in list.
Delete:
- [ ] Delete prompts and removes article.

## 5. News (Club Rep)
- [ ] Articles filtered by `clubId` only.
- [ ] Create/edit/delete within club scope works.

## 6. Courses (Admin)
- [ ] Create course with unique slug.
- [ ] Duplicate slug blocked.
- [ ] Add semesters; add/remove modules.
- [ ] Upload lesson PDF; appears with View button.
- [ ] Upload multiple exercise PDFs; each appears; remove one.
- [ ] Upload past exam PDFs; remove one.
- [ ] Hero image upload shows progress, preview, and persists.
- [x] Hero image upload + crop (useImageUpload + ImageCropDialog) – verify 16:9 aspect and progress key `hero-x`
- [ ] Deleting course removes it from list.

## 7. Board (Admin)
- [ ] Required roles auto-populate placeholders.
- [ ] Add optional member & save.
- [ ] Upload member photo (progress bar) & update.
- [ ] Cannot delete required roles; can delete optional member.

## 8. Shared Type Safety
- [ ] No remaining `any[]` in manager components (scan / grep passes).
- [ ] Imports use `@/lib/cms/types` for shared types.

## 9. Performance / UX
- [ ] Crop modal cleans up object URLs after close.
- [ ] Multiple simultaneous uploads show independent progress bars.
- [ ] No layout shift when toggling advanced fields.

## 10. Regression Guard
- [ ] Public site pages (clubs listing, news, courses) still load data.
- [ ] No unexpected Firestore writes on initial dashboard load.

## 11. Shared Logic Adoption
Images / Crop:
- [x] Club logo upload + crop (useImageUpload + ImageCropDialog)
- [x] Board member avatars upload + crop (useImageUpload + ImageCropDialog)
- [x] Club Rep logo upload (useImageUpload + ImageCropDialog)
- [x] Course hero image upload + crop (useImageUpload + ImageCropDialog)

CRUD Helpers:
- [x] All managers use createWithTimestamps / updateWithTimestamp
- [x] confirmDelete wrapper replaces native confirm
- [x] Slug uniqueness helper used for clubs
- [x] Slug uniqueness helper used for courses

PDF Resources:
- [x] Shared PDF upload helper (`usePdfUpload`) handles lesson/exercise/exam uploads
- [ ] Deleting a PDF resource removes associated storage object (manual verification)

## 12. Types & Validation
- [ ] Strengthen types for timestamps (Date vs Firestore Timestamp)
- [ ] Add zod validation (optional)

## 13. Deprecation
- [x] cms.tsx replaced by compatibility barrel + warning
- [ ] Escalate warning schedule before removal

## 14. Tests
Unit:
- [ ] ensureUniqueSlug (mock Firestore)
- [ ] createWithTimestamps / updateWithTimestamp (mock Firestore)
- [x] array helpers
- [ ] confirmDelete (simulate user confirm & cancellation)
- [ ] pdfUpload (validate type/size, progress callback, replacement deletion)
- [ ] useImageUpload (mock storage + crop utils)
Integration (future):
- [ ] CRUD flows (Playwright)
- [ ] Image upload + crop + replacement
- [ ] PDF upload + removal

## 15. Accessibility
- [ ] ImageCropDialog: ARIA labels on interactive elements
- [ ] Focus trap & escape key (Radix base; verify)
- [ ] Announce upload progress (aria-live region)

## 16. Performance
- [ ] Lazy-load image cropper only when needed (dynamic import verified)
- [ ] Enforce max image dimensions before resize (planned constants)

## 17. Security
- [ ] Centralized validation for file types & size limits (images & PDFs)
- [ ] Handle orphaned storage cleanup (future cron/script)

Sign-off:
- Tester:
- Date:
- Notes:
