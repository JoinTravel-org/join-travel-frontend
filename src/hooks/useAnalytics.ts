import { useEffect } from "react";

export function useAnalytics() {
  useEffect(() => {
    const umamiUrl = import.meta.env.VITE_UMAMI_URL;
    const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

    if (!umamiUrl || !umamiWebsiteId) return;

    // Validate UUID format for website ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(umamiWebsiteId)) return;

    const script = document.createElement("script");
    script.src = `${umamiUrl}/script.js`;
    script.defer = true;
    script.dataset.websiteId = umamiWebsiteId;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
}
