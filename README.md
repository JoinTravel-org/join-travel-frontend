# JoinTravel Frontend

## Technologies

- React
- TypeScript
- Vite
- pnpm

## How to run

### Dependencies

Install pnpm.

```bash
npm install -g pnpm
```

Install the needed dependencies.

```bash
pnpm install
```

### Execute

```bash
# Start development environment using Vite
pnpm dev

# Build app for production
pnpm build

# Preview production app with Vite
pnpm preview
```

## Docker

### Prerequisites

- Docker installed on your system.

### Using Makefile

The project includes a Makefile for easy Docker operations.

```bash
# Build the Docker image
make build

# Run the container (accessible at http://localhost:3003)
make run

# Start with Docker Compose (builds and runs)
make up

# Stop the running container
make stop

# Stop Docker Compose
make down

# Clean up the Docker image
make clean
```

### Using Docker Compose

Alternatively, you can use Docker Compose for easier management:

```bash
# Start the application (builds and runs the container)
make up

# Stop the application
make down
```

### Manual Docker Commands

If you prefer to use Docker commands directly:

```bash
# Build the image
docker build -t jointravel-front .

# Run the container
docker run -d --name jointravel-front-container -p 3003:80 jointravel-front

# Stop the container
docker stop jointravel-front-container
docker rm jointravel-front-container

# Remove the image
docker rmi jointravel-front
```


---

## Redesign Overview

This project was redesigned to deliver a modern, accessible, and performant experience while preserving brand identity. Key upgrades:
- Design tokens and cohesive theming (light/dark), WCAG AA-compliant contrast
- Mobile-first layout, semantic landmarks, skip link, visible focus
- Simplified navigation with responsive header/drawer and consistent footer
- Refined hero and cards, clear hierarchy, strong primary CTA
- Accessible forms with inline validation and helpful messages
- Performance enhancements: route-based code splitting and optimized LCP assets
- SEO: meta/OG/Twitter, JSON-LD structured data, sitemap, robots
- Privacy-conscious analytics (optional) and event tracking hooks

See the style guide for system-wide specifications and usage:
- [`docs/style-guide.md`](docs/style-guide.md)

### Where to look (key files)
- Tokens and base styles: [`src/styles/tokens.css`](src/styles/tokens.css), [`src/index.css`](src/index.css)
- MUI theme wired to tokens: [`src/theme.ts`](src/theme.ts)
- Theme context and provider: [`src/contexts/ThemeContext.tsx`](src/contexts/ThemeContext.tsx), [`src/contexts/ThemeProvider.tsx`](src/contexts/ThemeProvider.tsx)
- App scaffolding + code splitting + skip link: [`src/App.tsx`](src/App.tsx)
- Header/Footer components: [`src/components/Header.tsx`](src/components/Header.tsx), [`src/components/Footer.tsx`](src/components/Footer.tsx)
- Home (hero, features, CTA): [`src/components/Home.tsx`](src/components/Home.tsx)
- Forms (accessibility and validation): [`src/components/Login.tsx`](src/components/Login.tsx), [`src/components/Register.tsx`](src/components/Register.tsx)
- SEO: [`index.html`](index.html), [`public/sitemap.xml`](public/sitemap.xml), [`public/robots.txt`](public/robots.txt)
- Analytics utilities: [`src/utils/analytics.ts`](src/utils/analytics.ts)

## Configuration

### Theme and Modes
- Respects system preference on first load (prefers-color-scheme)
- Persists user override in localStorage
- Applies data-theme to :root so CSS variables (tokens) and MUI stay in sync

### Optional Analytics (privacy-conscious)
Set via Vite env vars (create .env or .env.local):
```
VITE_ENABLE_ANALYTICS=true
VITE_ANALYTICS_DOMAIN=jointravel.example
```
The helper will lazy-load Plausible and track route changes + CTAs:
- Init and pageviews wired in [`tsx.App()`](src/App.tsx:25)
- Custom events via [`ts.trackEvent()`](src/utils/analytics.ts:1)

## Accessibility Checklist

- Keyboard: focus visible, no traps, logical tab order
- Landmarks: header, main, footer; “Skip to content” link in [`tsx.App()`](src/App.tsx:29)
- Headings: single H1 per view; semantic structure across sections
- Forms: labels, aria-invalid on error, inline helper text, aria-live for messages
- Motion: 150–250 ms transitions with easing and prefers-reduced-motion fallback in [`css.tokens`](src/styles/tokens.css:1) and [`css.index`](src/index.css:1)
- Contrast: tokens selected to meet WCAG AA (4.5:1 for text)

Run automated and manual checks (recommended):
- Automated: add react-axe in dev or use browser Axe extension
- Manual: keyboard-only pass, screen reader smoke test, light/dark, reduced motion, mobile/desktop widths

## Performance and Budgets

Targets on simulated 4G, mid-tier device:
- LCP < 2.5 s, CLS < 0.1, INP < 200 ms
- First-load budgets: ≤ 250 KB JS, ≤ 100 KB CSS (minified + compressed)

What’s in place:
- Route-based code splitting (Login, Register, ConfirmEmail) via React.lazy in [`tsx.App()`](src/App.tsx:11)
- Reduced CLS for logo via explicit dimensions and eager loading in [`tsx.Header()`](src/components/Header.tsx:87)
- Preload critical logo and preconnect to fonts in [`index.html`](index.html:27)

Verify with Lighthouse in Chrome DevTools. Consider hosting fonts locally and adding AVIF/WebP sources for hero/illustrations as assets become available.

## SEO

- Title and meta description in [`index.html`](index.html:8)
- Open Graph and Twitter cards in [`index.html`](index.html:13)
- Structured data (Organization, WebSite) in [`index.html`](index.html:45)
- Sitemap at [`public/sitemap.xml`](public/sitemap.xml), Robots at [`public/robots.txt`](public/robots.txt)

## Success Metrics and Events

Track key interactions (if analytics enabled):
- Pageviews on route change
- CTAs on Home (hero primary/secondary, bottom CTA) instrumented in [`tsx.Home()`](src/components/Home.tsx:1)
- Form submits and validation errors (add trackEvent where needed in forms)
