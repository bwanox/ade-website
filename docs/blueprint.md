# **App Name**: NexusConnect

## Core Features:

- Dynamic Navigation: Implement a fixed top navigation bar that transitions from transparent to deep navy on scroll, enhancing user experience and brand visibility.
- Interactive Hero Section: Design a full-width hero section with animated backgrounds and a motivational quote featuring an animated text reveal effect to captivate users.
- Course and Club Showcases: Create interactive grids and sliders for courses and clubs with elevated glassmorphism-style cards and animated borders, ensuring visually appealing and informative displays.
- AI-Powered News Summaries: Integrate AI tool to generate short headlines and summaries for news and announcements, providing a modern and efficient UX.
- Board Member Showcase: Display board members with circular profile photos and a 3D hover flip effect, revealing their roles and quick contact icons for better engagement.
- Emergency SOS Button: Implement a floating mustard-colored SOS button with modal support, ensuring quick access to emergency resources.
- Personalized Club Recommendations: AI tool can suggest clubs to users

## Style Guidelines:

- Primary color: Deep Navy (#0F172A) for a professional and elegant feel, reflecting trust and stability.
- Background color: White (#FFFFFF) to create a clean, minimalist aesthetic that emphasizes content.
- Accent color: Mustard (#FACC15) to inject youthful energy and highlight key interactive elements, ensuring a balanced contrast.
- Headings font: 'Space Grotesk' (sans-serif) for a modern and bold aesthetic that aligns with innovation.
- Body font: 'Inter' (sans-serif) for clean, readable text, ensuring a professional and accessible reading experience.
- Use minimalist icons from Lucide/Heroicons for a sleek and contemporary look.
- Incorporate smooth scrolling, fade-in elements, and subtle parallax background movement to create a visually engaging and premium user experience.

## Landing Hero Variant System

Implemented multi-variant hero system with runtime switcher:
- engineering (Artistic Engineering blueprint)
- cute (Playful Habitat)
- signature (Parametric Neuro‑Blueprint)
- orbital (3D Orbital Knowledge Core)

### HeroSwitcher
Component: `src/components/landing/hero-registry.tsx`
- Lazy loads non-default variants (reduces initial bundle)
- Persists user selection via `localStorage`
- Simple toggle UI (can be extended with query param `?hero=` in future)

### Shared Countdown
Files:
- Hook: `use-countdown.ts` (rAF throttled ~1s)
- Component: `countdown.tsx` (variants: engineering | cute | signature | orbital)

### Centralized Data
File: `hero-data-impl.tsx` re-exported through `hero-data.ts` for stability.
Exports:
- `baseFeatures`, `cuteFeatures`
- `baseStats`, `extendedStats`
- Types: `FeatureItem`, `StatItem`

### Future Enhancements (Backlog)
- prefers-reduced-motion guards for parallax / heavy animation layers
- Conditional mount of decorative blobs / grids offscreen for performance
- A11y audit (ARIA for decorative SVGs, color contrast re-check, heading order)
- Query param deep linking (?hero=signature) + server-side default selection
- Snapshot tests for countdown & feature card rendering
- Token normalization (Innovation / Collaborative / Future) across variants
- Expired countdown fallback label (e.g., "Launched")
- Tree-shaking verification & route-level code splitting metrics

### Performance Notes
- Heavy visual layers are isolated per variant; only active variant mounts
- Shared data + countdown minimize duplicate logic across bundles

### Migration Notes
If removing legacy imports that referenced `hero-data.ts`, ensure they point to `hero-data` (the stub re-exports implementation). Avoid importing `hero-data-impl` directly outside landing to keep refactor flexibility.