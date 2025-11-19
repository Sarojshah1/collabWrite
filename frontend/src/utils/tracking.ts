export type TrackingEventName =
  | "landing_view"
  | "cta_start_assignment_click"
  | "cta_see_live_demo_click"
  | "demo_play"
  | "demo_interaction"
  | "signup_complete"
  | "export_document";

export function trackEvent(name: TrackingEventName, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // Placeholder: wire this up to your analytics provider (PostHog, Plausible, etc.)
  // Example: window.analytics?.track(name, payload)
  console.debug("[trackEvent]", name, payload ?? {});
}
