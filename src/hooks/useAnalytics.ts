import { useEffect } from "react";

export function useAnalytics() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = import.meta.env.VITE_UMAMI_URL!;
    script.defer = true;
    script.dataset.websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID!; // inject env var

    // Optional: add any custom attributes if needed
    // script.dataset.hostUrl = "https://example.com";

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
}