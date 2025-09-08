# Dashboard CMS Modularization Migration Guide

Date: 2025-09-06
Status: In progress (Phase 2 active: shared hooks/utilities adoption – ImageCropDialog + PDF helper COMPLETE)
Deprecation Target: Q1 2026 (removal of `src/app/dashboard/cms.tsx`)

## 1. Overview
The legacy monolithic `cms.tsx` (~1400 LOC) has been refactored into focused manager components under `src/app/dashboard/managers/`. This improves maintainability, type safety, code-splitting, and future testability.

## 2. New Manager Components
Admin variants:
- `AdminClubManager`          → `./managers/clubs-admin`
- `AdminNewsManager`          → `./managers/news-admin`
- `AdminCoursesManager`       → `./managers/courses-admin`
- `AdminBoardManager`         → `./managers/board-admin`

Club representative variants:
- `ClubRepManager`            → `./managers/clubs-rep`
- `ClubRepNewsManager`        → `./managers/news-rep`
- `ClubRepCoursesManager`     → `./managers/courses-rep` (placeholder – no permissions)

## 3. Backward Compatibility
The deprecated file `src/app/dashboard/cms.tsx` now ONLY re-exports the managers and logs a console warning in non‑production builds.

Existing imports continue to work:
```ts
import { AdminClubManager } from './cms';
```
Recommended replacement:
```ts
import { AdminClubManager } from './managers';
// or direct
import { AdminClubManager } from './managers/clubs-admin';
```

## 4. Shared Types & Utilities
Centralized domain types: `src/lib/cms/types.ts`
Adopted utilities (Phase 2):
- Array helpers: `updateArrayItem`, `removeArrayItem` (DONE)
- Slug uniqueness helper: `ensureUniqueSlug` (DONE – used by clubs & courses)
- CRUD helpers: `createWithTimestamps`, `updateWithTimestamp` (DONE across managers)
- Confirm wrapper: `confirmDelete` (DONE across managers)
- Image upload hook: `useImageUpload` (DONE for club logos, board avatars, club rep logo, course hero 16:9)
- Central crop UI abstraction: `ImageCropDialog` (DONE replaces inline modals)
- PDF upload helper + hook: `pdfUpload.ts` / `usePdfUpload` (DONE for course resources – replaces bespoke logic)

## 5. Migration Steps for Developers
1. Replace imports from `./cms` with `./managers` (search: `from './cms'`).
2. Use shared types instead of `any`.
3. Replace custom array mutation snippets with `updateArrayItem` / `removeArrayItem`.
4. For slug validation, use `ensureUniqueSlug(collectionName, slug, editingId)`.
5. Use `createWithTimestamps` / `updateWithTimestamp` for Firestore writes (replaces direct `addDoc/updateDoc`).
6. Replace native `confirm()` with `confirmDelete`.
7. For images, use `useImageUpload` + `<ImageCropDialog />` (square default; pass aspect 16/9 for hero banners).
8. For course PDFs, use `usePdfUpload` (enforces type/size + progress + replacement cleanup).

## 6. Removal Timeline
| Phase | Window | Action | Status |
|-------|--------|--------|--------|
| 1 | Sept 2025 | Extraction + compatibility barrel | DONE |
| 2 | Sept–Oct 2025 | Deduplicate upload + CRUD logic + shared dialogs | ACTIVE (core utilities complete) |
| 3 | Nov–Dec 2025 | Add unit/integration tests, stricter types, a11y, constants | UPCOMING |
| 4 | Jan 2026 | Escalate deprecation warnings | UPCOMING |
| 5 | Q1 2026 | Remove `cms.tsx` | UPCOMING |

## 7. QA Checklist (See `docs/cms-qa-checklist.md`)
Covers CRUD flows, image upload/crop (logo, board avatars, hero), slug duplication, role-based access, regression items.

## 8. Completed This Phase (Since Last Update)
- Unified club slug duplication check to `ensureUniqueSlug` (removed manual Firestore query).
- Abstracted and adopted shared `ImageCropDialog` for all image crop flows.
- Migrated course hero image to `useImageUpload` (16:9 aspect enforced).
- Extracted reusable PDF upload helper (`pdfUpload.ts`) + hook; integrated into courses manager.
- Standardized progress key scheme (kind-index) across all image uploads.

## 9. Pending / Todo (Phase 2 → Phase 3)
- Add centralized image/PDF constraint constants (size limits, allowed mime types) consumed by hooks & dialogs. (PARTIAL: basic image size check added)
- Finish accessibility: announce dynamic crop dimensions & progress (basic ARIA labels added).
- Unit tests: `ensureUniqueSlug`, `createWithTimestamps`, `updateWithTimestamp`, `confirmDelete` (mock Firestore), PDF upload helper, `useImageUpload` (mock storage/crop utils).
- Integration/E2E tests for CRUD & media flows (Playwright).
- Strengthen timestamp typing (Firestore `Timestamp` vs `Date`).
- Extend zod validation coverage to board/news managers (clubs & courses done).
- Deprecation escalation plan (console → toast → build-time warning before removal) – build scan script added.
- Extract progress key constants / enums to avoid string literals.
- Aspect & size configurability: per-kind config object (logo 1:1, board 1:1, hero 16:9, generic images flexible?).
- Security/perf hardening: enforce max pixel dimensions before upload (currently only size MB check), unify compression strategy.
- Update public docs once tests + constants land.

## 10. Future Enhancements
- Replace `confirmDelete` native confirm with custom modal implementation.
- Add optimistic UI for uploads (show placeholder while uploading).
- Automatic generation of blurred placeholder (LQIP) for hero images.
- Batch delete utility for orphaned storage paths.

## 11. Questions?
Contact the platform maintainers or open an issue referencing this guide.

---
Deprecation notice emitted at runtime (non-prod) to encourage migration.
