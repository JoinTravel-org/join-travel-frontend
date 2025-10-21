/**
 * Privacy-conscious analytics utilities (no-op by default).
 * Enable by setting:
 *  - VITE_ENABLE_ANALYTICS=true
 *  - VITE_ANALYTICS_DOMAIN=<your-domain> (e.g., jointravel.com)
 *
 * When enabled, this will lazy-load Plausible's lightweight script and expose:
 *  - initAnalytics()
 *  - trackEvent(name, props?)
 *  - trackPageview()
 *
 * All functions safely no-op if disabled or unavailable (won't break in dev).
 */

type Props = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void;
  }
}

const ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const DOMAIN = (import.meta.env.VITE_ANALYTICS_DOMAIN || '').trim();

let initialized = false;

export const initAnalytics = (): void => {
  if (!ENABLED || !DOMAIN || typeof document === 'undefined' || initialized) return;

  // Prevent double init if script is already present
  if (document.querySelector('script[data-analytics="plausible"]')) {
    initialized = true;
    return;
  }

  const script = document.createElement('script');
  script.setAttribute('data-analytics', 'plausible');
  script.setAttribute('defer', '');
  script.setAttribute('data-domain', DOMAIN);
  script.src = 'https://plausible.io/js/script.tagged-events.js';

  script.onload = () => {
    initialized = true;
  };

  script.onerror = () => {
    // Fail silently to avoid impacting UX
    initialized = false;
  };

  document.head.appendChild(script);
};

export const trackEvent = (name: string, props?: Props): void => {
  try {
    if (!ENABLED || !DOMAIN) return;
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible(name, props ? { props } : undefined);
    }
  } catch {
    // swallow
  }
};

export const trackPageview = (): void => {
  trackEvent('pageview');
};