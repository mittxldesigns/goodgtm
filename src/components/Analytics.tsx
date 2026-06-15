"use client";

import { useEffect } from "react";

/**
 * PostHog web-traffic analytics. No-op unless NEXT_PUBLIC_POSTHOG_KEY is set
 * (configure it in Vercel project env once the PostHog account exists), so the
 * site runs fine without it and posthog-js isn't even loaded when absent.
 */
export default function Analytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    import("posthog-js").then(({ default: posthog }) => {
      if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;
      posthog.init(key, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: true,
      });
    });
  }, []);

  return null;
}
