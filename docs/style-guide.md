# JoinTravel Design System and Implementation Guide

Version: 1.0.0  
Updated: 2025-10-21

This guide documents the design tokens, accessibility standards, UI components, performance budgets, and implementation rules applied to JoinTravel. It is paired with the codebase and aims to keep design and engineering aligned.

---

## 1. Brand, Voice, and Copy

- Brand: trustworthy, welcoming, adventurous.
- Voice: concise, plain language, action-oriented, inclusive.
- Headline pattern: verb + value + differentiation.  
  Example: “Explora el mundo con JoinTravel”
- CTA pattern: strong primary, optional secondary; single clear action per section.  
  Examples: “Crear cuenta”, “Comenzar gratis”, “Iniciar sesión”

---

## 2. Accessibility (WCAG 2.2 AA)

- Color contrast: text ≥ 4.5:1; icons ≥ 3:1 when conveying meaning.
- Keyboard: visible focus states for all interactives; logical tab order; no keyboard traps.
- Motion: provide “prefers-reduced-motion” fallback; disable non-essential animations.
- Landmarks: header, main, footer; include a “Skip to content” link.
- Forms: explicit labels, inline validation, aria-live for errors/status, aria-invalid on error.
- Headings: one H1 per view, descending hierarchy (H2, H3…).
- ARIA: use only when native semantics are insufficient.

---

## 3. Design Tokens

Tokens are defined in CSS vars at:
- File: src/styles/tokens.css
- HTML attribute: :root[data-theme="light|dark"]

Key tokens:

- Typography
  - --font-sans: Inter system stack
  - Fluid scale: --fs-h1, --fs-h2, --fs-h3, --fs-h4, --fs-body, --fs-small
  - Line-heights: --lh-tight, --lh-normal, --lh-relaxed
  - Weights: --fw-regular, --fw-medium, --fw-semibold, --fw-bold

- Spacing (8px scale)
  - --space-1: 4px, --space-2: 8px, --space-3: 12px, --space-4: 16px, --space-5: 24px, --space-6: 32px, --space-7: 48px, --space-8: 64px

- Radius
  - --radius-sm: 6px, --radius-md: 8px, --radius-lg: 12px, --radius-pill: 9999px

- Elevation
  - --shadow-1: 0 1px 2px rgba(0,0,0,.06), --shadow-2: 0 2px 8px rgba(0,0,0,.08), --shadow-3: 0 6px 16px rgba(0,0,0,.12)

- Motion
  - Durations: --motion-duration-fast: 150ms, --motion-duration-base: 200ms, --motion-duration-slow: 250ms
  - Easing: --motion-ease-enter, --motion-ease-standard

- Colors (light)
  - --color-bg: #f3f7fb, --color-surface: #fff
  - --color-text: #14202A, --color-text-secondary: #445B6C
  - --color-primary: #05445e, --color-primary-contrast: #fff
  - --color-accent: #189ab4 (accent only, not for body text)
  - Feedback: --color-info #0288d1, --color-success #2e7d32, --color-warning #ed6c02, --color-error #d32f2f

- Colors (dark)
  - --color-bg: #0b1220, --color-surface: #1a2027
  - --color-text: #E6EDF3, --color-text-secondary: #9FB3C8
  - --color-primary: #189ab4, --color-primary-contrast: #0b1220
  - Feedback: info #29b6f6, success #66bb6a, warning #ffa000, error #ef5350

Focus ring: --focus-ring-color varies by mode.

---

## 4. Theming and Modes

- Initial mode: system preference (prefers-color-scheme), persisted in localStorage upon toggle.
- Attribute sync: documentElement[data-theme] controls tokens.
- Meta theme-color is kept in sync to match background for better mobile UI.

Runtime sources:
- MUI theme: src/theme.ts (builds from CSS vars)
- Theme provider: src/contexts/ThemeProvider.tsx
- Toggle: src/components/ThemeToggle.tsx

---

## 5. Layout, Grid, and Container Queries

- Mobile-first: layout starts single-column, scales up.
- Page scaffolding:
  - Header (sticky), main, footer
  - Skip link before Router
- Use CSS grid via MUI sx when possible; gap from spacing tokens.
- Container queries:
  - Enable containerType (inline-size) on main layout wrappers.
  - Prefer container-based switches for complex blocks over global breakpoints.

Example:
- Home container has containerType: inline-size and uses responsive grids for hero/features.

---

## 6. Iconography

- Use MUI icons for consistency.
- Sizes: small 20, medium 24, large 40; map to tokens by context.
- Color: rely on theme color tokens (not hard-coded RGB).

---

## 7. Components

Base components should use tokens and MUI theme variants. Use consistent states: hover, focus-visible, active, disabled.

- Buttons
  - Variants: contained (primary), outlined (secondary), text
  - Padding: var(--btn-padding-y/x)
  - Radius: var(--btn-border-radius)
  - Transition: var(--btn-transition)
  - Primary on light: text color must be --color-primary-contrast

- Inputs
  - Labels always visible; avoid placeholder-as-label
  - Error state: aria-invalid="true", helper text with guidance
  - Focus: --input-focus-ring shadow

- Cards
  - Radius: --card-radius
  - Shadows: --card-shadow / hover: --card-shadow-hover

- Modals/Dialogs
  - Focus trap: provided by MUI
  - Labeling: aria-labelledby/aria-describedby

- Tables
  - Use semantic table, th scope="col", caption when needed
  - Responsive: enable horizontal scroll on narrow screens, avoid hidden columns unless necessary

- Navigation
  - Header: inline items desktop, Drawer on mobile
  - aria-controls and aria-expanded for toggle button

---

## 8. Motion and Microinteractions

- Transitions:
  - 150–250ms, easing: var(--motion-ease-standard), enter: var(--motion-ease-enter)
- prefers-reduced-motion:
  - disable transitions/animations where not essential

Examples in code:
- Card hover subtle lift
- Button color/box-shadow transitions

---

## 9. Imagery and Media

- Optimize sources:
  - Use <picture> with AVIF/WebP + PNG/JPG fallback where available.
  - Provide width/height and decoding="async" to reduce CLS.
  - Lazy-load non-critical media (loading="lazy").
  - Art-directed crops for different breakpoints when necessary.
- Icons: prefer SVG.

Implementation examples:
- Header logo: width/height, decoding="async", loading="eager", fetchpriority="high"
- Hero artwork: lazy until in viewport unless LCP target

---

## 10. Performance Budgets and Targets

- First-load budgets:
  - JavaScript ≤ 250 KB (minified, compressed)
  - CSS ≤ 100 KB (minified, compressed)
- Code splitting:
  - Route-based lazy loading in App (Login, Register, ConfirmEmail)
  - Avoid loading non-critical routes on first paint
- Fonts:
  - Inter via Google Fonts with display=swap; consider local hosting if needed
  - Preconnect googleapis/gstatic; optionally preload critical weights
- Networking:
  - Prefer HTTP/2 or HTTP/3
  - Preconnect/preload critical assets (logo, fonts)
- Core Web Vitals targets (4G simulated mid-tier):
  - LCP < 2.5s
  - CLS < 0.1
  - INP < 200ms
- Tooling:
  - Use Lighthouse to verify 90+ across Performance, Accessibility, Best Practices, SEO.

---

## 11. SEO

- Metadata:
  - Title, meta description per route where meaningful (document.title set on mount)
  - Open Graph/Twitter cards in index.html (site defaults)
  - Structured data: Organization + WebSite JSON-LD
  - Sitemap: public/sitemap.xml
  - robots.txt with sitemap link
- Content:
  - Semantic headings and landmarks
  - Descriptive alt text on images
  - Descriptive link text (avoid “haz click aquí”)

---

## 12. Analytics

- Privacy-conscious:
  - Optional Plausible analytics via env flags: VITE_ENABLE_ANALYTICS, VITE_ANALYTICS_DOMAIN
  - Lazy load script, event tracking helpers: src/utils/analytics.ts
  - Track pageview on route change, key CTA clicks

---

## 13. Testing and Validation

- Automated checks:
  - Use axe in development (optional dev dependency) to catch common a11y issues.
- Manual checks:
  - Keyboard-only navigation pass
  - Screen reader smoke test
  - Light/Dark modes
  - Reduced motion mode
  - Narrow/wide viewport (mobile/desktop)
  - Slow 4G throttling pass

---

## 14. Usage Guidelines and Examples

- Buttons:
  - Primary: use for the main page action only. One per view ideal.
  - Secondary: complementary or less prominent actions.
  - Avoid stacking more than 2 buttons together in mobile; use vertical Stack.

- Forms:
  - Validate on blur, re-validate on submit.
  - Provide helper text with actionable guidance.
  - Avoid blocking interactions with long toasts; use inline Alert.

- Cards:
  - Keep content scannable: title, 1-2 lines body, optional supporting icon.
  - Avoid deep nesting; link entire card area if primary interactive target.

---

## 15. File Map and References

- Tokens: src/styles/tokens.css
- Global base: src/index.css
- Theme: src/theme.ts
- Theme provider: src/contexts/ThemeProvider.tsx
- Context type: src/contexts/ThemeContext.tsx
- App scaffold: src/App.tsx
- Header: src/components/Header.tsx
- Footer: src/components/Footer.tsx
- Home: src/components/Home.tsx
- Login: src/components/Login.tsx
- Register: src/components/Register.tsx
- ConfirmEmail: src/components/ConfirmEmail.tsx
- Analytics utils: src/utils/analytics.ts
- SEO: index.html (+ public/sitemap.xml, public/robots.txt)

---

## 16. Roadmap

- Component library wrappers (Button, Input, Modal, Table, Card) exporting site-wide defaults
- Picture-based responsive images for hero/features with AVIF/WebP
- Axe dev helper integration
- Additional container query variants for complex compositions
- Add docs/ before-after comparisons and Lighthouse reports
