/**
 * Extract the origin from the request's headers.
 */
export async function getOrigin(): Promise<string> {
  if (process.env.APP_ENV === "test") {
    return "http://localhost:3000";
  }

  const { headers } = await import("next/headers");

  const h = await headers();

  const detectedHost = h.get("x-forwarded-host");
  const detectedProtocol = h.get("x-forwarded-proto") ?? "https";

  const url = new URL(`${detectedProtocol}://${detectedHost}`);

  // remove trailing slash
  const sanitizedUrl = url.toString().replace(/\/$/, "");

  return sanitizedUrl;
}

export async function isProductionEnvironment(): Promise<boolean> {
  const host = await getOrigin();
  return host.includes("forms-formulaires") && host.includes("canada.ca");
}

// Strip trailing slashes from HOST_URL to avoid issues with CORS and other origin checks.
export const allowedOrigin = process.env.HOST_URL?.trim().replace(/\/+$/, "");
