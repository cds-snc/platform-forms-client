export type ClientErrorBoundary = "route" | "global";

type ClientErrorReport = {
  boundary: ClientErrorBoundary;
  name: string;
  message: string;
  digest?: string;
  locale?: "en" | "fr";
  formId?: string;
  step?: string;
};

const safePathSegment = /^[A-Za-z0-9_-]{1,64}$/;

export const reportClientError = (
  error: Error & { digest?: string },
  boundary: ClientErrorBoundary
) => {
  if (typeof window === "undefined") return;

  const segments = window.location.pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" || segments[0] === "fr" ? segments[0] : undefined;
  const idIndex = segments.indexOf("id");
  const formId = segments[idIndex + 1];
  const step = segments[idIndex + 2];

  const report: ClientErrorReport = {
    boundary,
    name: (error.name || "Error").slice(0, 100),
    message: (error.message || "Unknown client error").slice(0, 1000),
    ...(typeof error.digest === "string" && { digest: error.digest.slice(0, 128) }),
    ...(locale && { locale }),
    ...(idIndex >= 0 && formId && safePathSegment.test(formId) && { formId }),
    ...(idIndex >= 0 && step && safePathSegment.test(step) && { step }),
  };

  try {
    void fetch("/api/client-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Reporting must never interfere with rendering the error boundary.
  }
};
