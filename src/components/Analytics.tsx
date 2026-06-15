"use client";

import { useEffect } from "react";

/**
 * PostHog web-traffic analytics. No-op unless NEXT_PUBLIC_POSTHOG_KEY is set, so
 * the site runs fine without it. We capture the pageview explicitly in the
 * `loaded` callback (rather than relying on auto-capture) so a single, reliable
 * $pageview fires once PostHog is initialised.
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
        capture_pageview: false, // captured explicitly below
        capture_pageleave: true,
        autocapture: true,
        loaded: (ph) => {
          (window as Window & { posthog?: unknown }).posthog = ph;
          ph.capture("$pageview");
        },
      });
    });
  }, []);

  return null;
}
